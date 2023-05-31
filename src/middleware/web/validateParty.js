const { body, validationResult } = require("express-validator");

exports.validateCreateHost = () => {
  return [
    body("firstname")
      .trim()
      .notEmpty()
      .isLength({ min: 3, max: 26 })
      .withMessage("First name is required"),
    body("lastname")
      .trim()
      .notEmpty()
      .isLength({ min: 3, max: 26 })
      .withMessage("Last name is required"),
    body("address")
      .trim()
      .notEmpty()
      .isLength({ min: 3, max: 26 })
      .withMessage("Address is required"),
    body("country").trim().notEmpty().withMessage("Country is required"),
    body("state")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .withMessage("State is required"),
    body("city")
      .trim()
      .notEmpty()
      .isLength({ min: 3, max: 26 })
      .withMessage("City is required"),
    body("zip")
      .trim()
      .notEmpty()
      .isLength({ min: 3, max: 26 })
      .withMessage("Zip Code is required"),
    body("phone")
      .trim()
      .notEmpty()
      .isLength({ min: 10, max: 26 })
      .withMessage(
        "Phone number is required and it should have a minimum of 10 number"
      ),
    body("email")
      .trim()
      .notEmpty()
      .exists()
      .isEmail()
      .withMessage("Email is required"),
  ];
};

exports.validateCreateParty = () => {
  return [
    body("host")
      .trim()
      .notEmpty()
      .withMessage("First name is required"),
    body("firstname")
      .trim()
      .notEmpty()
      .isLength({ min: 3, max: 26 })
      .withMessage("First name is required"),
    body("lastname")
      .trim()
      .notEmpty()
      .isLength({ min: 3, max: 26 })
      .withMessage("Last name is required"),
    body("address")
      .trim()
      .notEmpty()
      .isLength({ min: 3, max: 26 })
      .withMessage("Address is required"),
    body("country").trim().notEmpty().withMessage("Country is required"),
    body("state")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .withMessage("State is required"),
    body("city")
      .trim()
      .notEmpty()
      .isLength({ min: 3, max: 26 })
      .withMessage("City is required"),
    body("zip")
      .trim()
      .notEmpty()
      .isLength({ min: 3, max: 26 })
      .withMessage("Zip Code is required"),
    body("phone")
      .trim()
      .notEmpty()
      .isLength({ min: 10, max: 15 })
      .withMessage(
        "Phone number is required and it should have a minimum of 10 number"
      ),
    body("email")
      .trim()
      .notEmpty()
      .exists()
      .isEmail()
      .withMessage("Email is required"),
  ]
}

exports.validateCreateGUest = () => {
  return [
    body("firstname")
      .trim()
      .notEmpty()
      .isLength({ min: 3, max: 26 })
      .withMessage("First name is required"),
    body("lastname")
      .trim()
      .notEmpty()
      .isLength({ min: 3, max: 26 })
      .withMessage("Last name is required"),
    body("address")
      .trim()
      .notEmpty()
      .isLength({ min: 3, max: 26 })
      .withMessage("Address is required"),
    body("country").trim().notEmpty().withMessage("Country is required"),
    body("state")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .withMessage("State is required"),
    body("city")
      .trim()
      .notEmpty()
      .isLength({ min: 3, max: 26 })
      .withMessage("City is required"),
    body("zip")
      .trim()
      .notEmpty()
      .isLength({ min: 3, max: 26 })
      .withMessage("Zip Code is required"),
    body("phone")
      .trim()
      .notEmpty()
      .isLength({ min: 10, max: 15 })
      .withMessage(
        "Phone number is required and it should have a minimum of 10 number"
      ),
    body("email")
      .trim()
      .notEmpty()
      .exists()
      .isEmail()
      .withMessage("Email is required"),
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
