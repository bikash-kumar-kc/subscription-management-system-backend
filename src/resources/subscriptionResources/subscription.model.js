import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subscription name is required"],
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    price: {
      type: Number,
      required: [true, "Subscription price  is required"],
      min: [0, "Price must be greater than 0"],
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      enum: ["USD", "NPR", "INR", "EUR"],
      default: "USD",
    },
    frequency: {
      type: String,
      required: true,
      enum: ["daily", "weekly", "monthly", "yearly"],
      default: "monthly",
    },
    category: {
      type: String,
      required: true,
      enum: [
        "sports",
        "entertainment",
        "music",
        "news",
        "lifestyle",
        "technology",
        "finance",
        "politics",
        "other",
      ],
    },
    payMethod: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "cancel", "expired"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value <= Date.now();
        },
        message: "Invalid starting time",
      },
    },
    renewalsDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "Invalid renewals Date",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

SubscriptionSchema.pre("save", async function () {

    // Auto-generate renewalsDate
  if (!this.renewalsDate) {
    const renewalPeriods = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      yearly: 365,
    };

    this.renewalsDate = new Date(this.startDate);
    this.renewalsDate.setDate(
      this.renewalsDate.getDate() + renewalPeriods[this.frequency],
    );
  };


  // Auto-update the status if renewalsDate passed
  if(this.renewalsDate < new Date()){
    this.status ="expired"
  }


});

export default SubscriptionSchema;
