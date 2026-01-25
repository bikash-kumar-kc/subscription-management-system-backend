import app from "./src/app.js";
import { config } from "./src/config/config.js";

const startServer = async () => {
  app.listen(config.PORT, () => {
    console.log(`the server is running at PORT:: ${config.PORT}`);
  });
};

startServer();
