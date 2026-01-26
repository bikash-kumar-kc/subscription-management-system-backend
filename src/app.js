import express from "express";
import AuthRoutes from "../src/resources/authResources/auth.routes.js";
import UserRoutes from "./resources/userResources/user.routes.js";
import SubscriptionRoutes from "./resources/subscriptionResources/subscription.routes.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";
import cookieParser from "cookie-parser";
const app = express();

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());


// HOME ROUTE
app.get("/", (req, res) => {
  return res.json({ message: "Welcome to subscription management system !!" });
});

// ROUTES

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/subscriptions", SubscriptionRoutes);


// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

export default app;
