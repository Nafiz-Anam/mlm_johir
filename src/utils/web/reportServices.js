const { Op, Sequelize } = require("sequelize");
const db = require("../../models");
const LegAmt = db.legAmt;
const OcProducts = db.ocProducts;
// const EwalletHistory = db.ewalletHistory;
// const PaymentConfig = db.paymentConfig;
// const UserDetails = db.userDetails;
// const User = db.user;

exports.getTotalCommissionPoint = async (id, amount_type, prefix) => {
  try {
    let total = await LegAmt.findAll({
      attributes: [
        [Sequelize.fn("sum", Sequelize.col("amount_payable")), "total_amount"],
      ],
      where: {
        amount_type,
        from_id: id,
      },
      raw: true,
      prefix,
    });
    return {
      type: amount_type,
      total: total[0].total_amount ? total[0].total_amount : 0,
    };
  } catch (error) {
    console.log(error);
    return {
      type: amount_type,
      total: 0,
    };
  }
};

exports.commissionReport = async (
  type,
  filters,
  startDate,
  endDate,
  userId,
  prefix
) => {
  let result = [],
    data = [],
    whereStatement = [],
    newEndDate = new Date(endDate);
  let typevalue = type ? type.split(",") : [];
  typevalue.forEach((element, index) => {
    if (element == "Level") {
      typevalue[index] = "level";
    } else if (element == "Daily Investment") {
      typevalue[index] = "daily_investment";
    } else if (element == "Refferal") {
      typevalue[index] = "refferal";
    }
  });
  try {
    let condition1 = {
      created_at: {
        [Op.gt]: new Date(startDate),
        [Op.lte]: newEndDate.setDate(newEndDate.getDate() + 1),
      },
      user_id: userId,
    };
    whereStatement.push(condition1);
    if (type != "") {
      let condition2 = {
        amount_type: typevalue,
      };
      whereStatement.push(condition2);
    }

    result = await LegAmt.findAll({
      attributes: ["amount_payable", "service_charge", "tds", "amount_type"],

      where: whereStatement,
      offset: filters.start,
      limit: filters.limit,
      prefix,
    });

    let totalcount = await LegAmt.findAll({
      attributes: ["amount_payable", "service_charge", "tds"],

      where: whereStatement,
      prefix,
    });

    for await (let [key, value] of Object.entries(result)) {
      type =
        value.amount_type == "level"
          ? "Level"
          : value.amount_type == "daily_investment"
          ? "Daily Investment"
          : value.amount_type == "refferal"
          ? "Refferal"
          : "";
      data[key] = {
        id: Number(key) + 1,
        amount: value?.amount_payable ? value.amount_payable : "",
        serviceCharge: value?.service_charge ? value.service_charge : "",
        tax: value?.tds ? value.tds : "",
        type,
      };
    }
    return {
      table_data: data,
      count: totalcount.length,
    };
  } catch (error) {
    console.log(error);
    return { table_data: [], count0 };
  }
};
