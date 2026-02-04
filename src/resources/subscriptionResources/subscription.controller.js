import mongoose from "mongoose";
import { config } from "../../config/config.js";
import { workflowClient } from "../../upstash/upstash.config.js";
import moneyToRefund from "../../utils/moneyToRefund.js";
import calculateRePurchasePrice from "../../utils/re-purchase.js";
import calculateNewPrice from "../../utils/renew.js";
import Subscription from "../subscriptionResources/subscription.model.js";
import Usermodel from "../userResources/user.model.js";
import { sendSubscriptionCancelledMail } from "../../utils/sendSubscriptionCancelledMail.js";
import { sendMoneyRefundEmail } from "../../utils/sendMoneyRefundEmail.js";
import ConfirmationModel, { FeedbackModel } from "./confirmation.model.js";
import { sendEmailForSubscriptionPaused } from "../../utils/send-pause-email.js";
import { sendEmailForSubscriptionResume } from "../../utils/send-resume-email.js";
import { sendEmailForMassSubcriptionCancellation } from "../../utils/mass-cancellation-email.js";

export const createSubscription = async (req, res, next) => {
  try {
    const newSubscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    const { workflowRunId } = await workflowClient.trigger({
      url: `${config.LOCAL_SERVER_URL}/api/v1/workflows`,
      body: {
        subscriptionId: newSubscription._id,
      },

      headers: {
        "content-type": "application/json",
      },

      retries: 0,
    });

    console.log(`WORKFLOW ID:: ${workflowRunId}`);

    if (!newSubscription) {
      return res
        .status(500)
        .json({ success: false, message: "Subscription not created!!!" });
    }

    return res
      .status(201)
      .json({ success: true, data: { Subscription: newSubscription } });
  } catch (err) {
    const error = {};
    error.message = err.message;
    error.statusCode = 500;
    error.stack = err.stack;
    next(error);
  }
};

export const getUserSubscriptions = async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: "FORBIDDEN" });
    }

    const userSubscription = await Subscription.find({ user: req.params.id });

    return res.status(200).json({
      success: true,
      data: {
        subscription: userSubscription,
      },
    });
  } catch (err) {
    const error = {};
    error.message = err.message;
    error.statusCode = 500;
    error.stack = err.stack;
    next(error);
  }
};

export const cancelSubscription = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const subscriptionId = req.params.id;
    if (!subscriptionId) {
      throw new Error("Subscription id is required!!!");
    }

    const subscription = await Subscription.findById(subscriptionId)
      .populate("user", "name email")
      .session(session);

    const isValidSubscription =
      subscription.status === "cancel" ||
      subscription.status === "paused" ||
      subscription.status === "expired";
    if (!subscription || isValidSubscription) {
      throw new Error("Subscription cannot canceled!!!");
    }
    if (subscription.user.toString() !== req.user.id) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: "FORBIDDEN!!!" });
    }

    const canCanceled = await subscription.canCancel();

    if (!canCanceled) {
      throw new Error("Subscription can not canceled !!!");
    }

    const { reason, feedBack } = req.body;

    const isFeedbackSaved = await FeedbackModel.create(
      [
        {
          serviceProvider: subscription.service_provider,
          serviceName: subscription.package_Name,
          reason,
          feedBack,
          user: req.user.id,
        },
      ],
      { session },
    );

    if (!isFeedbackSaved) {
      console.log("Problem to Create feeback!!");
    }

    const refundCalculation = moneyToRefund(subscription.price);
    const { refundAmount } = refundCalculation;

    // email that confirm that money is refunded ...
    const isRefundSuccessed = await sendMoneyRefundEmail({
      serviceProvider: subscription.service_provider,
      serviceName: subscription.package_Name,
      refundAmount,
      timeOfRefund: new Date(),
      refundTo: subscription.user.name,
      emailTo: subscription.user.email,
      paymentMethod: subscription.paymentMethod,
    });

    // email that confirm that service provider has cancelled the subscription...
    if (!isRefundSuccessed) {
      await session.abortTransaction();
      return res
        .status(500)
        .json({ success: false, message: "Failed to Cancelled!!!" });
    }

    const subscriptionCanceled = await Subscription.findByIdAndUpdate(
      subscriptionId,
      {
        $set: {
          status: "cancel",
        },
      },
      {
        new: true,
        session,
      },
    );

    if (!subscriptionCanceled) {
      await session.abortTransaction();
      throw new Error("Unable to cancel subscription !!!");
    }

    const isCancelledSuccessed = await sendSubscriptionCancelledMail({
      serviceProvider: subscription.service_provider,
      serviceName: subscription.package_Name,
      refundTo: subscription.user.name,
      emailTo: subscription.user.email,
      message: `your service ${subscription.package_Name} has been cancelled at ${new Date()}`,
    });

    if (!isCancelledSuccessed) {
      console.log("Failed to send service cancelled email");
      await ConfirmationModel.create(
        [
          {
            serviceProvider: subscription.service_provider,
            serviceName: subscription.package_Name,
            cancelAt: new Date(),
            user: req.user.id,
            message: "Your service is cancelled!",
          },
        ],
        { session },
      );
    }

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Subscription cancelled !",
      data: {
        id: subscription._id,
        moneyToRefund: refundAmount,
      },
    });
  } catch (err) {
    const isProduction = config.NODE_ENV === "production" ? true : false;
    const error = {
      message: isProduction
        ? "Problem in cancelling subscription"
        : err.message,
      statusCode: err.statusCode || 500,
      stack: isProduction ? undefined : err.stack,
    };

    next(error);
  } finally {
    await session.endSession();
  }
};

