import express from "express";
import cookieParser from "cookie-parser";
import path from "node:path";
import arcjet from "./middleware/arcjet.middleware.js";
import { fileURLToPath } from "node:url";
import morgan from "morgan";
import fs from "node:fs";
import cors from "cors";
import helmet from "helmet";

import workflowRouter from "./resources/workflow/workflow.routes.js";
import { stripHook } from "./stripe/stripe.controller.js";
import AuthRoutes from "../src/resources/authResources/auth.routes.js";
import UserRoutes from "./resources/userResources/user.routes.js";
import SubscriptionRoutes from "./resources/subscriptionResources/subscription.routes.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";
import stripeRouter from "./stripe/stripe.route.js";
import { allowedOrigin } from "./utils/constants/origin.js";
import { config } from "./config/config.js";
import { allowCrossOriginStaticResourceSharing } from "./utils/allowCrossOriginStaticResourceSharing.js";
import otpRouter from "./resources/otpResources/otp.route.js";
import productRouters from "./resources/product/product.route.js";

const app = express();

// path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MAINTAINING REQUEST AND ERROR LOG
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// CREATE REQUEST LOGS FILE
const requestLogsStream = fs.createWriteStream(
  path.join(__dirname, "../logs/requests.log"),
  {
    flags: "a",
  },
);

// CREATE ERROR LOGS FILE
const errorLogs = fs.createWriteStream(
  path.join(__dirname, "../logs/errorLogs"),
  {
    flags: "a",
  },
);

// STRIPE WEB HOOK
app.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  stripHook,
);

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(arcjet);
app.use(helmet());

app.use(
  morgan("combined", {
    stream: requestLogsStream,
  }),
);

// SETTING CORS
app.use(
  cors({
    origin:
      config.NODE_ENV === "development"
        ? allowedOrigin.development
        : allowedOrigin.production,
    credentials: true,
    maxAge: 86400,
  }),
);

// ALLOWING ACCESSING STATIC FILE IN CROSS ORIGIN
app.use(path.join("/resources"), allowCrossOriginStaticResourceSharing);

// MIDDLEWARE FOR STATIC FILES
app.use(express.static(path.join(__dirname, "../public")));
app.use(
  "/static_files",
  express.static(path.join(__dirname, "../public/static_files")),
);

// HOME ROUTE
app.get("/", (req, res) => {
  return res.json({ message: "Welcome to subscription management system !!" });
});

// ROUTES
app.use("/api/v1/products",productRouters)
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/subscriptions", SubscriptionRoutes);
app.use("/payment", stripeRouter);
app.use("/api/v1/workflows", workflowRouter);
app.use("/api/v1/otp", otpRouter);

// HANDLING UNKNOWN ROUTES...
app.use((req, res) => {
  res.status(404).json({
    status: "failed",
    message: "Route not found",
  });
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);
app.use(
  morgan("combined", {
    stream: errorLogs,
    skip: function (req, res) {
      return res.statusCode < 400;
    },
  }),
);

export default app;
