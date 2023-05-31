const { body, validationResult } = require("express-validator");

exports.validateVisitor = (req, res, next) => {
  return [
    body("name").trim().notEmpty().withMessage("Name field required"),
    body("email")
      .trim()
      .notEmpty()
      .isEmail()
      .withMessage("Email Field required"),
    body("country").trim().notEmpty().withMessage("Country field required"),
    body("mobile")
      .trim()
      .notEmpty()
      .isInt()
      .withMessage("Mobile field required"),
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
