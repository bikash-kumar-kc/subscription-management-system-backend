import { validationResult } from "express-validator";

export const validator = async (req, res, next) => {
  const errors = validationResult(req);
  const httpMethodInformation = {
    path: req.path,
    method: req.method,
  };

  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: httpMethodInformation, errors: errors.mapped() });
  }

  next();
};
