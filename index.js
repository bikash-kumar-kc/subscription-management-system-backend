import app from "./src/app.js";
import { config } from "./src/config/config.js";
import connectToMongoDB from "./src/database/mongoDB.js";

const startServer = async () => {
  await connectToMongoDB();
  app.listen(config.PORT, () => {
    console.log(`the server is running at PORT:: ${config.PORT}`);
  });
};

startServer();
