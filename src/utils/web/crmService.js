const { Op } = require("sequelize");
const db = require("../../models");
const common = require("../../utils/web/common");
const _ = require("lodash");
const leads = db.crmLeads;
const moment = require("moment");

exports.getLeadsCount = async (type, today, user_id, prefix) => {
    let whereStatement = [];
    if (today == "today") {
        const TODAY_START = new Date().setHours(0, 0, 0, 0);
        const NOW = new Date();
        let condition1 = {
            created_at: {
                [Op.gt]: TODAY_START,
                [Op.lt]: NOW,
            },
        };
        whereStatement.push(condition1);
    }
    let condition2 = {
        lead_status: type,
        added_by: user_id,
    };
    whereStatement.push(condition2);

    let Leads = await leads.findAll({
        where: whereStatement,
        prefix,
    });
    let count = Leads.length;
    return count;
};

exports.updateFollowupDate = async (date, id, prefix) => {
    let userLead = await leads.findOne({
        where: {
            id: id,
        },
        prefix,
    });
    let result = await userLead.update(
        {
            followup_date: date,
        },
        {},
        prefix
    );
    return result ? true : false;
};
exports.getUserIdByEmail = async (email, prefix) => {
    let Total = await leads.findAll({
        where: {
            email_id: email,
        },
        prefix,
    });
    let count = Total.length;
    return count;
};

exports.getTodaysFollowups = async (id, type, prefix) => {
    let whereStatement = [];
    if (type == "today") {
        const TODAY_START = new Date().setHours(0, 0, 0);
        const TODAY_END = new Date().setHours(23, 59, 59);
        let condition1 = {
            followup_date: {
                [Op.gte]: TODAY_START,
                [Op.lte]: TODAY_END,
            },
        };
        whereStatement.push(condition1);
    } else if (type == "missed") {
        let condition2 = {
            followup_date: {
                [Op.lt]: Date.now(),
            },
        };
        whereStatement.push(condition2);
    }
    let condition3 = {
        lead_status: 1,
        added_by: id,
    };
    whereStatement.push(condition3);
    let result = await leads.findAll({
        where: whereStatement,
        prefix,
    });
    var PercArr = [];
    for await (let [key, value] of Object.entries(result)) {
        var percentage = 0;
        var color = "green";
        if (value.last_name) {
            percentage += 10;
        }
        if (value.first_name) {
            percentage += 15;
        }
        if (value.country_id) {
            percentage += 15;
        }
        if (value.email_id) {
            percentage += 15;
        }
        if (value.skype_id) {
            percentage += 15;
        }
        if (value.description) {
            percentage += 15;
        }
        if (value.mobile_no) {
            percentage += 15;
        }
        if (percentage <= 50) {
            color = "#f56b6b";
        } else if (percentage <= 75) {
            color = "#F5870A";
        } else if (percentage <= 99) {
            color = "rgba(50, 200, 150, 1)";
        }
        if (value.lead_status == "1") {
            value.lead_status = "Ongoing";
        } else if (value.lead_status == "2") {
            value.lead_status = "Accepted";
        } else {
            value.lead_status = "Rejected";
        }

        if (value.interest_status == "1") {
            value.interest_status = "Interested";
        } else if (value.interest_status == "2") {
            value.interest_status = "Very Interested";
        } else {
            value.interest_status = "Not That Interested";
        }
        let PercentageObj = {
            ...value.dataValues,
            ["lead_completeness"]: percentage,
            ["color"]: color,
            ["date"]: moment(value.createdAt).format("DD ,MMM-YYYY"),
            ["country"]: value.country_id,
            ["added_by_name"]: await common.idToUsername(
                value.added_by,
                prefix
            ),
        };
        PercArr.push(PercentageObj);
    }
    return PercArr;
};

