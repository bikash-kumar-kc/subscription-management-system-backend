import mongoose from "mongoose";
import { config } from "../config/config.js";
import ProductModel from "../resources/product/product.model.js";
import UserModel from "../resources/userResources/user.model.js";
import stripePaymentProcess from "./stripe.js";
import stripe from "./client.js";
import PaymentModel from "../resources/payment/payment.model.js";
import Subscription from "../resources/subscriptionResources/subscription.model.js";

export const paymentInitiator = async (req, res, next) => {
  try {
    const {
      productId,
      subscriptionId,
      serviceProvider,
      paymentMethod = "card",
      currency = "usd",
      quantity = 1,
      mode,
      status = undefined,
      frequency,
    } = req.body;

    if (
      !productId ||
      !mongoose.Types.ObjectId.isValid(productId) ||
      !serviceProvider.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "productId or service provider is  required!!!",
      });
    }

    const user = await UserModel.findById(req.user.id);
    console.log("user",user)
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "USER NOT FOUND!!!" });
    }

    const product = await ProductModel.findById(productId);
    console.log("product"+product)

    if (subscriptionId) {
      if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
        return res.status(400).json({
          success: false,
          message: "Either subcripton Id missing or invalid !!!",
        });
      }

      const subscription = await Subscription.findById(subscriptionId);
      if (
        !subscription ||
        // subscription.status !== "expired" ||
        subscription.status !== "cancel" 
      ) {
        throw new Error("Subscription can not be repurchased");
      }

       if (subscription.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: "FORBIDDEN!!!" });
    }
    }

    const paymentData = {
      currency,
      quantity,
      amount: Number(product.price),
      name: product.serviceName,
      frequency,
      price:Number(product.price)
    };
    const url = await stripePaymentProcess({
      item: paymentData,
      paymentMethod,
      mode,
      userId: user._id.toString(),
      orderId: product._id.toString(),
      status,
      serviceProvider,
      subscriptionId,
    });

    if (!url) {
      throw new Error("Failed payment!!!");
    }

    return res.status(200).json({
      success: true,
      message: "Payment is in process",
      data: {
        url,
      },
    });
  } catch (err) {
    const isProduction = config.NODE_ENV === "production" ? true : false;
    const error = {
      message: isProduction ? "Problem in Payment!!!" : err.message,
      statusCode: err.statusCode || 500,
      stack: isProduction ? undefined : err.stack,
    };

    next(error);
  }
};

export const stripHook = async (req, res) => {
  let event;
  const sig = req.headers["stripe-signature"];

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.STRIPE_WEBHOOK_SECRET,
    );
    console.log("event " + event);
  } catch (err) {
    console.log("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Respond immediately to Stripe
  res.status(200).json({ received: true });

  try {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const orderId = session.metadata.orderId;
    const serviceProvider =
      session.metadata.serviceProvider || session.metadata.orderId;
    const productStatus = session.metadata.productStatus;
    const discount_rate = session.metadata.discount_rate;
    const subscriptionId =session.metadata.subscriptionId;
console.log("session.metadata",session.metadata)
    console.log(userId,orderId,serviceProvider,productStatus,discount_rate)

    if (event.type === "checkout.session.completed") { 
      await PaymentModel.create({
        userId,
        orderId,
        serviceProvider,
        productStatus,
        discountRate: Number(discount_rate),
        status: "paid",
        subscriptionId,
      });
      console.log("Payment successful!");
    } else {
      await PaymentModel.create({
        userId,
        orderId,
        serviceProvider,
        status: "unpaid",
      });
      console.log("Payment failed!");
    }
  } catch (err) {
    console.error("Error processing webhook:", err);
  }
};
