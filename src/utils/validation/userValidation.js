import { body } from "express-validator";

class UserValidation {
  static createUser = [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("User name is required!!!")
      .isLength({ min: 3, max: 20 })
      .withMessage("User name must be 3-20 characters!!!")
      .escape(),
    body("email")
      .trim()
      .normalizeEmail()
      .notEmpty()
      .withMessage("email must not be empty!!!")
      .isEmail()
      .withMessage("Invalid email format")

      ,
    body("password")
      .notEmpty()
      .withMessage("Password is required!!!")
      .isLength({ min: 8 })
      .withMessage("Password size must be greater than 8")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[@$!%*?&]/)
      .withMessage("Password must contain at least one special character"),
    body("role")
      .optional()
      .trim()
      .isIn(["admin", "user"])
      .withMessage("User role must be 'admin'/'user'")
      .escape(),
  ];

  static userLogin=[
    body("email")
      .trim()
      .normalizeEmail()
      .notEmpty()
      .withMessage("email must not be empty!!!")
      .isEmail()
      .withMessage("Invalid email format")
      .custom((email) => {
        if (email.endsWith("@spam.com")) throw "spam domains are not allowed";
      })
      .escape(),
    body("password")
      .notEmpty()
      .withMessage("Password is required!!!")
      .isLength({ min: 8 })
      .withMessage("Password size must be greater than 8")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[@$!%*?&]/)
      .withMessage("Password must contain at least one special character"),
  ]
}

export default UserValidation;
