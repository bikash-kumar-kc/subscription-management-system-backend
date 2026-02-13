import redis from "redis";
import { config } from "../config/config.js";

const client = redis.createClient({
  username: "default",
  password: config.REDIS_PASSWORD,
  socket: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    rejectUnauthorized: false,
     timeout: 5000,
  },
});

export const connectToRedisDatabase = async () => {
  try {
    client.on("error", (err) => console.error("Redis Client Error", err));
    client.on("connect", () => console.log("Connecting to Redis..."));
    client.on("ready", () => console.log("Redis connection ready!"));
    await client.connect();
  } catch (err) {
    console.log("failed to connect" + err);
  }
};

export default client;
