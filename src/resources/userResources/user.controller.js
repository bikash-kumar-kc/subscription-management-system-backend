import UserModel from "./user.model.js";

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
