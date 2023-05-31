const db = require('../../models')
const termsCondition = db.termsAndCondition


exports.getTermsAndCondition = async(prefix) => {
    const terms = await termsCondition.findOne({prefix})  

    return terms.terms_and_conditions
}