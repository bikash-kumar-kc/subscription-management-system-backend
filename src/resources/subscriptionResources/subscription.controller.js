import Subscription from "../subscriptionResources/subscription.model.js";

export const createSubscription = async (req, res, next) => {
  try {
    const newSubscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

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

export const getUserSubscription = async (req, res, next) => {
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
