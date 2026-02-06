import mongoose from "mongoose";
import { config } from "../config/config.js";
import ProductModel from "../resources/product/product.model.js";
import UserModel from "../resources/userResources/user.model.js";
import stripePaymentProcess from "./stripe.js";
import stripe from "./client.js";
import PaymentModel from "../resources/payment/payment.model.js";

export const paymentInitiator = async (req, res, next) => {
  try {
    const {
      productId,
      serviceProvider,
      paymentMethod = "card",
      currency = "usd",
      quantity = 1,
      mode,
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
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "USER NOT FOUND!!!" });
    }

    const product = await ProductModel.findById(productId);
    const paymentData = {
      currency,
      quantity,
      amount: product.price,
      name: product.serviceName,
    };
    const url = await stripePaymentProcess({
      item: paymentData,
      paymentMethod,
      mode,
      userId: user._id,
      orderId: product._id,
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
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const orderId = session.metadata.orderId;
    const serviceProvider = session.metadata.orderId;

    await PaymentModel.create({
      userId,
      orderId,
      serviceProvider,
      status: "paid",
    });

    return res
      .status(200)
      .json({ success: true, message: "payment successful!" });
  } else {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const orderId = session.metadata.orderId;
    const serviceProvider = session.metadata.orderId;

    await PaymentModel.create({
      userId,
      orderId,
      serviceProvider,
      status: "unpaid",
    });
    return res.status(200).json({ success: true, message: "payment failed!" });
  }
};
