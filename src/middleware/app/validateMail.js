const { body, validationResult } = require("express-validator");

exports.validateReplyMail = () => {
  return [
    body("subject").trim().notEmpty().withMessage("Subject field required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
    body("mail_id").trim().notEmpty().withMessage("Mail is required"),
  ];
};

exports.validateSendMail = () =>{ 
  return [
    body("subject").trim().notEmpty().withMessage("Subject field required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
    body("type").trim().notEmpty().withMessage("Type is required"),
  ];
}

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
