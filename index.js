import app from "./src/app.js";
import { config } from "./src/config/config.js";
import connectToMongoDB from "./src/database/mongoDB.js";
import startCronJobs from "./src/services/cron.js";

const startServer = async () => {
  await connectToMongoDB();
  app.listen(config.PORT, () => {
    console.log(`the server is running at PORT:: ${config.PORT}`);

    // start cron-job
    startCronJobs.start();
  });
};

startServer();
