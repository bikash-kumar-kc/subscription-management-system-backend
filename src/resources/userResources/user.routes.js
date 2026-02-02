import express from "express";
import { getUser, getUsers, uploadProfile } from "./user.controller.js";
import authenticate from "../../middleware/authenticate.js";
import upload from "../../services/multer.js";

const UserRoutes = express.Router();

UserRoutes.get("/", authenticate, getUsers);
UserRoutes.get("/:id", authenticate, getUser);
UserRoutes.post("/", async (req, res) =>
  res.send({ message: "To create a new user" }),
);
UserRoutes.put("/:id", async (req, res) =>
  res.send({ message: "Update a user" }),
);
UserRoutes.delete("/:id", async (req, res) =>
  res.send({ message: "Delete a user" }),
);

UserRoutes.patch("/:id",upload.single("profileImage"),uploadProfile);

export default UserRoutes;
