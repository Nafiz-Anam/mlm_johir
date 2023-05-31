const { Op, Sequelize, QueryTypes } = require("sequelize");
var _ = require("lodash");
const config = require("../../config/config");
const Prefix = config.DB_PREFIX;
const modStatus = require("../../utils/web/moduleStatus");
const db = require("../../models");
const { mlm_laravel } = require("../../models");
const moment = require("moment");
const Balance = db.userBalance;
const User = db.user;
const Ranks = db.ranks;
const Package = db.pack;
const rankDetails = db.rankDetails;
const legAmount = db.legAmt;
const AmountPaid = db.amountPaid;
const PayoutRequest = db.payoutReleaseRequest;
const UserDetails = db.userDetails;
const UserReg = db.userRegistration;
const rankConfig = db.rankConfig;
const Tree = db.treepath;
const PurchaseRank = db.purchaseRank;
const WalletBalance = db.userWalletBalance;
const UserWalletBalance = db.userWalletBalance;

exports.getGrandTotalEwallet = async (user_id, prefix) => {
  let whereStatement = [];
  if (user_id) {
    let condition1 = {
      user_id: user_id,
    };
    whereStatement.push(condition1);
  }
  // let balance = await Balance.findAll({
  //   attributes: ["balance_amount"],
  //   where: whereStatement,
  //   prefix,
  // });
  const balance = await UserWalletBalance.findAll({
    attributes: ["balance"],
    where: whereStatement,
    prefix,
  });
  console.log("================ewallet==============", balance[0].balance);
  return balance[0].balance ? balance[0].balance : 0;
};

exports.getWalletBalance = async (user_id, prefix) => {
  let walletDetails = await WalletBalance.findOne({
    attributes: ["balance"],
    where: {
      user_id,
    },
    prefix,
  });
  if (!walletDetails) {
    return false;
  } else {
    return walletDetails?.balance
      ? Number(walletDetails?.balance).toFixed(2)
      : 0;
  }
};

exports.getCommissionDetails = async (user_id, fromDate, toDate, prefix) => {
  let whereStatement = [];
  if (user_id) {
    let condition1 = {
      user_id: user_id,
    };
    whereStatement.push(condition1);
  }
  if (fromDate && toDate) {
    let condition2 = {
      date_of_submission: {
        [Op.between]: [fromDate, toDate],
      },
    };
    whereStatement.push(condition2);
  }
  let details = await legAmount.findAll({
    attributes: [
      [Sequelize.fn("SUM", Sequelize.col("amount_payable")), "total"],
    ],
    where: whereStatement,
    raw: true,
    prefix,
  });
  return details[0].total;
};

exports.getPayoutDetails = async (user_id, fromDate, toDate, prefix) => {
  let whereStatement = [];
  if (user_id) {
    let condition1 = {
      user_id: user_id,
    };
    whereStatement.push(condition1);
  }
  if (fromDate && toDate) {
    let condition2 = {
      date: {
        [Op.between]: [fromDate, toDate],
      },
    };
    whereStatement.push(condition2);
  }
  let condition3 = {
    type: "released",
  };
  whereStatement.push(condition3);

  let paidDetails = await AmountPaid.findAll({
    attributes: [[Sequelize.fn("SUM", Sequelize.col("amount")), "total"]],
    where: whereStatement,
    raw: true,
    prefix,
  });

  return paidDetails[0].total;
};

exports.getRequestPendingAmount = async (user_id, prefix) => {
  let payoutPending = await PayoutRequest.findAll({
    attributes: [
      [Sequelize.fn("SUM", Sequelize.col("balance_amount")), "total"],
    ],
    where: {
      user_id: user_id,
      status: 0,
    },
    raw: true,
    prefix,
  });

  return payoutPending[0].total;
};

