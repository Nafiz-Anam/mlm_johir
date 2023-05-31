const { body, validationResult } = require("express-validator");

const validateFundTransfer = () => {
  return [
    body("pswd").trim().notEmpty().withMessage("Password field required"),
    body("amount")
      .trim()
      .notEmpty()
      .withMessage("required")
      .withMessage("Amount is required"),
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
  validateFundTransfer,
  validate,
};
