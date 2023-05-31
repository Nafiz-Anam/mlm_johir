const {
    body,
    validationResult
} = require('express-validator')

const validateNewAddress = () => {
    return [
        body('name').trim().notEmpty().isLength({min:3},{max:32}).isAlpha('en-US',{ignore: ' '}).withMessage('name field required'),
        body('address').trim().notEmpty().isLength({min:3},{max:32}).withMessage('Address field required'),
        body('zip_code').trim().notEmpty().isLength({min:3},{max:10}).withMessage('zipcode field required'),
        body('city').trim().notEmpty().isAlpha('en-US',{ignore: ' '}).withMessage('city field required'),
        body('phone').trim().notEmpty().isLength({min:3},{max:10}).withMessage('mobile field required')
    ]
}

const validateAddToCart = () => {
    return [
        body('product_id').trim().notEmpty().isNumeric().withMessage('name field required'),
        body('product_qty').trim().notEmpty().isNumeric().withMessage('quantity field required')
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
    validateNewAddress,
    validateAddToCart,
    validate
}