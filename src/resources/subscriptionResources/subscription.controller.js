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
import { sendEmailForRepurchaseConfirmation } from "../../utils/repurchase-email.js";
import { sendEmailForRepurchaseConfirmationMoney } from "../../utils/repurchase-email-money.js";
import { limits } from "../subscriptionResources/subscription.model.js";
import { sendEmailForSubscriptionRenew } from "../../utils/renew-subscription-email.js";
import { sendEmailForSubscriptionRenewMoney } from "../../utils/renew-money-email.js";
import ProductModel from "../product/product.model.js";
import PaymentModel from "../payment/payment.model.js";
import { sendEmailForSubcriptionCreated } from "../../utils/subscription-created-email.js";

export const createSubscription = async (req, res, next) => {
  const {
    productId,
    serviceProvider,
    serviceName,
    currency,
    frequency,
    category,
    paymentMethod,
    status,
  } = req.body;
  try {
    if (!productId || !mongoose.Types.ObjectId.isValid(productId))
      throw new Error("Product is either required or invalid!!!");

    const isPayment = await PaymentModel.find({ orderId: productId });
    console.log(isPayment);
    if (!isPayment[0] || isPayment[0].status !== "paid")
      return res
        .status(400)
        .json({ success: false, message: "PAYMENT ISSUE!!!" });

    const product = await ProductModel.findById(isPayment[0].orderId);

    if (!product) throw new Error("Product not available!!!");
    let newSubscription = await Subscription({
      service_provider: serviceProvider,
      package_Name: serviceName,
      price: product.price,
      currency,
      frequency,
      category,
      paymentMethod,
      status,
      startDate: new Date(),
      pausedAt: new Date(),
      user: req.user._id,
    });
    newSubscription = await newSubscription.save();
    newSubscription = await newSubscription.populate("user", "name email");
    if (!newSubscription) {
      return res
        .status(500)
        .json({ success: false, message: "Subscription not created!!!" });
    }

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

    const isEmailSent = await sendEmailForSubcriptionCreated({
      serviceProvider: newSubscription.service_provider,
      serviceName: newSubscription.package_Name,
      startDate: newSubscription.startDate,
      renewalsDate: newSubscription.renewalsDate,
      price: newSubscription.price,
      emailTo: newSubscription.user.email,
      refundTo: newSubscription.user.name,
    });

    if (!isEmailSent) {
      console.log("Problem in sending subscription created confirmation!!");
      await ConfirmationModel.create({
        serviceProvider: newSubscription.service_provider,
        serviceName: newSubscription.package_Name,
        cancelAt: new Date(),
        user: newSubscription.user,
        message: "Subscription is created!",
      });
    }

    return res.status(201).json({
      success: true,
      message: "subscription created!",
      data: { Subscription: newSubscription },
    });
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
    const user = await Usermodel.findById(req.user._id);
    if (req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: "FORBIDDEN" });
    }
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "USER NOT FOUND!!!" });

    const userSubscription = await Subscription.find({ user: user._id });

    return res.status(200).json({
      success: true,
      message: "All Subscriptions",
      data: {
        subscription: userSubscription,
        totalSubscription: userSubscription.length,
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
    const user = await Usermodel.findById(req.user.id)
      .select("-password")
      .session(session);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!!!" });
    }
    const subscriptionId = req.params.id;
    if (!subscriptionId || !mongoose.Types.ObjectId.isValid(subscriptionId)) {
      throw new Error("SubscriptionId is either not present or invalid!!!");
    }

    const subscription = await Subscription.findById(subscriptionId)
      .populate("user", "name email")
      .session(session);

    const isValidSubscription =
      subscription.status === "cancel" ||
      subscription.status === "paused" ||
      subscription.status === "expired";
    if (!subscription || isValidSubscription) {
      throw new Error("Subscription cannot be canceled!!!");
    }

    if (subscription.user._id.toString() !== user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: "FORBIDDEN!!!" });
    }

    const canCanceled = await subscription.canCancel();

    if (!canCanceled) {
      throw new Error("Subscription can not be canceled !!!");
    }

    const { reason, feedBack } = req.body;

    const isFeedbackSaved = await FeedbackModel.create(
      [
        {
          serviceProvider: subscription.service_provider,
          serviceName: subscription.package_Name,
          reason,
          feedBack,
          user: user._id,
        },
      ],
      { session },
    );

    if (!isFeedbackSaved) {
      console.log("Problem to Create feeback!!");
    }

    const refundCalculation = moneyToRefund(subscription.price);
    const { refundAmount, refundPercentage } = refundCalculation;

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
        moneyToRefund: "$" + refundAmount + "cent",
        refundPercentage,
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
    const { workflowRunId } = await workflowClient.trigger({
      url: `${config.LOCAL_SERVER_URL}/api/v1/workflows`,
      body: {
        subscriptionId: subscription._id,
      },

      headers: {
        "content-type": "application/json",
      },

      retries: 0,
    });

    console.log(`WORKFLOW ID:: ${workflowRunId}`);
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

