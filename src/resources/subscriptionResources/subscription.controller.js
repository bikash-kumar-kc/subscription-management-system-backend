import { config } from "../../config/config.js";
import { workflowClient } from "../../upstash/upstash.config.js";
import moneyToRefund from "../../utils/moneyToRefund.js";
import Subscription from "../subscriptionResources/subscription.model.js";

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
  try {
    const subscriptionId = req.params.id;
    if (!subscriptionId) {
      throw new Error("Subscription id is required!!!");
    }

    const subscription = await Subscription.findById(subscriptionId);
    const isValidSubscription =
      subscription.status === "cancel" ||
      subscription.status === "paused" ||
      subscription.status === "expired";
    if (!subscription || isValidSubscription) {
      throw new Error("Subscription cannot canceled!!!");
    }

    const canCanceled = await subscription.canCancel();

    if (!canCanceled) {
      throw new Error("Subscription can not canceled !!!");
    }

    if (subscription.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "FORBIDDEN!!!" });
    }

    const constToRefund = moneyToRefund(subscription.price);

    const subscriptionCanceled = await Subscription.findByIdAndUpdate(
      subscriptionId,
      {
        $set: {
          status: "cancel",
        },
      },
      {
        new: true,
      },
    );

    if (!subscriptionCanceled) {
      throw new Error("Unable to cancel subscription !!!");
    }

    return res.status(200).json({
      success: true,
      message: "Subscription cancelled !",
      data: {
        id: subscription._id,
        moneyToRefund: constToRefund,
      },
    });
  } catch (err) {
    const isProduction = config.NODE_ENV === "production" ? true : false;
    const error = {
      message: isProduction
        ? "Problem in cancelling subscription"
        : err.message,
      statusCode: err.statusCode || 500,
      stack: isProduction ? err.stack : undefined,
    };

    next(error);
  }
};
