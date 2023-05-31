const db = require("../../models");
const { successMessage, errorMessage } = require("../../utils/web/response");
const { mlm_laravel } = require("../../models");
const moment = require("moment");
const common = require("../../utils/web/common");
const uploadCrm = require("../../middleware/web/crmUpload");
const crmService = require("../../utils/web/crmService");
const { request } = require("express");
const leads = db.crmLeads;
const Followup = db.crmFollowup;
const multer = require("multer");

exports.getCrmTiles = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const user_id = req.user.id;
    let data = {
      ongoing_leads_count_today: await crmService.getLeadsCount(
        1,
        "today",
        user_id,
        prefix
      ),
      total_ongoing_leads_count: await crmService.getLeadsCount(
        1,
        "total",
        user_id,
        prefix
      ),
      total_accepted_leads_count: await crmService.getLeadsCount(
        2,
        "total",
        user_id,
        prefix
      ),
      total_rejected_leads_count: await crmService.getLeadsCount(
        0,
        "total",
        user_id,
        prefix
      ),
    };
    let response = await successMessage({
      value: data,
    });
    return res.json(response);
  } catch (err) {
    return res.json(err.message);
  }
};

exports.getFollowup = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;
    let data = {
      followupsmissed: await crmService.getTodaysFollowups(id,"missed", prefix),
      followupstoday: await crmService.getTodaysFollowups(id,"today", prefix),
      followuprecent: await crmService.getTodaysFollowups(id,"recent", prefix),
    };
    let response = await successMessage({
      value: data,
    });
    return res.json(response);
  } catch (err) {
    return res.json(err.message);
  }
};

exports.getViewLeads = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const user_id = req.user.id;
    let searchArr = req.query;
    const leads = await crmService.searchLeads(searchArr, user_id, prefix);
    let data = {
      leads: leads,
    };
    let response = await successMessage({
      value: data,
    });
    return res.json(response);
  } catch (err) {
    console.log(err)
    return res.json(err.message);
  }
};
exports.addNextFollowup = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    let postArr = req.body;
    let newFollowupDate = postArr["followup_date"];
    let id = postArr["id"];
    let result = await crmService.updateFollowupDate(
      newFollowupDate,
      id,
      prefix
    );
    if (result) {
      let response = await successMessage({
        code: 200,
      });
      return res.json(response);
    }
  } catch (err) {
    return res.json(err.message);
  }
};

exports.addLeads = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    let postArr = req.body;
    const user_id = req.user.id;
    if (postArr["interest_status"] == "Not That Interested") {
      var status = 0;
    } else if (postArr["interest_status"] == "Interested") {
      var status = 1;
    } else {
      var status = 2;
    }
    if (postArr["email_id"]) {
      let existingUser = await crmService.getUserIdByEmail(postArr["email_id"],prefix);
      if (existingUser > 0) {
        let response = await errorMessage({
          code: 1062,
        });

        return res.json(response);
      }
    }

    let result = await leads.create(
      {
        first_name: postArr["first_name"],
        last_name: postArr["last_name"],
        email_id: postArr["email_id"],
        skype_id: postArr["skype_id"],
        mobile_no: postArr["mobile_no"],
        country_id: postArr["country"] ? postArr["country"] : null,
        description: postArr["description"],
        interest_status: status,
        followup_date: postArr["followup_date"],
        lead_status:
          postArr["lead_status"] == "Rejected"
            ? 0
            : postArr["lead_status"] == "Ongoing"
            ? 1
            : 2,
        added_by: user_id,
        date: Date.now(),
      },
      { prefix }
    );

    let response = await successMessage({
      code: 200,
    });
    return res.json(response);
  } catch (err) {
    console.log(err);
  }
};

exports.editLeads = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    let putArr = req.body;
    const id = req.params.id;
    let userLead = await leads.findOne({
      where: {
        id: id,
      },
      prefix,
    });
    if (putArr.lead_status != "Ongoing") {
      var confirmationDate = putArr.status_change_date;
      if (putArr.lead_status == "Rejected") {
        var interestStatus = 0;
      } else if (putArr.lead_status == "Accepted") {
        var interestStatus = 2;
      }
    }
    let data = {
      first_name: putArr["first_name"],
      last_name: putArr["last_name"] ? putArr["last_name"] : "",
      email_id: putArr["email_id"],
      skype_id: putArr["skype_id"],
      mobile_no: putArr["mobile_no"],
      country_id: putArr["country"],
      description: putArr["description"],
      interest_status:
        putArr["interest_status"] == "Very Interested"
          ? 2
          : putArr["interest_status"] == "Interested"
          ? 1
          : 0,
      confirmation_date: confirmationDate
        ? moment(confirmationDate).format("YYYY-MM-DD hh:mm:ss")
        : null,
      lead_status:
        putArr["lead_status"] == "Rejected"
          ? 0
          : putArr["lead_status"] == "Ongoing"
          ? 1
          : 2,
    };
    await userLead.update(data, {}, prefix);
    let response = await successMessage({
      code: 200,
    });
    return res.json(response);
  } catch (err) {
    console.log(err)
    return res.json(err.message);
  }
};