export const repurchaseSubscription = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await Usermodel.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!!!" });
    }

    const subscriptionId = req.params.id;
    if (!subscriptionId || !mongoose.Types.ObjectId.isValid(subscriptionId)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Either subcripton Id missing or invalid !!!",
      });
    }


    const product = await PaymentModel.find({
      subscriptionId: subscriptionId,
      $or: [{ productStatus: "cancel" }, { productStatus: "expired" }],
    }).session(session);


    if (product[0].status !== "paid") {
      return res.status(400).json({ success: false, message: "PAYMENT_ISSUE" });
    }

    const subscription = await Subscription.findById(subscriptionId)
      .populate("user", "name email")
      .session(session);

    if (
      !subscription ||
      !(subscription.status == "expired" && subscription.status == "cancel")
    ) {

      await session.abortTransaction();
      throw new Error("Subscription can not be repurchased");
    }

    if (subscription.user._id.toString() !== user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: "FORBIDDEN!!!" });
    }

    const repurchased = await subscription.repurchase(session);
    if (!repurchased) {
      await session.abortTransaction();
      throw new Error("Problem in repurchasing the subscription!!!");
    }

    const { workflowRunId } = await workflowClient.trigger({
      url: `${config.LOCAL_SERVER_URL}/api/v1/workflows`,
      body: {
        subscriptionId: repurchased._id,
      },
      headers: {
        "content-type": "application/json",
      },

      retries: 0,
    });

    console.log(`WORKFLOW_ID: ${workflowRunId}`);

    const { newRepurchasePrice, discount } = calculateRePurchasePrice(
      subscription.price,
    );

    // payment...
    const isRepurchased = await sendEmailForRepurchaseConfirmationMoney({
      serviceProvider: subscription.service_provider,
      serviceName: subscription.package_Name,
      newRepurchasePrice,
      timeOfRepurchased: new Date(),
      refundTo: subscription.user.name,
      emailTo: subscription.user.email,
      paymentMethod: subscription.paymentMethod,
    });

    if (!isRepurchased) {
      await session.abortTransaction();
      return res.status(500).json({
        success: false,
        message: "Failed to payment for repurchase subscription!!!",
      });
    }

    // email...
    const isEmailSent = await sendEmailForRepurchaseConfirmation({
      serviceProvider: repurchased.serviceProvider,
      serviceName: repurchased.package_Name,
      emailTo: subscription.user.email,
      repurchaseAmount: newRepurchasePrice,
      discount,
      refundTo: subscription.user.name,
    });

    if (!isEmailSent) {
      console.log("Failed to send repurchase confirmation email!!");
      await ConfirmationModel.create(
        [
          {
            serviceProvider: subscription.service_provider,
            serviceName: subscription.package_Name,
            cancelAt: new Date(),
            user: subscription.user,
            message: "Your service is repurchased!",
          },
        ],
        { session },
      );
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
      err,
    };

    next(error);
  } finally {
    await session.endSession();
  }
};

// todo---
export const renewSubscription = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const subscriptionId = req.params.id;
    if (!subscriptionId) {
      await session.abortTransaction();
      throw new Error("Subscription Id is required!!!");
    }
    const subscription =
      await Subscription.findById(subscriptionId).session(session);

    if (!subscription || !subscription.canRenew()) {
      await session.abortTransaction();
      throw new Error("Subscription can not renewed!!!");
    }

    if (subscription.user.toString() !== req.user.id) {
      await session.abortTransaction();
      res.status(403).json({ success: false, message: "FORBIDDEN!!!" });
    }

    const { price: priceToRenew, discountPercent } = calculateNewPrice(
      subscription.price,
      subscription.renewalsDate,
    );

    const isPaymentSuccessful = await sendEmailForSubscriptionRenewMoney({
      serviceProvider: subscription.service_provider,
      serviceName: subscription.serviceName,
      startDate: new Date(),
      newPrice: priceToRenew,
      paymentMethod: subscription.paymentMethod,
      refundTo: subscription.user.name,
      emailTo: subscription.user.email,
    });

    if (!isPaymentSuccessful) {
      await session.abortTransaction();
      return res
        .status(500)
        .json({ success: false, message: "Payment Process failed!!!" });
    }

    subscription.price = priceToRenew;
    subscription.status = "active";
    subscription.startDate = new Date();
    subscription.pauseLimit = limits[subscription.frequency];
    subscription.pausesUsed = 0;
    subscription.pausesRemaining = limits[subscription.frequency];
    subscription.isPaused = false;
    subscription.pausedAt = null;
    subscription.canRenew = true;

    await subscription.save({ session });

    const renewSubscription = await Subscription.findById(
      subscription._id,
    ).session(session);

    const isEmailSent = sendEmailForSubscriptionRenew({
      serviceProvider: renewSubscription.service_provider,
      serviceName: renewSubscription.serviceName,
      startDate: renewSubscription.startDate,
      newPrice: renewSubscription.price,
      oldPrice: subscription.price,
      renewalsDate: renewSubscription.renewalsDate,
      refundTo: subscription.user.name,
      emailTo: subscription.user.email,
    });

    if (!isEmailSent) {
      console.log("Problem in sending renewels confirmation!!");
      await ConfirmationModel.create(
        [
          {
            serviceProvider: subscription.service_provider,
            serviceName: subscription.package_Name,
            cancelAt: new Date(),
            user: subscription.user,
            message: "Your service is renewed!",
          },
        ],
        { session },
      );
    }

    await session.commitTransaction();
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
    await session.abortTransaction();
    const isProduction = config.NODE_ENV === "production" ? true : false;
    const error = {
      message: isProduction ? "Problem in renewing subscription" : err.message,
      statusCode: err.statusCode || 500,
      stack: isProduction ? err.stack : undefined,
    };

    next(error);
  } finally {
    await session.endSession();
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
