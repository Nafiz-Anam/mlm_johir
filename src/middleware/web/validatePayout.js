const {
  body,
  validationResult
} = require('express-validator')

const validatePayoutRequest = () => {
  return [
    body("payout_amount")
      .trim()
      .notEmpty()
      .withMessage("Amount is required and must be greater than the minimum amount"),
    body("transaction_password")
      .trim()
      .notEmpty()
      .isLength({ min: 6, max: 100 }),
  ];
};

const validatePurchaseWalletBalance = () => {
  return [
    body("user_name").trim().notEmpty().withMessage("Username field required"),
    body("ewallet")
      .trim()
      .notEmpty()
      .withMessage("required")
      .withMessage("Password is required"),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = {};
  errors.array().map((err) => {
    extractedErrors[`${err.param}`] = err.msg;
  });
  const result = {
    code: "1004",
    description: "Incorrect Input Format / Validation Error",
    fields: extractedErrors,
  };
  return res.status(422).json({
    status: false,
    errors: result,
  });
};
module.exports = {
  validatePayoutRequest,
  validatePurchaseWalletBalance,
  validate,
};