exports.searchLeads = async (searchArr, user_id, prefix) => {
    let whereStatement = [];
    try {
        if (searchArr.user_name != "") {
            var tag = searchArr.user_name;
            let condition1 = {
                [Op.or]: {
                    first_name: {
                        [Op.like]: tag,
                    },
                    last_name: {
                        [Op.like]: tag,
                    },
                    email_id: {
                        [Op.like]: tag,
                    },
                    mobile_no: {
                        [Op.like]: tag,
                    },
                    skype_id: {
                        [Op.like]: tag,
                    },
                },
            };
            whereStatement.push(condition1);
        }
        if (searchArr.followup_date_from != "") {
            let condition2 = {
                followup_date: {
                    [Op.gte]: searchArr.followup_date_from,
                },
            };
            whereStatement.push(condition2);
        }
        if (searchArr.followup_date_to != "") {
            let condition3 = {
                followup_date: {
                    [Op.lte]: searchArr.followup_date_to,
                },
            };
            whereStatement.push(condition3);
        }
        if (searchArr.followup_added_date_from != "") {
            let condition2 = {
                created_at: {
                    [Op.gte]: searchArr.followup_added_date_from,
                },
            };
            whereStatement.push(condition2);
        }
        if (searchArr.followup_added_date_to != "") {
            let condition3 = {
                created_at: {
                    [Op.lte]: searchArr.followup_added_date_to,
                },
            };
            whereStatement.push(condition3);
        }
        if (searchArr.interest_status != "All") {
            if (
                searchArr.interest_status == "interested" ||
                searchArr.interest_status == "Interested"
            ) {
                var interestStatus = 1;
            } else if (
                searchArr.interest_status == "very_interested" ||
                searchArr.interest_status == "Very Interested"
            ) {
                var interestStatus = 2;
            } else if (
                searchArr.interest_status == "not_interested" ||
                searchArr.interest_status == "Not That Interested"
            ) {
                var interestStatus = 0;
            }
            let condition4 = {
                interest_status: interestStatus,
            };
            whereStatement.push(condition4);
        }
        if (searchArr.lead_status != "All") {
            if (searchArr.lead_status == "Ongoing") {
                var leadStatus = 1;
            } else if (searchArr.lead_status == "Rejected") {
                var leadStatus = 0;
            } else if (searchArr.lead_status == "Accepted") {
                var leadStatus = 2;
            }
            if (searchArr.lead_status != "Ongoing") {
                if (searchArr.status_date_from != "") {
                    let condition5 = {
                        confirmation_date: {
                            [Op.gte]: searchArr.status_date_from,
                        },
                    };
                    whereStatement.push(condition5);
                }
                if (searchArr.status_date_to != "") {
                    let condition6 = {
                        confirmation_date: {
                            [Op.lte]: searchArr.status_date_to,
                        },
                    };
                    whereStatement.push(condition6);
                }
            }
            let condition7 = {
                lead_status: leadStatus,
            };
            whereStatement.push(condition7);
        }
        if (searchArr.country != "") {
            let condition8 = {
                country_id: searchArr.country,
            };
            whereStatement.push(condition8);
        }
        let condition9 = {
            added_by: user_id,
        };
        whereStatement.push(condition9);
        let result = await leads.findAll({
            where: whereStatement,
            prefix,
        });
        var PercArr = [];
        result.map((value, key) => {
            var percentage = 0;
            var color = "green";
            if (value.last_name) {
                percentage += 10;
            }
            if (value.first_name) {
                percentage += 15;
            }
            if (value.country_id) {
                percentage += 15;
            }
            if (value.email_id) {
                percentage += 15;
            }
            if (value.description) {
                percentage += 15;
            }
            if (value.mobile_no) {
                percentage += 15;
            }
            if (value.skype_id) {
                percentage += 15;
            }
            if (percentage <= 50) {
                color = "#f56b6b";
            } else if (percentage <= 75) {
                color = "#F5870A";
            } else if (percentage <= 99) {
                color = "rgba(50, 200, 150, 1)";
            }
            if (value.lead_status == "1") {
                value.lead_status = "Ongoing";
            } else if (value.lead_status == "2") {
                value.lead_status = "Accepted";
            } else {
                value.lead_status = "Rejected";
            }

            if (value.interest_status == "1") {
                value.interest_status = "Interested";
            } else if (value.interest_status == "2") {
                value.interest_status = "Very Interested";
            } else {
                value.interest_status = "Not That Interested";
            }

            let PercentageObj = {
                ...value.dataValues,
                ["lead_completeness"]: percentage,
                ["color"]: color,
                ["date"]: moment(value.createdAt).format("DD ,MMM-YYYY"),
                ["country"]: value.country_id,
            };
            PercArr.push(PercentageObj);
        });
        return PercArr;
    } catch (error) {
        return error.message;
    }
};

