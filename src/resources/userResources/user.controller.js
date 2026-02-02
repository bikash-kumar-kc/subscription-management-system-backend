import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

import UserModel from "./user.model.js";

import uploadFile from "../../services/cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getUsers = async (req, res, next) => {
  try {
    const role = req.user.role;
    if (!(role === "admin")) {
      return res.status(403).json({ success: false, message: "FORBIDDEN" });
    }

    const users = await UserModel.find().select("-password");

    return res.status(200).json({
      success: true,
      data: {
        users: users,
      },
    });
  } catch (err) {
    console.log(err);
    const error = new Error("Problem in getting all users");
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "id is required" });
    }

    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({
      success: true,
      data: {
        user: user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadProfile = async (req, res, next) => {
  let filePath = null;
  try {
    const userId = req.params.id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User id is required !!!" });
    }

    if (userId !== req.user.id) {
      return res.status(403).json({ success: false, message: "FORBIDDEN" });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!!!" });
    }

    const coverImageMimeType = req.files.profileImage.mimetype
      .split("/")
      .at(-1);
    const fileName = req.files.profileImage.name;
    filePath = path.resolve(__dirname, "../../public/resources", fileName);

    const uploadProfileImage = await uploadFile({
      file: filePath,
      fileName: fileName,
      folderName: "sms_users_profile_image",
      fileFormat: coverImageMimeType,
    });

    if (!uploadProfileImage) {
      return res
        .status(500)
        .json({ success: false, message: "IMAGE UPLOAD !!!" });
    }

    try {
      await fs.promises.unlink(filePath);
    } catch (unlinkErr) {
      console.error("Error deleting temporary file:", unlinkErr);
    }

    const updateUser = await UserModel.findByIdAndUpdate(
      user._id,
      {
        $set: {
          imageUrl: uploadProfileImage.secure_url,
        },
      },
      {
        new: true,
      },
    );

    return res.status(201).json({
      success: true,
      message: "User Updated Successfully!",
      data: {
        profileUrl: updateUser.imageUrl,
      },
    });
  } catch (err) {
    if (filePath) {
      try {
        await fs.promises.unlink(filePath);
      } catch (unlinkErr) {
        console.error("Error cleaning up file after error:", unlinkErr);
      }
    }

    console.error("Upload profile error:", err);

    const error = {
      message:
        process.env.NODE_ENV === "production"
          ? "An error occurred while uploading the profile image"
          : err.message,
      statusCode: err.statusCode || 500,
    };

    if (process.env.NODE_ENV !== "production") {
      error.stack = err.stack;
    }

    next(error);
  }
};
