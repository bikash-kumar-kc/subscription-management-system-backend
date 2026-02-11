import { body } from "express-validator";

class PaymentValidation {
  static validatePayment = [
    body("productId")
      .notEmpty()
      .withMessage("ID is required")
      .isMongoId()
      .withMessage("Invalid MongoDB ID")
      .escape(),
    body("subscriptionId")
      .notEmpty()
      .withMessage("ID is required")
      .isMongoId()
      .withMessage("Invalid MongoDB ID")
      .escape(),
    body("serviceProvider")
      .trim()
      .isEmpty()
      .withMessage("Service Provider name is required!!!")
      .isLength({ min: 3 })
      .withMessage("Service provider name must be greater than 3")
      .escape(),
    body("paymentMethod").optional().trim().escape(),
    body("currency").optional().trim().escape(),
    body("quantity")
      .isInt({ min: 0 })
      .withMessage("quanlity must be integer or greater than 0"),
    body("status")
      .optional()
      .trim()
      .notEmpty("Status must not be empty!!!")
      .isIn(["active", "cancel", "expired", "paused"])
      .withMessage("status must be active/cancel/expired/paused")
      .escape(),
    body("frequency")
      .optional()
      .trim()
      .isEmpty()
      .withMessage("Frequency must not be empty")
      .isIn(["daily", "weekly", "monthly", "yearly"])
      .withMessage("Value must be anyone one of daily/weekly/monthly/yearly")
      .escape(),
  ];
}

export default PaymentValidation;
