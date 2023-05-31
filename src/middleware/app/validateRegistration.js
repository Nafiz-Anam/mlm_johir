const { body, validationResult } = require("express-validator");

var startDate = new Date();

exports.registerValidation = () => {
  return [
    body("sponsor_full_name")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .isLength({ min: 2, max: 50})
      .withMessage("Sponsor name is required"),
    body("sponsor_user_name")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .isLength({ min: 2, max: 26 })
      .withMessage("Sponsor user name is required"),
    body("position")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .withMessage("Leg required"),
    body("product_id")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .withMessage("Product is required"),
    body("first_name")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .isLength({ min: 2, max: 26 })
      .withMessage("First name is required"),
    body("last_name")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .isLength({ min: 1, max: 26 })
      .withMessage("Last name is required"),
    body("date_of_birth")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      // .isBefore(new Date(startDate).toDateString())
      .withMessage("Date of birth cannot be greater than the current Date"),
    body("gender")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .isIn(['M', 'F','O'])
      .withMessage("Gender is required"),
    body("country")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .withMessage("Country field is required"),
    body("state")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .withMessage("State is required"),
    // zipcode
    body("email")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage("Email is required"),
    body("mobile")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .isInt()
      .withMessage("Mobile Number is required"),
    body("user_name_entry")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .isLength({ min: 2, max: 26 })
      .withMessage("Username is required"),
    body("pswd").trim().notEmpty().withMessage("Password is required"),
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
