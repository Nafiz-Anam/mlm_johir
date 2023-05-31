const db = require('../../models')
const passPolicy = db.passwordPolicy

exports.getPasswordPolicy = async (prefix) => {
    var passwdPolicy = await passPolicy.findOne({prefix})
    if (passwdPolicy.enable_policy) {
        var policyArray = {
            'disableHelper': true,
            'mixedcase' : passwdPolicy.mixed_case,
            'number': passwdPolicy.number,
            'sp_char': passwdPolicy.sp_char,
            'min_length': passwdPolicy.min_length,
        }
        if(!passwdPolicy.lowercase && !passwdPolicy.uppercase && !passwdPolicy.sp_char) {
            policyArray = {
                'disableHelper' : false
            }
        }
    } else {
        var policyArray = {
            'disableHelper': false,
            'min_length': passwdPolicy.min_length
        }
    }
    return policyArray
}