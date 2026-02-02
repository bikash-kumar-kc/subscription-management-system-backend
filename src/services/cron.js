import cron from "node:cron";
import Status from "../resources/statusResources/status.Resources.model";

const startCronJobs = () => {
  cron.schedule(" 0 * * * * ", async () => {
    const result = await Status.updateMany(
      {
        status: "active",
        renewalsDate: { $lt: new Date() },
      },
      {
        $set: {
          status: "expired",
        },
      },
    );

    console.log(`Marked ${result.modifiedCount} Subscription as expired`);
  });
};

export default startCronJobs;
