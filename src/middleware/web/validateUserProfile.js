const { body, validationResult } = require("express-validator");

const validatePersonalDetails = () => {
  return [
    body("firstName")
      .exists()
      .optional({ checkFalsy: true })
      .isLength({ min: 3, max: 24 })
      .trim()
      .withMessage(
        "The first_name field must be at least 3 characters in length."
      ),
    body("lastName")
      .exists()
      .optional({ checkFalsy: true })
      .isLength({ min: 3, max: 24 })
      .trim()
      .withMessage("the lastname must have minimum length of 3"),
    body("gender").exists({ checkFalsy: true }).isIn(["M", "F","O"]).trim(),
  ];
};
const validateContactDetails = () => {
  return [
    body("address_line1")
      .exists()
      .optional({ checkFalsy: true })
      .isLength({ min: 3, max: 100 })
      .trim()
      .notEmpty()
      .withMessage("the address must have minimum length of 3"),
    body("address_line2")
      .exists()
      .optional({ checkFalsy: true })
      .isLength({ min: 3, max: 100 })
      .trim()
      .withMessage("the address2 must have minimum length of 3"),
    body("pin")
      .exists()
      .optional({ checkFalsy: true })
      .isLength({ max: 10 })
      .isInt()
      .withMessage("integers_only"),
    body("mobile")
      .exists()
      .optional({ checkFalsy: true })
      .matches(/^[0-9-+() ]*$/)
      .withMessage('Phone number must be a number'),
    body("land_line")
      .exists()
      .optional({ checkFalsy: true })
      .isInt()
      .withMessage("integers_only"),
    body("email")
      .exists()
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage("email_is_invalid")
      .trim()
      .escape(),
    body("country")
      .exists()
      .optional({ checkFalsy: true })
      .isInt()
      .withMessage("integers_only!"),
  ];
};
const validateBankDetails = () => {
  return [
    body("bankName")
      .exists()
      .optional({ checkFalsy: true })
      .isLength({ min: 3, max: 25 })
      .trim()
      .withMessage("the Bank name must have minimum length of 3"),
    body("branchName")
      .exists()
      .optional({ checkFalsy: true })
      .isLength({ min: 3, max: 25 })
      .trim()
      .withMessage("the Branch name must have minimum length of 3"),
    body("accountHolder")
      .exists()
      .optional({ checkFalsy: true })
      .isLength({ min: 3, max: 25 })
      .trim()
      .withMessage(
        "The acct_holder_name field must be at least 3 characters in length."
      ),
    body("accountNo")
      .exists()
      .optional({ checkFalsy: true })
      .if(body("bank_code").exists())
      .notEmpty()
      .isLength({ max: 10 })
      .isInt()
      .withMessage("integers only!"),
    body("ifsc")
      .exists()
      .optional({ checkFalsy: true })
      .isAlphanumeric()
      .withMessage("The ifsc field may only contain alpha-numeric characters."),
    body("pan")
      .exists()
      .optional({ checkFalsy: true })
      .isAlphanumeric()
      .withMessage(
        "The pan_no field may only contain alpha-numeric characters."
      ),
  ];
};
const validateSettingDetails = () => {
  return [
    body("language").exists().optional({ checkFalsy: true }).trim(),
    body("currency").exists().optional({ checkFalsy: true }).trim(),
    body("binaryLegSettings").exists().optional({ checkFalsy: true }).trim(),
  ];
};
const validatePaymentDetails = () => {
  return [
    body("paypalAccount")
      .exists()
      .optional({ checkFalsy: true })
      .trim()
      .isEmail()
      .withMessage("Invalid Email"),
    body("blockchainAccount")
      .exists()
      .optional({ checkFalsy: true })
      .trim()
      .isAlphanumeric(),
    body("bitgoAccount")
      .exists()
      .optional({ checkFalsy: true })
      .trim()
      .isAlphanumeric(),
    body("blocktrailAccount")
      .exists()
      .optional({ checkFalsy: true })
      .trim()
      .isAlphanumeric(),
    body("paymentMethod").exists().optional({ checkFalsy: true }).trim(),
  ];
};
const validateChangePassword = () => {
  return [
    body("current_password").trim().notEmpty().withMessage("Password required"),
    body("new_password")
      .trim()
      .notEmpty()
      .withMessage("Password required")
      .isLength({ min: 6 })
      .withMessage("password must be minimum 6 length"),
    // .matches(/(?=.*?[A-Z])/).withMessage('At least one Uppercase')
    // .matches(/(?=.*?[a-z])/).withMessage('At least one Lowercase')
    // .matches(/(?=.*?[0-9])/).withMessage('At least one Number')
    // .matches(/(?=.*?[#?!@$%^&*-])/).withMessage('At least one special character')
    // .not().matches(/^$|\s+/).withMessage('White space not allowed'),
    body("password_confirmation").custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error("Password Confirmation does not match password");
      }
      return true;
    }),
  ];
};
const validateChangeTransPassword = () => {
  return [
    body("current_password")
      .trim()
      .notEmpty()
      .withMessage("Current TransPassword required"),
    body("new_password")
      .trim()
      .notEmpty()
      .withMessage("TransPassword required")
      .isLength({ min: 8 })
      .withMessage("password must be minimum 6 length"),
    // .matches(/(?=.*?[A-Z])/).withMessage('At least one Uppercase')
    // .matches(/(?=.*?[a-z])/).withMessage('At least one Lowercase')
    // .matches(/(?=.*?[0-9])/).withMessage('At least one Number')
    // .matches(/(?=.*?[#?!@$%^&*-])/).withMessage('At least one special character')
    // .not().matches(/^$|\s+/).withMessage('White space not allowed'),
    body("password_confirmation").custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error(
          "Transpassword Confirmation does not match Transpassword"
        );
      }
      return true;
    }),
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
    if (
      err.param == "firstName" ||
      err.param == "accountHolder" ||
      err.param == "pan" ||
      err.param == "ifsc"
    ) {
      extractedErrors[`${err.param}`] = "min_length";
    }
    if (err.param == "pan" || err.param == "ifsc") {
      extractedErrors[`${err.param}`] = "invalid";
    }
  });
  const result = {
    code: 1004,
    description: "Incorrect Input Format / Validation Error",
    fields: extractedErrors,
  };
  return res.status(422).json({
    status: false,
    error: result,
  });
};

module.exports = {
  validatePersonalDetails,
  validateContactDetails,
  validateBankDetails,
  validateSettingDetails,
  validateChangePassword,
  validateChangeTransPassword,
  validatePaymentDetails,
  validate,
};
