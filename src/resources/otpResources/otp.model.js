import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      index: true,
    },
    otp: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 120,
    },
  },
  { timestamps: true },
);

const otpModel = mongoose.model("otp", otpSchema);

export default otpModel;
