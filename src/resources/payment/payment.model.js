import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
      trim: true,
    },

    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subscription",
      required: true,
      trim: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      trim: true,
    },

    serviceProvider: {
      type: String,
      trim: true,
      minLength: [3, "Service provider must contain characters greater than 3"],
      index: true,
    },
    status: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
      required: true,
    },
    productStatus: {
      type: String,
    },

    discountRate: {
      type: Number,
      default: 0,
      min: [0, "Discount rate must be equal or greater than 0"],
    },
  },
  { timestamps: true },
);

PaymentSchema.index({ userId: 1, orderId: true });
const PaymentModel = mongoose.model("payment", PaymentSchema);
export default PaymentModel;
