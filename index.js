import app from "./src/app.js";
import { config } from "./src/config/config.js";
import connectToMongoDB from "./src/database/mongoDB.js";
import { connectToRedisDatabase } from "./src/redis/redis.js";

const startServer = async () => {
  await connectToMongoDB();
  await connectToRedisDatabase();
  app.listen(config.PORT, () => {
    console.log(`the server is running at PORT:: ${config.PORT}`);
  });
};

startServer();