exports.addFollowup = async (req, res) => {
  let t = await mlm_laravel.transaction();
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const user_id = req.user.id;
    await uploadCrm(req, res, async function (err) {
      if (err != undefined) {
        if (err instanceof multer.MulterError) {
          if (err.code == "LIMIT_FILE_SIZE") {
            let response = await errorMessage({ code: 1018 });
            return res.status(500).json(response);
          }
        } else if (err) {
          // An unknown error occurred when uploading.
          if (err.message == "Only images jpg|jpeg|png|pdf are allowed") {
            let response = await errorMessage({ code: 1017 });
            return res.status(500).json(response);
          } else {
            let response = await errorMessage({ code: 1024 });
            return res.status(500).json(response);
          }
        }
      } else {
        let postArr = req.body;
        await Followup.create(
          {
            lead_id: postArr.id,
            followup_entered_by: user_id,
            description: postArr.description,
            image: req?.file?.filename ? `${process.env.image_url}crm/${req.file.filename}` : "",
            followup_date: postArr.followup_date,
          },
          {
            transaction: t,
            prefix,
          }
        );
        let userLeads = await leads.findOne({
          where: {
            id: postArr.id,
          },
          prefix,
        });
        await userLeads.update(
          {
            followup_date: postArr.followup_date,
          },
          {
            transaction: t,
          },
          prefix
        );
        await t.commit();
        let response = await successMessage({
          code: 200,
        });
        return res.json(response);
      }
    });
  } catch (err) {
    await t.rollback();
    return res.json(err.message);
  }
};

exports.timeline = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    let historyArr = [];
    let lead_id = req.query.id;
    display = false;
    leadDetails = await crmService.getLeadDetails(lead_id, prefix);
    if (leadDetails.length < 1) {
      let response = await errorMessage({
        code: 1061,
      });
      return res.json(response);
    }
    let leadHistory = await Followup.findAll({
      where: {
        lead_id: lead_id,
      },
      order: ["updated_at"],
      prefix,
    });
    for await (let [key, value] of Object.entries(leadHistory)) {
      if (value.image) {
        value.image = value.image;
      }
      historyArr[key] = {
        id: value.id,
        lead_id: value.lead_id,
        description: value.description,
        followup_entered_by: value.followup_entered_by,
        add_by: await common.idToUsername(value.followup_entered_by),
        month_year: `${moment(value.created_at).format("Y")} ${moment(
          value.created_at
        ).format("MMM")}`,
        month_year_day: `${moment(value.created_at).format("D")} ${moment(
          value.created_at
        ).format("MMM")} ${moment(value.created_at).format("Y")}`,
        next_followup: `${moment(value.followup_date).format("D")} ${moment(
          value.followup_date
        ).format("MMM")} ${moment(value.followup_date).format("Y")}`,
        file_name: value.image,
      };
    }
    display = true;
    let data = {
      display: display,
      lead_details: leadDetails,
      followup_history: historyArr,
      lead_completeness: leadDetails.percentage,
      color: leadDetails.color,
    };
    let response = await successMessage({ value: data });
    return res.json(response);
  } catch (err) {
    console.log(err);
    return res.json(err.message);
  }
};

exports.graph = async (req, res) => {
  const prefix = req.headers["api-key"];
  if (!prefix) {
    let response = await errorMessage({ code: 1001 });
    return res.json(response);
  }
  const user_id = req.user.id;
  let [ongoingLeadMonth, acceptedLeadMonth, rejectedLeadMonth] = [[], [], []];
  let [ongoingLeadDay, acceptedLeadDay, rejectedLeadDay, leadDayTicks] = [
    [],
    [],
    [],
    [],
  ];
  let joiningDetailsPerMonth = await crmService.getJoiningDetailsperMonth(
    user_id,
    prefix
  );
  let joiningDetailsPerDays = await crmService.getJoiningDetailsperDay(
    user_id,
    prefix
  );
  joiningDetailsPerMonth.map((value) => {
    ongoingLeadMonth.push(value.ongoing);
    acceptedLeadMonth.push(value.accepted);
    rejectedLeadMonth.push(value.rejected);
  });
  joiningDetailsPerDays.map((value) => {
    ongoingLeadDay.push({ label: value.day, value: value.ongoing });
    acceptedLeadDay.push({ label: value.day, value: value.accepted });
    rejectedLeadDay.push({ label: value.day, value: value.rejected });
    leadDayTicks.push(value.day);
  });
  let data = {
    ongoing_leads_month: ongoingLeadMonth,
    accepted_leads_month: acceptedLeadMonth,
    rejected_leads_month: rejectedLeadMonth,
    ongoing_leads_day: ongoingLeadDay,
    accepted_leads_day: acceptedLeadDay,
    rejected_leads_day: rejectedLeadDay,
    leads_day_ticks: leadDayTicks,
  };
  let response = await successMessage({ value: data });
  return res.json(response);
};