exports.getLatestJoinees = async (user_id, prefix) => {
  const joinee = await User.findAll({
    attributes: ["id", "username", "active", "date_of_joining"],
    include: [
      {
        model: UserDetails,
        as: "details",
        attributes: ["name", "second_name", "image"],
      },
      {
        model: UserReg,
        attributes: ["product_amount"],
      },
    ],
    where: {
      sponsor_id: user_id,
      active: 1,
      id: {
        [Op.ne]: user_id,
      },
    },
    order: [["date_of_joining", "DESC"]],
    limit: 10,
    prefix,
  });
  return joinee;
};

exports.getCurrentRankData = async (user_id, prefix) => {
  let currentCriteria = [];
  let downPackageCount = [];
  let downlineRankCount = [];

  const moduleStatus = await modStatus.getModuleStatus(prefix);
  const rnkConfig = await rankConfig.findAll({ prefix });
  const rankConfiguration = rnkConfig.reduce(
    (obj, item) => ({
      ...obj,
      [item.slug]: item.status,
    }),
    {}
  );
  if (rankConfiguration["referral-count"]) {
    var query1 = await User.findOne({
      attributes: ["id"],
      include: [
        {
          model: rankDetails,
          as: "rank",
          attributes: ["referral_count"],
          include: [
            {
              model: Ranks,
              as: "details",
              attributes: ["name"],
            },
          ],
        },
      ],
      where: {
        id: user_id,
      },
      prefix,
    });
    var query2 = await User.findAll({
      attributes: [[Sequelize.fn("COUNT", Sequelize.col("user.id")), "count"]],
      where: {
        sponsor_id: user_id,
      },
      raw: true,
      prefix,
    });
    var perc = await getPercentage(
      query2[0]["count"],
      query1?.rank?.referral_count
    );
    var referalCount = {
      rank_name: query1.rank.details.name,
      achieved: query2[0]["count"],
      required: query1.rank.referral_count,
      percentage: perc,
      text: "referralCount",
      title: "Referral Count",
    };
    currentCriteria.push(referalCount);
  }
  if (rankConfiguration["joiner-package"]) {
    // TODO
  }

  if (rankConfiguration["personal-pv"]) {
    var query1 = await User.findOne({
      attributes: ["id", "personal_pv"],
      include: [
        {
          model: rankDetails,
          as: "rank",
          attributes: ["personal_pv"],
          include: [
            {
              model: Ranks,
              as: "details",
              attributes: ["name"],
            },
          ],
        },
      ],
      where: {
        id: user_id,
      },
      prefix,
    });
    var perc = await getPercentage(
      query1?.personal_pv,
      query1?.rank?.personal_pv
    );
    var personalPv = {
      rank_name: query1?.rank?.details.name,
      achieved: query1?.personal_pv,
      required: query1?.rank?.personal_pv,
      percentage: perc,
      text: "personalPv",
      title: "Personal PV",
    };
    currentCriteria.push(personalPv);
  }
  if (rankConfiguration["group-pv"]) {
    var query1 = await User.findOne({
      attributes: ["id", "group_pv"],
      include: [
        {
          model: rankDetails,
          as: "rank",
          attributes: ["group_pv"],
          include: [
            {
              model: Ranks,
              as: "details",
              attributes: ["name"],
            },
          ],
        },
      ],
      where: {
        id: user_id,
      },
      prefix,
    });
    var perc = await getPercentage(query1.group_pv, query1.rank.group_pv);
    let groupPv = {
      rank_name: query1.rank.details.name,
      achieved: query1.group_pv,
      required: query1.rank.group_pv,
      percentage: perc,
      text: "groupPV",
      title: "Group PV",
    };
    currentCriteria.push(groupPv);
  }

  if (
    rankConfiguration["downline-member-count"] &&
    _.includes(["Binary", "Matrix"], moduleStatus.mlm_plan)
  ) {
    var query1 = await User.findOne({
      attributes: ["id"],
      include: [
        {
          model: rankDetails,
          as: "rank",
          attributes: ["downline_count"],
          include: [
            {
              model: Ranks,
              as: "details",
              attributes: ["name"],
            },
          ],
        },
      ],
      where: {
        id: user_id,
      },
      prefix,
    });
    var query2 = await User.findAll({
      attributes: [[Sequelize.fn("COUNT", Sequelize.col("user.id")), "count"]],
      include: [
        {
          model: Tree,
          as: "T1",
          where: {
            ancestor: user_id,
            descendant: {
              [Op.ne]: user_id,
            },
          },
        },
      ],
      group: ["T1.ancestor"],
      raw: true,
      prefix,
    });
    var perc = await getPercentage(query2[0].count, query1.rank.downline_count);
    var downlineCount = {
      rank_name: query1.rank.details.name,
      achieved: query1.rank.downline_count,
      required: query2[0].count,
      percentage: perc,
      text: "downlineMemberCount",
      title: "Downline Member Count",
    };
    currentCriteria.push(downlineCount);
  }

  if (rankConfiguration["downline-package-count"]) {
    var query1 = await User.findOne({
      attributes: ["id"],
      include: [
        {
          model: rankDetails,
          as: "rank",
          attributes: ["rank_id"],
        },
      ],
      where: {
        id: user_id,
      },
      prefix,
    });
    var query2 = await PurchaseRank.findAll({
      attributes: ["count"],
      include: [
        {
          model: Ranks,
          attributes: ["id", "name"],
        },
        {
          model: Package,
          attributes: ["id", "name"],
        },
      ],
      where: {
        rank_id: query1.rank?.rank_id,
      },
      prefix,
    });

    for await (let [key, value] of Object.entries(query2)) {
      let achieved = await getAchivedPackageCount(
        value?.pack["id"],
        user_id,
        prefix
      );
      let percentage = await getPercentage(achieved, value.count);
      downPackageCount[key] = {
        subtile: value.rank.name,
        achieved: achieved,
        required: value.count,
        percentage: percentage,
        text: "downline_package_count",
        title: "Downline Package Count",
      };
    }
    currentCriteria.push(downPackageCount);
  }

  if (rankConfiguration["downline-rank-count"]) {
    var query1 = await User.findOne({
      attributes: ["id"],
      include: [
        {
          model: rankDetails,
          as: "rank",
          attributes: ["downline_count"],
          include: [
            {
              model: Ranks,
              as: "details",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      where: {
        id: user_id,
      },
      prefix,
    });
    var query2 = await mlm_laravel.query(
      `SELECT r.name, d.count as required, count( du.id ) AS achieved FROM ${prefix}ranks AS r RIGHT JOIN ${prefix}rank_downline_rank AS d ON d.downline_rank_id = r.id LEFT JOIN (SELECT f.id, f.user_rank_id FROM ${prefix}users f JOIN ${prefix}treepaths t ON f.id = t.descendant WHERE t.ancestor = :user_id) AS du ON r.id = du.user_rank_id WHERE d.rank_id = :rank_id AND r.status = 1 GROUP BY r.id`,
      {
        replacements: {
          user_id: user_id,
          rank_id: query1.rank.details.id,
        },
        type: QueryTypes.SELECT,
        raw: true,
        prefix,
      }
    );
    for await (let [key, value] of Object.entries(query2)) {
      let percentage = await getPercentage(value?.achieved, value?.required);
      downlineRankCount[key] = {
        subtile: value.name,
        achieved: value.achieved,
        required: value.required,
        percentage: percentage,
        text: "downline_rank",
        title: "Downline Rank Count",
      };
    }
    currentCriteria.push(downlineRankCount);
  }
  return currentCriteria;
};
async function getPercentage(achieved, required) {
  if (!required) {
    return 0;
  }
  let calc = parseInt((achieved / required) * 100);
  let result = calc > 100 ? 100 : calc;
  return result;
}
async function getAchivedPackageCount(package_id, user_id, prefix) {
  // TODO Ecom condition for package
  let achieved = await User.findAll({
    attributes: [[Sequelize.fn("COUNT", Sequelize.col("user.id")), "count"]],
    include: [
      {
        model: Tree,
        as: "T1",
        where: {
          ancestor: user_id,
        },
      },
    ],
    where: {
      product_id: package_id,
    },
    raw: true,
    prefix,
  });
  return achieved[0].count;
}
exports.getNextRankData = async (n_rank, user_id, prefix) => {
  var nextCriteria = [];
  let downPackageCount = [];
  let downlineRankCount = [];

  const moduleStatus = await modStatus.getModuleStatus(prefix);
  const rnkConfig = await rankConfig.findAll({ prefix });
  const rankConfiguration = rnkConfig.reduce(
    (obj, item) => ({
      ...obj,
      [item.slug]: item.status,
    }),
    {}
  );
  if (rankConfiguration["referral-count"]) {
    var query1 = await rankDetails.findOne({
      attributes: ["referral_count"],
      include: [
        {
          model: Ranks,
          as: "details",
          attributes: ["name"],
          where: {
            id: n_rank,
          },
        },
      ],
      prefix,
    });
    var query2 = await User.findAll({
      attributes: [[Sequelize.fn("COUNT", Sequelize.col("user.id")), "count"]],
      where: {
        sponsor_id: user_id,
      },
      raw: true,
      prefix,
    });
    var perc = await getPercentage(query2[0]["count"], query1.referral_count);
    var referalCount = {
      rank_name: query1.details.name,
      achieved: query2[0]["count"],
      required: query1?.referral_count,
      percentage: perc,
      text: "referralCount",
      title: "Referral Count",
    };
    nextCriteria.push(referalCount);
  }
  if (rankConfiguration["joiner-package"]) {
    // TODO
  }

  if (rankConfiguration["personal-pv"]) {
    var query1 = await rankDetails.findOne({
      attributes: ["personal_pv"],
      include: [
        {
          model: Ranks,
          as: "details",
          attributes: ["name"],
          where: {
            id: n_rank,
          },
        },
      ],
      prefix,
    });
    var query2 = await User.findOne({
      attributes: ["personal_pv"],
      where: {
        id: user_id,
      },
      prefix,
    });
    var perc = await getPercentage(query2.personal_pv, query1.personal_pv);
    var personalPv = {
      rank_name: query1.details.name,
      achieved: query2.personal_pv,
      required: query1.personal_pv,
      percentage: perc,
      text: "personalPv",
      title: "Personal PV",
    };
    nextCriteria.push(personalPv);
  }
  if (rankConfiguration["group-pv"]) {
    var query1 = await rankDetails.findOne({
      attributes: ["group_pv"],
      include: [
        {
          model: Ranks,
          as: "details",
          attributes: ["name"],
          where: {
            id: n_rank,
          },
        },
      ],
      prefix,
    });
    var query2 = await User.findOne({
      attributes: ["group_pv"],
      where: {
        id: user_id,
      },
      prefix,
    });
    var perc = await getPercentage(query2.group_pv, query1.group_pv);
    var groupPv = {
      rank_name: query1.details.name,
      achieved: query2.group_pv,
      required: query1.group_pv,
      percentage: perc,
      text: "groupPV",
      title: "Group PV",
    };
    nextCriteria.push(groupPv);
  }

  if (
    rankConfiguration["downline-member-count"] &&
    _.includes(["Binary", "Matrix"], moduleStatus.mlm_plan)
  ) {
    var query1 = await rankDetails.findOne({
      attributes: ["downline_count"],
      include: [
        {
          model: Ranks,
          as: "details",
          attributes: ["name"],
          where: {
            id: n_rank,
          },
        },
      ],
      prefix,
    });
    var query2 = await User.findAll({
      attributes: [[Sequelize.fn("COUNT", Sequelize.col("user.id")), "count"]],
      include: [
        {
          model: Tree,
          as: "T1",
          where: {
            ancestor: user_id,
            descendant: {
              [Op.ne]: user_id,
            },
          },
        },
      ],
      group: ["T1.ancestor"],
      raw: true,
      prefix,
    });
    var perc = await getPercentage(query2[0].count, query1.downline_count);
    var downlineCount = {
      rank_name: query1.details.name,
      achieved: query1.downline_count,
      required: query2[0].count,
      percentage: perc,
      text: "downlineMemberCount",
      title: "Downline Member Count",
    };
    nextCriteria.push(downlineCount);
  }

  if (rankConfiguration["downline-package-count"]) {
    var query2 = await PurchaseRank.findAll({
      attributes: ["count"],
      include: [
        {
          model: Ranks,
          attributes: ["id", "name"],
        },
        {
          model: Package,
          attributes: ["id", "name"],
        },
      ],
      where: {
        rank_id: n_rank,
      },
      prefix,
    });

    for await (let [key, value] of Object.entries(query2)) {
      let achieved = await getAchivedPackageCount(
        value?.pack["id"],
        user_id,
        prefix
      );
      let percentage = await getPercentage(achieved, value.count);
      downPackageCount[key] = {
        rank_name: value.rank.name,
        achieved: achieved,
        required: value.count,
        percentage: percentage,
        text: "downlinePackageCount",
        title: "Downline Package Count",
      };
    }
    nextCriteria.push(downPackageCount);
  }

  if (rankConfiguration["downline-rank-count"]) {
    var query2 = await mlm_laravel.query(
      `SELECT r.name, d.count as required, count( du.id ) AS achieved FROM ${prefix}ranks AS r RIGHT JOIN ${prefix}rank_downline_rank AS d ON d.downline_rank_id = r.id LEFT JOIN (SELECT f.id, f.user_rank_id FROM ${prefix}users f JOIN ${prefix}treepaths t ON f.id = t.descendant WHERE t.ancestor = :user_id) AS du ON r.id = du.user_rank_id WHERE d.rank_id = :rank_id AND r.status = 1 GROUP BY r.id`,
      {
        replacements: {
          user_id: user_id,
          rank_id: n_rank,
        },
        type: QueryTypes.SELECT,
        raw: true,
      }
    );
    for await (let [key, value] of Object.entries(query2)) {
      let percentage = await getPercentage(value?.achieved, value.required);
      downlineRankCount[key] = {
        rank_name: value.name,
        achieved: value.achieved,
        required: value.required,
        percentage: percentage,
        text: "downlineRankCount",
        title: "Downline Rank Count",
      };
    }
    nextCriteria.push(downlineRankCount);
  }
  return nextCriteria;
};

exports.getAllIncomeOrExpense = async (userId, type, prefix) => {
  const incomeAndExpense = await mlm_laravel.query(
    `SELECT t.* FROM (SELECT SUM(amount) AS amount, CASE WHEN amount_type = 'purchase_donation' THEN 'donation' WHEN ewallet_type = 'ewallet_payment' THEN CONCAT(ewallet_type, '_', amount_type) WHEN amount_type = 'user_credit' OR amount_type = 'user_debit' THEN ewallet_type ELSE amount_type END AS amount_type, user_id FROM ${prefix}ewallet_histories WHERE user_id = :user_id AND type = :type GROUP BY amount_type ORDER BY amount DESC LIMIT 4) t LEFT JOIN ${prefix}users f ON (t.user_id = f.id)`,
    {
      replacements: {
        user_id: userId,
        type: type,
      },
      type: QueryTypes.SELECT,
      raw: true,
      prefix,
    }
  );
  return incomeAndExpense;
};

exports.currentRankName = async (user_id, prefix) => {
  var crank = await User.findOne({
    attributes: ["id"],
    include: [
      {
        model: rankDetails,
        as: "rank",
        attributes: ["downline_count"],
        include: [
          {
            model: Ranks,
            as: "details",
            attributes: ["id", "name", "color"],
          },
        ],
      },
    ],
    where: {
      id: user_id,
    },
    prefix,
  });
  return crank?.rank?.details ? crank?.rank?.details : "";
};
exports.getNextRankName = async (rank_id, prefix) => {
  var nrank = await rankDetails.findOne({
    attributes: ["id"],
    include: [
      {
        model: Ranks,
        as: "details",
        attributes: ["id", "name", "color"],
        where: {
          id: {
            [Op.gt]: rank_id,
          },
          status: 1,
        },
        order: ["id"],
      },
    ],
    prefix,
  });
  if (nrank == null) {
    return false;
  }
  return nrank?.details;
};

exports.getUserTotalPayouts = async (user_id, paidStatus, prefix) => {
  let whereStatement = [];
  switch (paidStatus) {
    case "approved":
      let condition1 = {
        type: "released",
        status: 0,
      };
      whereStatement.push(condition1);
      break;
    case "paid":
      let condition2 = {
        type: "released",
        status: 1,
      };
      whereStatement.push(condition2);
      break;
    case "rejected":
      let condition3 = {
        type: "rejected",
      };
      whereStatement.push(condition3);
      break;
  }
  let condition4 = {
    user_id: user_id,
  };
  whereStatement.push(condition4);

  let paidDetails = await AmountPaid.findAll({
    attributes: [[Sequelize.fn("SUM", Sequelize.col("amount")), "total"]],
    where: whereStatement,
    raw: true,
    prefix,
  });

  return paidDetails[0].total;
};

exports.getTopEarners = async (user_id, prefix) => {
  let selectQuery = [];
  let joinQuery = [];

  selectQuery = `SELECT sum(leg.amount_payable) as balance_amount, ft.username as user_name, ft.id, u.name , u.second_name, u.image as profile_picture `;
  joinQuery = `FROM ${prefix}users as ft `;
  if (user_id) {
    joinQuery += `JOIN ${prefix}sponsor_treepaths as str ON str.descendant = ft.id `;
  }
  joinQuery += `JOIN ${prefix}leg_amounts as leg ON leg.user_id = ft.id JOIN ${prefix}user_details as u ON u.user_id = ft.id WHERE ft.sponsor_id != 0 AND leg.amount_payable != 0 `;
  if (user_id) {
    joinQuery += `AND str.ancestor = :user_id AND str.descendant != :user_id `;
  }
  joinQuery += `GROUP BY ft.id ORDER BY balance_amount DESC LIMIT 5;`;

  let result = await mlm_laravel.query(selectQuery + joinQuery, {
    replacements: {
      user_id: user_id,
    },
    type: QueryTypes.SELECT,
    raw: true,
    prefix,
  });

  return result;
};

exports.getTopRecruters = async (user_id, prefix) => {
  let selectQuery = [];
  let joinQuery = [];
  selectQuery = `SELECT count(f2.sponsor_id) as count, f1.username as user_name, f1.id, u.name, u.second_name, u.image as profile_picture `;
  joinQuery = `FROM  ${prefix}sponsor_treepaths as t INNER JOIN ${prefix}users as f1 ON f1.id = t.descendant INNER JOIN ${prefix}users as f2 ON f2.sponsor_id = t.descendant INNER JOIN ${prefix}user_details as u ON u.user_id = f1.id WHERE t.ancestor = :user_id AND t.descendant != :user_id GROUP BY f2.sponsor_id ORDER BY count DESC LIMIT 7`;
  let result = await mlm_laravel.query(selectQuery + joinQuery, {
    replacements: {
      user_id: user_id,
    },
    type: QueryTypes.SELECT,
    raw: true,
    prefix,
  });

  return result;
};

exports.getRankData = async (user_id, prefix) => {
  let rankArr = [];
  const rank = await User.findAll({
    attributes: [
      "*",
      [Sequelize.fn("COUNT", Sequelize.col("user.id")), "count"],
    ],
    include: [
      {
        model: rankDetails,
        as: "rank",
        attributes: ["id"],
        include: [
          {
            model: Ranks,
            as: "details",
            attributes: ["name"],
          },
        ],
      },
    ],
    where: {
      sponsor_id: user_id,
    },
    group: ["user_rank_id"],
    raw: true,
    prefix,
  });
  rank.map((value, key) => {
    rankArr[key] = {
      rank_name: value["rank.details.name"] ? value["rank.details.name"] : "NA",
      count: value.count,
    };
  });
  return rankArr;
};

exports.getPackageProgressData = async (user_id, prefix) => {
  let resultArr = [];
  let whereStatement = [];
  if (user_id) {
    let condition1 = {
      sponsor_id: user_id,
    };
    whereStatement.push(condition1);
  }
  let condition2 = {
    product_id: {
      [Op.ne]: "",
    },
  };
  whereStatement.push(condition2);
  const result = await User.findAll({
    attributes: [[Sequelize.fn("COUNT", Sequelize.col("user.id")), "count"]],
    include: [
      {
        model: Package,
        as: "package",
        attributes: ["name"],
      },
    ],
    raw: true,
    where: whereStatement,
    group: ["user.product_id"],
    limit: 5,
    prefix,
  });
  result.map((value, key) => {
    resultArr[key] = {
      package_name: value["package.name"],
      joining_count: value.count,
    };
  });
  return resultArr;
};

exports.getJoiningLineChartData = async (
  userId,
  chartMode,
  moduleStatus,
  prefix
) => {
  let labels = [];
  var joineeArr = [];
  let labelsMonth = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let date = new Date();
  if (chartMode == "month" && date.getMonth() != 12) {
    joineeArr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let curMonthIndex = date.getMonth();
    for (let i = 0; i <= curMonthIndex; i++) {
      Arr = `${labelsMonth[i]} ${date.getFullYear()}`;
      labels.push(Arr);
    }
    for (let i = curMonthIndex + 1; i < labelsMonth.length; i++) {
      Arr = `${labelsMonth[i]} ${date.getFullYear() - 1}`;
      labels.push(Arr);
    }
    let nextMonthFirstDay = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      1
    );
    var fromDate = new Date(
      nextMonthFirstDay.getFullYear() - 1,
      nextMonthFirstDay.getMonth(),
      1
    );
  }
  if (chartMode == "year") {
    let curYear = date.getFullYear();
    for (let i = curYear - 4; i < curYear; i++) {
      labels.push(i);
      joineeArr.push(0);
    }
    labels.push(curYear);
    joineeArr.push(0);
    var fromDate = new Date(date.getFullYear() - 5, 0, 1);
  }
  if (chartMode == "day") {
    var fromDate = moment(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).format("YYYY/MM/DD");
    let dt = date.getDate() - 7;
    let dtEnd = date.getDate();
    for (let i = dt; i <= dtEnd; i++) {
      Arr = moment(new Date(date.getFullYear(), date.getMonth(), i)).format(
        "MMM DD"
      );
      labels.push(Arr);
      joineeArr.push(0);
    }
  }
  if (moduleStatus.mlm_plan == "Binary") {
    let selectQuery = [];
    let joinQuery = [];
    let leftUserId = await getLeftNodeId(userId, prefix);
    let rightUserId = await getRightNodeId(userId, prefix);
    selectQuery = `SELECT COUNT(f.id) as joining_count`;
    if (chartMode == "month") {
      // if (date.getMonth() == 12) {
      selectQuery += ` ,(MONTH(date_of_joining) - 1) as labelid`;
      // } else {
      //   selectQuery += ` ,(12 - (MONTH(date_of_joining) - 1)) as labelid`;
      // }
    }
    if (chartMode == "year") {
      selectQuery += ` ,(YEAR(date_of_joining) - ${labels[0]}) as labelid`;
    }
    if (chartMode == "day") {
      selectQuery += ` ,(7 - DATEDIFF('${moment(Date()).format(
        "YYYY/MM/DD"
      )}', DATE_FORMAT(f.date_of_joining, '%Y/%m/%d'))) as labelid`;
    }
    var count = labels.length;
    if (leftUserId) {
      joinQuery = ` FROM ${prefix}users f LEFT JOIN ${prefix}treepaths t ON t.descendant = f.id WHERE t.ancestor = :userId AND f.date_of_joining >= :fromDate GROUP BY labelid;`;
      var leftJoining = await mlm_laravel.query(selectQuery + joinQuery, {
        replacements: {
          userId: leftUserId,
          fromDate: fromDate,
        },
        type: QueryTypes.SELECT,
        raw: true,
        prefix,
      });
      var leftArr = [];
      for (let i = 0; i < count; i++) {
        const value = leftJoining.find((element) => {
          if (element.labelid == i) {
            return true;
          }
          return false;
        });
        if (value) {
          leftArr[i] = value.joining_count;
        } else {
          leftArr[i] = 0;
        }
      }
    }
    if (rightUserId) {
      joinQuery = ` FROM ${prefix}users f LEFT JOIN ${prefix}treepaths t ON t.descendant = f.id WHERE t.ancestor = :userId AND f.date_of_joining >= :fromDate GROUP BY labelid;`;
      var rightJoining = await mlm_laravel.query(selectQuery + joinQuery, {
        replacements: {
          userId: rightUserId,
          fromDate: fromDate,
        },
        type: QueryTypes.SELECT,
        raw: true,
        prefix,
      });
      var rightArr = [];
      for (let i = 0; i < count; i++) {
        const value = rightJoining.find((element) => {
          if (element.labelid == i) {
            return true;
          }
          return false;
        });
        if (value) {
          rightArr[i] = value.joining_count;
        } else {
          rightArr[i] = 0;
        }
      }
    }
    var data = {
      labels: labels,
      leftArr: leftArr ? leftArr : joineeArr,
      rightArr: rightArr ? rightArr : joineeArr,
    };
    return data;
  }
  let selectQuery = [];
  let joinQuery = [];
  var count = labels.length;
  selectQuery = `SELECT COUNT(f.id) as joining_count`;
  if (chartMode == "month") {
    // if (date.getMonth() == 12) {
    selectQuery += ` ,(MONTH(date_of_joining) - 1) as labelid`;
    // } else {
    //   selectQuery += ` ,(12 - (MONTH(date_of_joining) - 1)) as labelid`;
    // }
  }
  if (chartMode == "year") {
    selectQuery += ` ,(YEAR(date_of_joining) - ${labels[0]}) as labelid`;
  }
  if (chartMode == "day") {
    selectQuery += ` ,(7 - DATEDIFF('${moment(Date()).format(
      "YYYY/MM/DD"
    )}', DATE_FORMAT(f.date_of_joining, '%Y/%m/%d'))) as labelid`;
  }
  joinQuery = ` FROM ${prefix}users f LEFT JOIN ${prefix}treepaths t ON t.descendant = f.id WHERE t.ancestor = :userId AND f.date_of_joining >= :fromDate GROUP BY labelid;`;
  var joining = await mlm_laravel.query(selectQuery + joinQuery, {
    replacements: {
      userId: userId,
      fromDate: fromDate,
    },
    type: QueryTypes.SELECT,
    raw: true,
    prefix,
  });
  var joiningArr = [];
  for (let i = 0; i < count; i++) {
    const value = joining.find((element) => {
      if (element.labelid == i) {
        return true;
      }
      return false;
    });
    if (value) {
      joiningArr[i] = value.joining_count;
    } else {
      joiningArr[i] = 0;
    }
  }
  var data = {
    labels: labels,
    joinArray: joiningArr.length > 1 ? joiningArr : joineeArr,
  };
  return data;
};

async function getLeftNodeId(fatherId, prefix) {
  let result = await User.findOne({
    attributes: ["id"],
    where: { father_id: fatherId, leg_position: 1 },
    prefix,
  });
  return result?.id;
}

async function getRightNodeId(fatherId, prefix) {
  let result = await User.findOne({
    attributes: ["id"],
    where: { father_id: fatherId, leg_position: 2 },
    prefix,
  });
  return result?.id;
}
