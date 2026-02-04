import mongoose from "mongoose";

const limits = {
  daily: 0,
  weekly: 1,
  monthly: 2,
  yearly: 6,
};

const SubscriptionSchema = new mongoose.Schema(
  {
    service_provider: {
      type: String,
      required: [true, "Service provider's name is required"],
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    package_Name: {
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
      enum: ["active", "cancel", "expired", "paused"],
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

    canRenew: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

SubscriptionSchema.createIndex({ status: 1, renewalsDate: 1 });
SubscriptionSchema.createIndex({ canRenew: 1, user: 1 });
SubscriptionSchema.createIndex({ status: 1, user: 1 });

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

SubscriptionSchema.methods.paused = async function () {
  if (this.canPause()) {
    this.status = "paused";
    this.pausedAt = new Date();
    this.pausesUsed = this.pausesUsed + 1;
    this.pausesRemaining -= 1;
    await this.save();
    // Fetch a fresh copy from the database
    return this.constructor.findById(this._id);
  }

  throw new Error("Cannot pause: No pauses remaining or already paused");
};

Subscription.methods.resume = async function () {
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

   await this.save();

   return  this.constructor.findById(this._id);
};

Subscription.methods.canCancel = function () {
  const now = new Date();
  const start = new Date(this.startDate);
  const yDays = Math.ceil(
    (new Date(this.renewalsDate) - start) / (1000 * 60 * 60 * 24),
  );

  const daysUsed = (now - start) / (1000 * 60 * 60 * 24);
  const maxCancelableDays = yDays * 0.2;

  return daysUsed <= maxCancelableDays;
};

Subscription.methods.repurchase = function () {
  this.startDate = new Date();
  this.pauseLimit = limits[this.frequency];
  this.pausesUsed = 0;
  this.pausesRemaining = this.pauseLimit;
  this.isPaused = false;
  this.pausedAt = null;

  return this.save();
};

Subscription.methods.canRenew = function () {
  const can_renew =
    this.canRenew &&
    !this.isPaused &&
    this.status !== "cancel" &&
    this.status !== "expired";

  return can_renew;
};

const Subscription = mongoose.model("Subscription", SubscriptionSchema);
export default Subscription;