export const pauseSubscription = async (req, res, next) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const subscriptionId = req.params.id;

    if (!subscriptionId || !mongoose.Types.ObjectId.isValid(subscriptionId)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Either no subscriptionId or invalid!!!",
      });
    }
    const subscription = await Subscription.findById(subscriptionId)
      .populate("user", "name email")
      .session(session);
    if (!subscription || !subscription.canPause()) {
      await session.abortTransaction();
      throw new Error("Subscription can not be paused");
    }

    if (subscription.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "FORBIDDEN" });
    }

    const pauseSub = await subscription.paused().session(session);

    if (!pauseSub) {
      await session.abortTransaction();
      throw new Error("Failed to paushed the subscription!!!");
    }

    const isEmailSent = await sendEmailForSubscriptionPaused({
      serviceProvider: subscription.service_provider,
      serviceName: subscription.package_Name,
      pausesUsed: pauseSub.pausesUsed,
      pausesRemaining: pauseSub.pausesRemaining,
      emailTo: subscription.user.email,
      refundTo: subscription.user.name,
    });

    if (!isEmailSent) {
      console.log("Failed to send pauses confirmation email!!");
      await ConfirmationModel.create(
        [
          {
            serviceProvider: subscription.service_provider,
            serviceName: subscription.package_Name,
            cancelAt: new Date(),
            user: subscription.user,
            message: "Your service is paused!",
          },
        ],
        { session },
      );
    }

    await session.commitTransaction();
    return res.status(200).json({
      success: true,
      message: "Subscription paused!",
      data: {
        id: subscription._id,
        status: subscription.status,
        pausesUsed: subscription.pausesUsed,
        pausesRemaining: subscription.pausesRemaining,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    const isProduction = config.NODE_ENV === "production" ? true : false;
    const error = {
      message: isProduction ? "Problem in paushing subscription" : err.message,
      statusCode: err.statusCode || 500,
      stack: isProduction ? undefined : err.stack,
    };

    next(error);
  } finally {
    await session.endSession();
  }
};

export const resumeSubscription = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const subscriptionId = req.params.id;
    if (!subscriptionId || !mongoose.Types.ObjectId.isValid(subscriptionId)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Either subcripton Id missing or invalid !!!",
      });
    }
    const subscription = await Subscription.findById(subscriptionId)
      .populate("user", "name email")
      .session(session);

    if (!subscription || subscription.canPause()) {
      await session.abortTransaction();
      throw new Error("Subscription can not resumed!!!");
    }

    if (subscription.user.toString() !== req.user.id) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: "FORBIDDEN!!!" });
    }

    const resumeSub = await subscription.resume().session(session);

    if (!resumeSub) {
      await session.abortTransaction();
      throw new Error("Problem in continuing the subscription!!!");
    }

    const isEmailSent = await sendEmailForSubscriptionResume({
      serviceProvider: subscription.service_provider,
      serviceName: subscription.package_Name,
      newRenewalsDate: resumeSub.renewalsDate,
      pauseAt: subscription.pausedAt,
      pausesUsed: subscription.pausesUsed,
      pausesRemaining: subscription.pausesRemaining,
      refundTo: subscription.user.name,
      emailTo: subscription.user.email,
    });

    if (!isEmailSent) {
      console.log("Failed to send resume confirmation!!");
      await ConfirmationModel.create(
        [
          {
            serviceProvider: subscription.service_provider,
            serviceName: subscription.package_Name,
            cancelAt: new Date(),
            user: subscription.user,
            message: "Your service is resumed!",
          },
        ],
        { session },
      );
    }

    await session.commitTransaction();
    return res.status(200).json({
      success: true,
      message: "subscription continued !!!",
      data: {
        id: subscription._id,
        status: subscription.status,
        pausesUsed: subscription.pausesUsed,
        pausesRemaining: subscription.pausesRemaining,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    const isProduction = config.NODE_ENV === "production" ? true : false;
    const error = {
      message: isProduction
        ? "Problem in cancelling subscription"
        : err.message,
      statusCode: err.statusCode || 500,
      stack: isProduction ? undefined : err.stack,
    };

    next(error);
  } finally {
    await session.endSession();
  }
};

// todo---
export const repurchaseSubscription = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const subscriptionId = req.params.id;
    if (!subscriptionId || !mongoose.Types.ObjectId.isValid(subscriptionId)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Either subcripton Id missing or invalid !!!",
      });
    }
    const subscription = await Subscription.findById(subscriptionId)
      .populate("user", "name email")
      .session(session);

    if (
      !subscription ||
      subscription.status !== "expired" ||
      subscription.status !== "cancel"
    ) {
      await session.abortTransaction();
      throw new Error("Subscription can not be repurchased");
    }

    if (subscription.user.toString() !== req.user.id) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: "FORBIDDEN!!!" });
    }

    const repurchased = await subscription.repurchase().session(session);
    if (!repurchased) {
      await session.abortTransaction();
      throw new Error("Problem in repurchasing the subscription!!!");
    }

    await session.commitTransaction();
    return res.status(200).json({
      success: true,
      message: "Re-purchased successfully!!!",
      data: {
        id: repurchased._id,
        price: calculateRePurchasePrice(repurchased.price),
      },
    });
  } catch (err) {
    await session.abortTransaction();
    const isProduction = config.NODE_ENV === "production" ? true : false;
    const error = {
      message: isProduction
        ? "Problem in repurchasing subscription"
        : err.message,
      statusCode: err.statusCode || 500,
      stack: isProduction ? undefined : err.stack,
    };

    next(error);
  } finally {
    await session.endSession();
  }
};

