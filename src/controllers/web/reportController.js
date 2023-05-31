const db = require("../../models");
const { errorMessage } = require("../../utils/web/response");
const ReportServices = require("../../utils/web/reportServices");
const pinTransHistory = db.pinTransHistory;
const UserDetails = db.userDetails;
const LegAmt = db.legAmt;
const User = db.user;

exports.getEpinTransferReport = async (req, res) => {
  const id = 2;
  const result = await pinTransHistory.findAll({
    where: { from_user: id },
    include: [
      {
        model: User,
        attributes: ["id"],
        as: "user2",
        include: [
          {
            model: UserDetails,
            as: "details",
          },
        ],
      },
    ],
  });

  res.json(result);
};

exports.getCommissionReport = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;
    let totalpoints = [];
    let types = ["level", "daily_investment", "refferal"];
    const { type, start_date, end_date, length, start } = req.query;
    let filters = {
      limit: parseInt(length) ? parseInt(length) : null,
      start: parseInt(start) ? parseInt(start) : 0,
    };
    for await (let item of types) {
      let typeBasedReward = await ReportServices.getTotalCommissionPoint(
        id,
        item,
        prefix
      );
      totalpoints = [...totalpoints, typeBasedReward];
    }
    let result = await ReportServices.commissionReport(
      type,
      filters,
      start_date,
      end_date,
      id,
      prefix
    );
    result = { ...result, totalpoints };
    return res.json({ status: true, data: result });
  } catch (error) {
    console.log(error);
    let response = await errorMessage({ code: 406 });
    return response;
  }
};

exports.getCommissionReportExport = async (req, res) => {
  try {
    let prefix = req.headers["api-key"],
      result = [];
    const { id } = req.user;
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }

    result = await LegAmt.findAll({
      attributes: ["amount_payable", "service_charge", "tds", "amount_type"],

      where: {
        user_id: id,
      },
      prefix,
    });

    for await (let [key, value] of Object.entries(result)) {
      type = value?.amount_type ? value.amount_type : "";
      // value.amount_type == "level"
      //   ? "Level"
      //   : value.amount_type == "daily_investment"
      //   ? "Daily Investment "
      //   : value.amount_type == "refferal"
      //   ? "Referal"
      //   : "";
      result[key] = {
        id: Number(key) + 1,
        amount: value?.amount_payable ? value.amount_payable : "",
        // serviceCharge: value?.service_charge ? value.service_charge : "",
        tax: value?.tds ? value.tds : "",
        // ocProductId: value?.oc_product_id ? value.oc_product_id : "",
        type,
      };
    }
    return res.json({ status: true, data: { result } });
  } catch (error) {
    console.log(error);
    let response = await errorMessage({ code: 406 });
    return response;
  }
};
