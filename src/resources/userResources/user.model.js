import mongoose from "mongoose";
import { createHmac, randomBytes } from "node:crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
      minlength: [2, "Name must be more than 2 character"],
      maxLength: [25, "Name must be less than 25 character"],
    },
    email: {
      type: String,
      required: [true, "User email is required"],
      trim: true,
      unique: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "User password is required"],
      minlength: 8,
    },

    salt: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

// Password hashing
userSchema.pre("save", async function () {
  const password = this.password;
  console.log("auth model");

  if (!this.isModified("password")) return;

  const salt = randomBytes(16).toString("hex");
  const hashPassword = createHmac("sha256", salt)
    .update(password)
    .digest("hex");
  this.password = hashPassword;
  this.salt = salt;
});

userSchema.post("save", async function () {
  console.log("user created successfully");
});

const UserModel = mongoose.model("Users", userSchema);
export default UserModel;
