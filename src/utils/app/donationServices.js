const { Op } = require("sequelize");
const db = require("../../models");
const DonationHistory = db.donationHistory;
const Common = require("../../utils/app/common");
const DonationTransferHistory = db.donationTransferHistory;
const DonationLevel = db.donationLevel;
const DonationRates = db.donationRates;
const Tree = db.treepath;
const User = db.user;

exports.getRecieveDonationReport = async (
  id,
  page = "",
  limit = "",
  searchId = "",
  prefix
) => {
  let whereStatement = [],
    result = [];
  if (id != "") {
    let condition1 = {
      to_user: id,
    };
    whereStatement.push(condition1);
  }
  if (searchId != "") {
    let condition1 = {
      from_user: searchId,
    };
    whereStatement.push(condition1);
  }

  //TODO Page filter , limit
  const donationReceiveHistory = await DonationHistory.findAll({
    where: whereStatement,
    order: [["created_at", "DESC"]],
    prefix,
  });
  for await (let [key, value] of Object.entries(donationReceiveHistory)) {
    result[key] = {
      to_user_name: await Common.idToUsername(value.to_user, prefix),
      from_user_name: await Common.idToUsername(value.from_user, prefix),
      amount: value.amount,
      date: value.created_at,
      txn_no: value.transaction_id,
      to_level: value.level,
      to_levelname: await Common.idToLevelName(value.level, prefix),
      payment_type: value.transaction_concept,
      status: "Approved",
    };
  }
  return result;
};

exports.getSentDonationReport = async (
  id = "",
  page = "",
  limit = "",
  prefix
) => {
  let whereStatement = [],
    result = [];
  if (id != "") {
    let condition1 = {
      from_user: id,
    };
    whereStatement.push(condition1);
  }

  //TODO Page filter , limit
  const donationTransferHistory = await DonationTransferHistory.findAll({
    where: whereStatement,
    order: [["created_at", "DESC"]],
    prefix,
  });

  //TODO CHECK STATUS
  for await (let [key, value] of Object.entries(donationTransferHistory)) {
    result[key] = {
      to_user_name: await Common.idToUsername(value.to_user, prefix),
      from_user_name: await Common.idToUsername(value.from_user, prefix),
      amount: value.amount,
      date: value.created_at,
      txn_no: value.transaction_id,
      to_level: value.level,
      to_levelname: await Common.idToLevelName(value.level, prefix),
      status: "Approved",
      payment_type: value.payment_type,
    };
  }
  return result;
};

const getCurrentLevel = (exports.getCurrentLevel = async (id, prefix) => {
  const { level } = await DonationLevel.findOne({
    where: {
      user: id,
    },
    prefix,
  });
  return level;
});

exports.getDonationAmountTotal = async (prefix) => {
  let result = {};
  const donationRate = await DonationRates.findAll({
    prefix,
  });
  for await (let [key, value] of Object.entries(donationRate)) {
    result[`level${key}`] = value.name;
    result[`index${key}`] = value.id;
  }
  return result;
};

exports.getReferalCount = async (level = "", prefix) => {
  let referralCount = 0;
  if (level != "") {
    const details = await DonationRates.findOne({
      where: {
        id: {
          [Op.lte]: level,
        },
      },
      prefix,
    });
    for await (let value of Object.entries(details)) {
      referralCount += value.referral_count;
    }
  } else {
    //TODO
  }
  return referralCount;
};

exports.getDonationAmount = async (level = "", type = "", prefix) => {
  let column;
  if ((type = "bitcoin")) {
    column = "rate";
  } else {
    column = "pm_rate";
  }

  if (level != "") {
    const details = await DonationRates.findOne({
      attributes: [column],
      where: {
        id: level,
      },
      prefix,
    });
    return details[column];
  } else {
    //TODO
  }
};

exports.getLevelUser = async (level, id, prefix) => {
  let response = {};
  response["to_user"] = await Common.getAdminId(prefix);
  let uplineArray = await getAllUplineId(id, 0, prefix);
  if (uplineArray[level]) {
    //TODO CHECK
    let newid = uplineArray[level].id;
    let status = await checkUserLevelStatus(newid, level, prefix);
    if (status) {
      response["to_user"] = uplineArray[level].id;
    } else {
      response["exact_user"] = uplineArray[level].id;
    }
  }
  return response;
};

const getAllUplineId = (exports.getAllUplineId = async (id, i, prefix) => {
  let donationArray = await getDonationConfig(prefix);
  let uplineIdArray = [];
  let donationLevelCount = donationArray.count;
  let arrayResult = await User.findAll({
    attributes: ["username", "product_id", "total_leg", "id"],
    include: [
      {
        model: Tree,
        as: "T2",
        attributes: ["id"],
        where: { descendant: id },
      },
    ],
    prefix,
  });
  for await (let [key, value] of Object.entries(arrayResult)) {
    uplineIdArray[key] = {
      id: value.id,
      user_name: value.username,
      up_level: key + 1,
    };
  }
  return uplineIdArray;
});

const getDonationConfig = (exports.getDonationConfig = async (prefix) => {
  let result = await DonationRates.findAll({ prefix });
  return result;
});

const checkUserLevelStatus = (exports.checkUserLevelStatus = async (
  id,
  level,
  prefix
) => {
  let currentLevel = await getCurrentLevel(id, prefix);
  if (currentLevel >= level) {
    return id;
  }
  return false;
});

exports.insertDonationtransferDetails = async (
  fromUser,
  toUser,
  transactionAmount,
  paymentTYpe,
  level,
  transactionId,
  exactUser = null,
  prefix,
  t
) => {
  try {
    const details = await DonationTransferHistory.create(
      {
        from_user: fromUser,
        to_user: toUser,
        amount: transactionAmount,
        date: new Date(),
        level,
        payment_type: paymentTYpe,
        status: 1,
        transaction_id: transactionId,
        exact_user: exactUser,
      },
      { transaction: t, prefix }
    );
    //TODO Python API Call
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
