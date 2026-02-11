import { body, param } from "express-validator";

class SubscriptionValidation {
  static createSubscription = [
    body("service_provider")
      .trim()
      .isEmpty()
      .withMessage("Service Provider name is required!!!")
      .isLength({ min: 3 })
      .withMessage("Service provider name must be greater than 3")
      .escape(),
    body("package_Name")
      .trim()
      .isEmpty()
      .withMessage("Package name is required!!!")
      .isLength({ min: 3 })
      .withMessage("Package name must be greater than 3")
      .escape(),
    body("price").escape(),
    body("frequency")
      .optional()
      .trim()
      .isEmpty()
      .withMessage("Frequency must not be empty")
      .isIn(["daily", "weekly", "monthly", "yearly"])
      .withMessage("Value must be anyone one of daily/weekly/monthly/yearly")
      .escape(),
    body("currency")
      .optional()
      .trim()
      .isEmpty()
      .withMessage("Currency mode must not be empty")
      .isIn(["USD", "NPR", "INR", "EUR"])
      .withMessage("Value must be anyone one of usd/npr/inr/eur")
      .escape(),
    body("category")
      .trim()
      .isEmpty()
      .withMessage("category must not be empty")
      .isIn([
        "sports",
        "entertainment",
        "music",
        "news",
        "lifestyle",
        "technology",
        "finance",
        "politics",
        "other",
      ])
      .withMessage(
        "category must be sports/entertainment/music/news/lifestyle/technology/finance/politics/other",
      )
      .escape(),
    body("status")
      .optional()
      .trim()
      .isEmpty()
      .withMessage("Status must not be empty!!!")
      .isIn(["active", "cancel", "expired", "paused"])
      .withMessage("Value must be active/cancel/expired/paused")
      .escape(),
  ];

  static validationId = [
    param("id")
      .notEmpty()
      .withMessage("ID is required")
      .isMongoId()
      .withMessage("Invalid MongoDB ID")
      .escape(),
  ];
}

export default SubscriptionValidation;
