const { body, validationResult } = require("express-validator");

var startDate = new Date();

exports.validateAddFollowup = () => {
  return [
    body("lead_name").trim().notEmpty().withMessage("Lead field required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("You must enter Description"),
    body("followup_date")
      .trim()
      .notEmpty()
      // .isBefore('followup_date',new Date().toDateString())
      .withMessage("followup date required"),
  ];
};

exports.validateAddOrEditLead = () => {
  return [
    body("country")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .withMessage("Country field is required"),
    body("description")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .withMessage("Description is required"),
    body("email_id")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage("Email is required"),
    body("first_name")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .isLength({ min: 2, max: 26 })
      .withMessage("First name is required"),
    body("followup_date")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      // .isDate()
      // .isBefore('followup_date',new Date().toDateString())
      .withMessage("Date is required"),
    body("interest_status")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .withMessage("Interest Status is required"),
    body("last_name")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .isLength({ min: 1, max: 26 })
      .withMessage("Last name is required"),
    body("lead_status")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .withMessage("Lead Status is required"),
    body("mobile_no")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .isInt()
      .withMessage("Mobile Number is required"),
    body("skype_id")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
      .withMessage("Skype Id is required"),
    body("status_change_date")
      .trim()
      .exists()
      .optional({ checkFalsy: true })
    //   .isDate()
      // .isBefore(new Date(startDate).toDateString())
      .withMessage("Status Change Date required"),
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
