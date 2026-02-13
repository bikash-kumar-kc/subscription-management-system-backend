import Queue from "bull";
import { config } from "../config/config.js";
import UserModel from "../resources/userResources/user.model.js";
import PaymentModel from "../resources/payment/payment.model.js";
import Subscription from "../resources/subscriptionResources/subscription.model.js";
import generatePublicKey from "../utils/generatePublicKey.js";
import { deleteFile } from "./cloudinary.js";

// CREATE A QUEQUE
const userDeletionQueue = new Queue("user-deletion", {
  redis: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
  },
});

// ADD JOB TO A QUEQUE

const deletionUser = async (userId) => {
  await userDeletionQueue.add(
    {
      userId,
    },
    {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 500,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  );
};

// PROCESS THE QUEUE

userDeletionQueue.process(async (job) => {
  const { userId } = job.data;
  const user = await UserModel.findOne({ _id: userId });

  if (!user) {
    console.log(`User ${userId} already deleted or doesn't exist`);
    return { success: true, alreadyDeleted: true };
  }
  try {
    // Delete payments
    await PaymentModel.deleteMany({ userId });

    // Delete subscriptions
    await Subscription.deleteMany({ user: userId });

    // Delete image if exists
    if (user.imageUrl) {
      const publicKey = generatePublicKey(user.imageUrl);
      await deleteFile(publicKey);
    }

    // Delete user
    await UserModel.findOneAndDelete({ _id: user._id });
    return { success: true, userId };
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
});

userDeletionQueue.on("completed", (job, result) => {
  console.log(`User deletion done for job ${job.data.userId}` + result.success);
});
userDeletionQueue.on("failed", (job, err) => {
  console.log(`failed to delete ${job.data.userId}` + err);
});

export default deletionUser;
