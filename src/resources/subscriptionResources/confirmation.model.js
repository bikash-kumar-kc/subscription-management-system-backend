import mongoose from "mongoose";

const ConfirmationSchema = new mongoose.Schema(
  {
    serviceProvider: {
      type: String,
      required: true,
    },

    serviceName: {
      type: String,
      required: true,
    },

    cancelAt: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return new Date(value) <= new Date();
        },
        message: "Cancellation time is required !!!",
      },
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      index: true,
      ref: "user",
    },
  },
  { timestamps: true },
);

const ConfirmationModel = mongoose.model("confirmation", ConfirmationSchema);

export default ConfirmationModel;

const FeedbackSchema = new mongoose.Schema(
  {
    serviceProvider: {
      type: String,
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      minLength: 20,
      trim: true,
    },

    feedBack: {
      type: String,
      minLength: 20,
      trim: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true },
);
FeedbackSchema.index({ serviceName: 1, serviceProvider: 1 });

FeedbackSchema.pre("save", async function () {
  if (
    !this.reason.trim() ||
    !this.feedBack.trim() ||
    /<><\/>/.test(this.reason) ||
    /<><\/>/.test(this.feedBack)
  ) {
    throw new Error("Failed to create feedback!!");
  }
});

export const FeedbackModel = mongoose.model("feedback", FeedbackSchema);