// todo---
export const renewSubscription = async (req, res, next) => {
  try {
    const subscriptionId = req.params.id;
    if (!subscriptionId) throw new Error("Subscription Id is required!!!");
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription || !subscription.canRenew())
      throw new Error("Subscription can not renewed!!!");

    if (subscription.user.toString() !== req.user.id)
      res.status(4033).json({ success: false, message: "FORBIDDEN!!!" });

    const { price: priceToRenew, discountPercent } = calculateNewPrice(
      subscription.price,
      subscription.renewalsDate,
    );

    return res.status(200).json({
      success: true,
      message: "Renewed Successfully!!!",
      data: {
        id: subscription._id,
        price: priceToRenew,
        discountPercent,
      },
    });
  } catch (err) {
    const isProduction = config.NODE_ENV === "production" ? true : false;
    const error = {
      message: isProduction ? "Problem in renewing subscription" : err.message,
      statusCode: err.statusCode || 500,
      stack: isProduction ? err.stack : undefined,
    };

    next(error);
  }
};

export const upcommingRenewalsSubscriptions = async (req, res, next) => {
  try {
    const user = await Usermodel.findById(req.user.id);

    if (!user)
      res.status(404).json({ success: false, message: "User not found !!!" });

    const subscriptions = await Subscription.find({
      canRenew: true,
      user: user._id,
    });

    if (!subscriptions)
      res.status(200).json({
        success: true,
        message: "No subscription for renewels!!!",
        data: { subscriptions: [] },
      });

    return res.status(200).json({
      success: true,
      message: "Got Subscriptions!",
      data: {
        subscriptions,
      },
    });
  } catch (err) {
    const isProduction = config.NODE_ENV === "production" ? true : false;
    const error = {
      message: isProduction ? "Problem in getting subscriptions" : err.message,
      statusCode: err.statusCode || 500,
      stack: isProduction ? err.stack : undefined,
    };

    next(error);
  }
};

