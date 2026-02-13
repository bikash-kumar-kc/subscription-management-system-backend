import { config } from "../config/config.js";
import mongoose from "mongoose";

const connectToMongoDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("connected successfully to mongodb!"),
    );
    mongoose.connection.on("error", () =>
      console.log("error to reconnect to mongodb"),
    );

    await mongoose.connect(config.MONGO_DB);
  } catch (error) {
    console.log("problem in connecting to mongodb!!" + error);
    process.exit(1);
  }
};

export default connectToMongoDB;
