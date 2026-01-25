import express from "express";

const AuthRoutes = express.Router();

AuthRoutes.post("/signup", async (req, res) =>
  res.json({ message: "create account" }),
);
AuthRoutes.post("/signin", async (req, res) =>
  res.json({ message: "welcome again" }),
);
AuthRoutes.post("/signout", async (req, res) =>
  res.json({ message: "do visit again" }),
);

export default AuthRoutes;