exports.getLeadDetails = async (lead_id, prefix) => {
    let whereStatement = [];
    if (lead_id) {
        let condition1 = {
            id: lead_id,
        };
        whereStatement.push(condition1);
    }
    let result = await leads.findAll({
        where: whereStatement,
        prefix,
    });
    let leadsArr = [];
    for await (let [key, value] of Object.entries(result)) {
        leadsArr[key] = {
            id: value.id,
            description: value.description ? value.description : "NA",
            followup_date: value.followup_date ? value.followup_date : "NA",
            country_name: value.country_id
                ? await common.idToCountryName(value.country_id, prefix)
                : "NA",
            country: value.country_id,
            added_by_name: value.added_by
                ? await common.idToUsername(value.added_by, prefix)
                : "NA",
            email_id: value.email_id ? value.email_id : "NA",
            lead_id: "LEAD0000" + value.id,
            first_name: value.first_name ? value.first_name : "NA",
            last_name: value.last_name ? value.last_name : "NA",
            lead_status:
                value.lead_status == 1
                    ? "Ongoing"
                    : value.lead_status == 2
                    ? "Accepted"
                    : "Rejected",
            date: moment(value.created_at).format("DD, MMM-YYYY"),
            mobile_no: value.mobile_no ? value.mobile_no : "NA",
            skype_id: value.skype_id ? value.skype_id : "NA",
            interest_status:
                value.interest_status == 1
                    ? "Interested"
                    : value.interest_status == 2
                    ? "Very Interested"
                    : "No Interested",
        };
    }
    let PercentageObj = {};
    leadsArr.map((value, key) => {
        var percentage = 0;
        var color = "green";
        if (value.last_name != "NA") {
            percentage += 10;
        }
        if (value.first_name != "NA") {
            percentage += 15;
        }
        if (value.country_name != "NA") {
            percentage += 15;
        }
        if (value.email_id != "NA") {
            percentage += 15;
        }
        if (value.description != "NA") {
            percentage += 15;
        }
        if (value.mobile_no != "NA") {
            percentage += 15;
        }
        if (value.skype_id != "NA") {
            percentage += 15;
        }
        if (percentage <= 50) {
            color = "#f56b6b";
        } else if (percentage <= 75) {
            color = "#F5870A";
        } else if (percentage <= 99) {
            color = "rgba(50, 200, 150, 1)";
        }
        PercentageObj = {
            ...value,
            ["percentage"]: percentage,
            ["color"]: color,
        };
        // PercArr.push(PercentageObj)
    });
    return PercentageObj;
};

exports.getJoiningDetailsperMonth = async (userId, prefix) => {
    let data = [];
    for (let i = 0; i < 12; i++) {
        let startDate = new Date(new Date().getFullYear(), 0, 1);
        startDate.setMonth(startDate.getMonth() + i);
        let endDate = new Date(
            startDate.getFullYear(),
            startDate.getMonth() + 1,
            0
        ).setHours(23, 59, 59, 999);
        let accepted = await getJoiningCountPerMonth(
            startDate,
            endDate,
            userId,
            "Accepted",
            prefix
        );
        let rejected = await getJoiningCountPerMonth(
            startDate,
            endDate,
            userId,
            "Rejected",
            prefix
        );
        let ongoing = await getJoiningCountPerMonth(
            startDate,
            endDate,
            userId,
            "Ongoing",
            prefix
        );
        data[i] = {
            accepted: accepted,
            rejected: rejected,
            ongoing: ongoing,
        };
    }
    return data;
};

exports.getJoiningDetailsperDay = async (userId, prefix) => {
    let data = [];
    let numOfDays = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
    ).getDate();
    for (let i = 0; i < numOfDays; i++) {
        let startDate = new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
        );
        startDate.setDate(startDate.getDate() + i);
        let endDate = new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
        );
        endDate.setDate(endDate.getDate() + i);
        endDate.setHours(23, 59, 59, 999);
        let accepted = await getJoiningCountPerMonth(
            startDate,
            endDate,
            userId,
            "Accepted",
            prefix
        );
        let rejected = await getJoiningCountPerMonth(
            startDate,
            endDate,
            userId,
            "Rejected",
            prefix
        );
        let ongoing = await getJoiningCountPerMonth(
            startDate,
            endDate,
            userId,
            "Ongoing",
            prefix
        );
        data[i] = {
            day: i + 1,
            accepted: accepted,
            rejected: rejected,
            ongoing: ongoing,
        };
    }
    return data;
};

async function getJoiningCountPerMonth(
    startDate,
    endDate,
    userId,
    leadStatus,
    prefix
) {
    let whereStatement = [];
    if (userId) {
        let condition1 = {
            added_by: userId,
        };
        whereStatement.push(condition1);
    }
    console.log("===========", leadStatus);
    if (leadStatus) {
        if (leadStatus == "Ongoing") {
            var leadStatus = 1;
            let condition3 = {
                created_at: {
                    [Op.between]: [startDate, endDate],
                },
            };
            whereStatement.push(condition3);
        } else if (leadStatus == "Rejected") {
            var leadStatus = 0;
            let condition3 = {
                confirmation_date: {
                    [Op.between]: [startDate, endDate],
                },
            };
            whereStatement.push(condition3);
        } else if (leadStatus == "Accepted") {
            var leadStatus = 2;
            let condition3 = {
                confirmation_date: {
                    [Op.between]: [startDate, endDate],
                },
            };
            whereStatement.push(condition3);
        }
        let condition2 = {
            lead_status: leadStatus,
        };
        whereStatement.push(condition2);
    }
    let leadCount = await leads.findAll({
        where: whereStatement,
        prefix,
    });
    let count = leadCount.length;
    return count;
}
