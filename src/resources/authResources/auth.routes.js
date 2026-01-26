import express from "express";
import { signUp } from "./auth.controller.js";
const AuthRoutes = express.Router();

AuthRoutes.post("/signup",signUp);
AuthRoutes.post("/signin", async (req, res) =>
  res.json({ message: "welcome again" }),
);
AuthRoutes.post("/signout", async (req, res) =>
  res.json({ message: "do visit again" }),
);

export default AuthRoutes;
