const db = require('../../models')
const Status = db.moduleStatus

exports.getModuleStatus = async(prefix)=>{
    const moduleStatus = await Status.findOne({prefix})
    return moduleStatus
}
