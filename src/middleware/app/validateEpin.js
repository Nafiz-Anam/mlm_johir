const {
    body,
    validationResult
} = require('express-validator')

var startDate = new Date();

const validateEpinPurchase = () => {
    return [
        body('pin_count').trim().notEmpty().withMessage('Count field required'),
        body('amount').trim().notEmpty().withMessage('Amount ID field required'),
        body('passcode').trim().notEmpty().withMessage('Password field required'),
        body('expiry_date').trim().notEmpty().withMessage('Expiry date field required')
    ]
}

const validateEpinRequest = () => {
    return [
        body('pin_count').trim().notEmpty().withMessage('Count field required'),
        body('amount').trim().notEmpty().withMessage('Amount ID field required'),
        body('expiry_date').trim().notEmpty().withMessage('Expiry date field required')
    ]
}

const validateEpinTransfer = () => {
    return [
        body('epin').trim().notEmpty().withMessage('E-Pin is required'),
        body('transfer_user').trim().notEmpty().withMessage('To Username field required'),
    ]
}

const validate = (req ,res ,next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        return next()
    }
    const extractedErrors = {};
  errors.array().map((err) => {
    extractedErrors[`${err.param}`] = err.msg;
  });
    const result = {
        'code' : '1004',
        'description' : 'Incorrect Input Format / Validation Error',
        'fields' : extractedErrors
    }
    return res.status(422).json({
        status : false,
        errors : result
    })
}

module.exports = {
    validateEpinPurchase,
    validateEpinRequest,
    validateEpinTransfer,
    validate
}