export const cancelSubscriptions = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await Usermodel.findById(req.user.id).session(session);

    if (!user) {
      await session.abortTransaction();
      res.status(404).json({ success: false, Message: "User not found!!!" });
    }

    const allSubscriptions = await Subscription.find({
      status: "active",
      user: req.user.id,
    }).session(session);

    if (!allSubscriptions) await session.abortTransaction();
    res.status(200).message({
      success: false,
      message: "No subscription can cancelled!!!",
      data: {
        cancelSubscriptions: [{}],
        totalSubscriptionCancelled: 0,
      },
    });

    const cancelableSubscriptions = allSubscriptions.filter(
      (eachSubscription) => eachSubscription.canCancel(),
    );

    const successfulCancels = [{}];
    const unsuccessfulCancels = [{}];

    for (const sub of cancelableSubscriptions) {
      const isCancelled = await Subscription.updateOne(
        {
          _id: sub._id,
        },
        {
          $set: {
            status: "cancel",
          },
        },
        {
          session,
          new: true,
        },
      );

      if (isCancelled) {
        const costToReturn = moneyToRefund(sub.price);
        successfulCancels.push({
          serviceProvider: sub.service_provider,
          serviceName: sub.package_Name,
          price: sub.price,
          returnAmount: costToReturn,
          totalDaysServiceUsed: Math.ceil(
            (new Date(this.renewalsDate) - new Date(this.startDate)) /
              (1000 * 60 * 60 * 24),
          ),
        });
      } else
        unsuccessfulCancels.push({
          serviceProvider: sub.service_provider,
          serviceName: sub.package_Name,
        });
    }

    // ---------------------email-----------------------

    const isEmailSent = await sendEmailForMassSubcriptionCancellation({
      successfulCancellations: successfulCancels,
      unsuccessfulCancellations: unsuccessfulCancels,
      refundTo: user.name,
      emailTo: user.email,
    });

    if (!isEmailSent) {
      console.log("Failed to send mass cancellation email!!");
      // no record for it...
    }

    return res.status(200).json({
      success: true,
      message: "Successfully cancelled subscription!!!",
      data: {
        cancelSubscriptions: successfulCancels,
        totalSubscriptionCancelled: successfulCancels.length,
        failureToCancelSubscriptions: unsuccessfulCancels,
        totalSubscriptionFailedToCancelled: unsuccessfulCancels.length,
      },
    });
  } catch (err) {
    const isProduction = config.NODE_ENV === "production" ? true : false;
    const error = {
      message: isProduction
        ? "Problem in cancelling  subscriptions"
        : err.message,
      statusCode: err.statusCode || 500,
      stack: isProduction ? err.stack : undefined,
    };

    next(error);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const subscriptionId = req.params.id;
    if (!subscriptionId) throw new Error("Subscription Id is required!!!");

    const subscription = await Subscription.findById(subscriptionId);

    if (subscription.user.toString() !== req.user.id)
      res.status(403).json({ success: false, message: "FORBIDDEN!!!" });

    if (subscription.status != "cancel" || subscription.status != "expired")
      throw new Error("Subscription can not delete!!!");

    const isDeleted = await Subscription.deleteOne({ _id: subscriptionId });

    if (!isDeleted) throw new Error("Problem in deleting Subscription!!!");

    return res.status(200).json({
      success: true,
      message: "Delete Successfully!",
      data: {
        id: subscription._id,
      },
    });
  } catch (err) {
    const isProduction = config.NODE_ENV === "production" ? true : false;
    const error = {
      message: isProduction ? "Problem in delete subscription" : err.message,
      statusCode: err.statusCode || 500,
      stack: isProduction ? err.stack : undefined,
    };

    next(error);
  }
};

export const deleteSubscriptions = async (req, res, next) => {
  try {
    const user = await Usermodel.findById(req.user.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found!!!" });

    const isDeleted = await Subscription.deleteMany({
      user: req.user.id,
      status: { $in: ["expired", "cancel"] },
    });
    return res.status(200).json({
      success: true,
      messasge: "Deletes Successfully!",
      data: {
        totalDeleteCount: isDeleted.deletedCount,
      },
    });
  } catch (err) {
    const isProduction = config.NODE_ENV === "production" ? true : false;
    const error = {
      message: isProduction ? "Problem in delete subscriptions" : err.message,
      statusCode: err.statusCode || 500,
      stack: isProduction ? err.stack : undefined,
    };

    next(error);
  }
};
