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
    paymentMethod: {
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
      ref: "Users",
      required: true,
      index: true,
    },

    pauseLimit: {
      type: Number,
      default: function () {
        const limits = {
          daily: 0,
          weekly: 1,
          monthly: 2,
          yearly: 6,
        };

        return limits[this.frequency];
      },
    },

    pausesUsed: {
      type: Number,
      default: 0,
    },

    pausesRemaining: {
      type: Number,
      default: function () {
        return this.pauseLimit;
      },
    },

    isPaused: {
      type: Boolean,
      default: false,
    },

    pausedAt: {
      type: Date,
      validate: {
        validator: function (value) {
          return value > this.startDate && value < this.renewalsDate;
        },
        message: "Invalid paused time !!!",
      },
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
  }

  // Auto-update the status if renewalsDate passed
  if (this.renewalsDate < new Date()) {
    this.status = "expired";
  }
});

SubscriptionSchema.methods.canPause = function () {
  return this.pausesRemaining > 0 && !this.isPaused;
};

Subscription.methods.paused = function () {
  if (this.canPause()) {
    this.status = "paused";
    this.pausedAt = new Date();
    this.pausesUsed = this.pausesUsed + 1;
    this.pausesRemaining -= 1;
    return this.save();
  }

  throw new Error("Cannot pause: No pauses remaining or already paused");
};

Subscription.methods.resume = function () {
  if (!this.isPaused) {
    throw new Error("Cannot resume : subscription is not paused!!!");
  }

  this.isPaused = false;
  const totalPausedDuration = Math.ceil(
    (new Date() - this.pausedAt) / (1000 * 60 * 60 * 24),
  );

  this.renewalsDate.setDate(this.renewalsDate.getDate() + totalPausedDuration);

  this.pausedAt = null;
  this.status = "active";

  return this.save();
};

const Subscription = mongoose.model("Subscription", SubscriptionSchema);
export default Subscription;
