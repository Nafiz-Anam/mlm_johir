const db = require("../../models");
const common = require("../../utils/web/common");
const moment = require("moment");
const { successMessage, errorMessage } = require("../../utils/web/response");
const Leads = db.crmLeads;

exports.addLcp = async (req, res) => {
    let postArr = req.body;
    const prefix = req.headers["api-key"];
    if (!prefix) {
        let response = await errorMessage({ code: 1001 });
        return res.json(response);
    }
    try {
        const user_id = await common.usernameToId(postArr.user_name, prefix);
        if (postArr.country) {
            var countryId = await common.countrynameToId(
                postArr.country,
                prefix
            );
            if (countryId == false) {
                let response = await errorMessage({ code: 1030 });
                return res.status(422).json(response);
            }
        }
        await Leads.create(
            {
                first_name: postArr["first_name"],
                last_name: postArr["last_name"],
                email_id: postArr["email"],
                skype_id: postArr["skype_id"],
                mobile_no: postArr["phone"],
                country_id: countryId,
                description: postArr["comment"],
                interest_status: 1,
                followup_date: moment(new Date()).format("YYYY-MM-DD hh:mm:ss"),
                lead_status: 1,
                added_by: user_id,
                date: moment(new Date()).format("YYYY-MM-DD hh:mm:ss"),
            },
            { prefix }
        );
        let response = await successMessage({
            message: `thanks_for_your_interest ${postArr.user_name}`,
        });
        return res.json(response);
    } catch (err) {
        // let response = await errorMessage({code:1003})
        return res.json(err.message);
    }
};
