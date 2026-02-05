import mongoose from "mongoose";
import { config } from "../config/config";
import ProductModel from "../resources/product/product.model";
import UserModel from "../resources/userResources/user.model";
import stripePaymentProcess from "./stripe";

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
