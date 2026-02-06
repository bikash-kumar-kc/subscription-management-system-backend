import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    serviceProvider: {
      type: String,
      trim: true,
      minLength: [3, "Service provider must contain characters greater than 3"],
      index: true,
    },
    serviceName: {
      type: String,
      trim: true,
      minLength: [3, "Service provider must contain characters greater than 3"],
    },
    price: {
      type: String,
      trim: true,
      min: [0.01, "Invalid price"],
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "quantity can be more than 0 "],
    },
    status: {
      type: String,
      enum: ["availabe", "unavailable"],
      default: "available",
    },
  },
  { timestamps: true },
);

const ProductModel = mongoose.model("product", ProductSchema);

export default ProductModel;
