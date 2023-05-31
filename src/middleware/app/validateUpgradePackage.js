const { body, validationResult } = require("express-validator");

exports.upgradePack = () => {
  return [
    body("product_id")
      .trim()
      .notEmpty()
      .isInt({ gt: 0 })
      .withMessage("Product is required"),
    body("payment_method")
      .trim()
      .notEmpty()
      .withMessage("Payment method should be selected"),
  ];
};
exports.validate = (req, res, next) => {
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
