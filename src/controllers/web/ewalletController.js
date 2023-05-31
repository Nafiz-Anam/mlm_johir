const db = require("../../models");
const { Op, Sequelize, QueryTypes } = require("sequelize");
const { mlm_laravel } = require("../../models");
const bcrypt = require("bcryptjs");
var _ = require("lodash");
const modStatus = require("../../utils/web/moduleStatus");
const moment = require("moment");
const dc = require("../../utils/web/constants");
const common = require("../../utils/web/common");
const { successMessage, errorMessage } = require("../../utils/web/response");
const Str = require("@supercharge/strings");
// const { default: userBalance } = require("../../models/rest/userBalance");
const ewalletHistory = db.ewalletHistory;
const User = db.user;
const usrBalance = db.userBalance;
const Config = db.configuration;
const TransPass = db.transPassword;
const PayoutConfig = db.payoutConfig;
// const pendingReg = db.pendingRegistration
const paymentConfig = db.paymentConfig;
const purchaseWalletHsty = db.purchaseWalletHistory;
const compensation = db.compensation;
const performance = db.performanceBonus;
const legAmount = db.legAmt;
const UserDetails = db.userDetails;
const fundTransfer = db.fundTransferDetails;
const Transactions = db.transactions;
const WalletHistories = db.walletHistories;
const UserWalletBalance = db.userWalletBalance;
const PendingTransaction = db.pendingTransaction;
// exports.getEwalletStatementTable = async (req, res) => {
//   const prefix = req.headers["api-key"];
//   if (!prefix) {
//     let response = await errorMessage({ code: 1001 });
//     return res.json(response);
//   }
//   if (req?.query?.username) {
//     req.user.id = await common.usernameToId(req.query.username, prefix);
//   }
//   const { id } = req.user;
//   const originUserId = await common.usernameToId(req.user.username, prefix);

//   const loggedUsername = await common.idToUsername(id, prefix);
//   var table_data = [];
//   const { start, length } = req.query;
//   try {
//     const statement = await ewalletHistory.findAll({
//       attributes: [
//         "user_id",
//         "from_id",
//         "ewallet_type",
//         "amount",
//         "amount_type",
//         "balance",
//         "from_balance",
//         "type",
//         "date_added",
//         "transaction_id",
//         "transaction_note",
//         "transaction_fee",
//         "purchase_wallet",
//         "createdAt",
//       ],
//       where: {
//         [Op.or]: {
//           user_id: id,
//           [Op.and]: {
//             from_id: id,
//             ewallet_type: "fund_transfer",
//           },
//         },
//       },
//       offset: parseInt(start) ? parseInt(start) : 0,
//       limit: parseInt(length) ? parseInt(length) : 10,
//       include: [
//         {
//           model: User,
//           attributes: ["username"],
//           as: "userWallet",
//         },
//         {
//           model: User,
//           attributes: ["username"],
//           as: "fundUser",
//         },
//       ],
//       order: [["id", "ASC"]],
//       prefix,
//     });
//     const moduleStatus = await modStatus.getModuleStatus(prefix);
//     var count = await ewalletHistory.count({
//       where: {
//         [Op.or]: {
//           user_id: id,
//           [Op.and]: {
//             from_id: id,
//             ewallet_type: "fund_transfer",
//           },
//         },
//       },
//       prefix,
//     });
//     if (!statement) {
//       return res.status(400).send({
//         message: "statement not found",
//       });
//     }
//     let payoutFee = await PayoutConfig.findOne({
//       attributes: ["fee_amount"],
//       prefix,
//     });
//     let userCurrency = await common.getUserCurrencySymbol(id, prefix);
//     Object.entries(statement).map(([key, value]) => {
//       var balance;
//       if (loggedUsername == value.fundUser?.username) {
//         balance = value.balance;
//       } else if (loggedUsername == value.userWallet?.username) {
//         balance = value.from_balance;
//       }
//       var description;
//       var description1;
//       if (value.pendingRegistration == null) {
//         var fromUser = value?.userWallet?.username
//           ? value?.userWallet?.username
//           : "";
//       }
//       var arrayCommission = [
//         "referral",
//         "level_commission",
//         "repurchase_level_commission",
//         "upgrade_level_commission",
//         "xup_commission",
//         "xup_repurchase_level_commission",
//         "xup_upgrade_level_commission",
//         "sales_commission",
//       ];

//       if (value.ewallet_type == "fund_transfer") {
//         if (value.amount_type == "admin_credit") {
//           description1 = {
//             langCode: "credited_by",
//             user: fromUser ? fromUser : "Admin",
//           };
//           // description = `Credited by ${fromUser}`;
//         } else if (value.amount_type == "self_transfer_to_beb") {
//           description1 = {
//             langCode: "fund_transfer_to_beb",
//           };
//         } else if (value.amount_type == "self_transfer") {
//           description1 = {
//             langCode: "fund_transfer_from_beb",
//           };
//         } else if (value.amount_type == "admin_debit") {
//           // description = `Deducted by ${fromUser}`;
//           description1 = {
//             langCode: "deducted_by",
//             user: fromUser ? fromUser : "Admin",
//           };
//         } else if (loggedUsername == value.fundUser.username) {
//           description1 = {
//             langCode: "fund_transfer_from",
//             user: value.userWallet?.username
//               ? value.userWallet?.username
//               : "Admin",
//           };
//           value.type = "credit";
//           // description = `Transfer from ${fromUser}`;
//         } else if (loggedUsername == value.userWallet.username) {
//           // description = `Fund transfer to ${fromUser}`;
//           description1 = {
//             langCode: "fund_transfer_to",
//             user: value.fundUser.username,
//             fee: value.transaction_fee,
//             fee_type: "fundtransfer",
//             currency: userCurrency,
//           };
//           value.type = "debit";
//         }
//       } else if (value.ewallet_type == "commission") {
//         if (value.amount_type == "donation") {
//           if (value.type == "debit") {
//             description1 = {
//               langCode: "donation_debit",
//               user: fromUser,
//             };
//             // description = `Donation debit ${fromUser}`;
//           } else {
//             description1 = {
//               langCode: "donation_credit",
//               user: fromUser,
//             };
//             // description = `Donation credit ${fromUser}`;
//           }
//         } else if (
//           value.amount_type == "board_commission" &&
//           moduleStatus.table_status == "yes"
//         ) {
//           description1 = {
//             langCode: "table_commision",
//             user: "",
//           };
//           // description = `Table commission`;
//         } else {
//           if (_.includes(arrayCommission, value.amount_type)) {
//             let slugdescription = value.amount_type.replace(/-/g, "_");
//             description1 = {
//               langCode: slugdescription + "_from",
//               user: fromUser,
//             };
//             // description = `${slugdescription} from ${fromUser}`;
//           } else {
//             let slugdescription = value.amount_type.replace(/-/g, "_");
//             description1 = {
//               langCode: slugdescription,
//               user: "",
//             };
//             // description = `${slugdescription}`;
//           }
//         }
//       } else if (value.ewallet_type == "ewallet_payment") {
//         if (value.amount_type == "registration") {
//           description1 = {
//             langCode: "deducted_for_registration_of",
//             user: fromUser,
//           };
//           // description = `Deducted for registration of ${fromUser}`;
//         } else if (value.amount_type == "repurchase") {
//           description1 = {
//             langCode: "deducted_for_repurchase_by",
//             user: fromUser,
//           };
//           description = `Deducted for repurchase by ${fromUser}`;
//         } else if (value.amount_type == "package_validity") {
//           description1 = {
//             langCode: "deducted_for_membership_renewal_of",
//             user: fromUser,
//           };
//           // description = `Deducted for membership renewal of ${fromUser}`;
//         } else if (value.amount_type == "upgrade") {
//           // description = `Deducted for upgrade of ${fromUser}`;
//           description1 = {
//             langCode: "deducted_for_upgrade_of",
//             user: fromUser,
//           };
//         }
//       } else if (value.ewallet_type == "payout") {
//         if (value.amount_type == "payout_request") {
//           // description = `Deducted for payout request`;
//           description1 = {
//             langCode: "deducted_for_payout_request",
//             user: "",
//           };
//         } else if (value.amount_type == "payout_inactive") {
//           description1 = {
//             langCode: "payout_inactive",
//             user: "",
//           };
//           // description = `Payout inactive`;
//         } else if (value.amount_type == "payout_release") {
//           description1 = {
//             langCode: "payout_release_for_request",
//             user: "",
//             currency: userCurrency,
//             fee: payoutFee.fee_amount,
//             fee_type: "payout",
//           };
//           // description = `Payout released for request`;
//         } else if (value.amount_type == "payout_delete") {
//           description1 = {
//             langCode: "credited_for_payout_request_delete",
//             user: "",
//           };
//           // description = `Credited for payout request delete`;
//         } else if (value.amount_type == "payout_release_manual") {
//           description1 = {
//             langCode: "payout_released_by_manual",
//             user: "",
//           };
//           // description = `Payout released by manual`;
//         } else if (value.amount_type == "withdrawal_cancel") {
//           description1 = {
//             langCode: "credited_for_waiting_withdrawal_cancel",
//             user: "",
//           };
//           // description = `Credited for waiting withdrawal cancel`;
//         }
//       } else if (value.ewallet_type == "pin_purchase") {
//         if (value.amount_type == "pin_purchase") {
//           description1 = {
//             langCode: "deducted_for_pin_purchase",
//             user: "",
//           };
//           description = `Deducted for pin purchase`;
//         } else if (value.amount_type == "pin_purchase_refund") {
//           description1 = {
//             langCode: "credited_for_pin_purchase_refund",
//             user: "",
//           };
//           // description = `Credited for pin purchase refund`;
//         } else if (value.amount_type == "pin_purchase_delete") {
//           description1 = {
//             langCode: "credited_for_pin_purchase_delete",
//             user: "",
//           };
//           // description = `Credited for pin purchase delete`;
//         }
//       } else if (value.ewallet_type == "package_purchase") {
//         if (value.amount_type == "purchase_donation") {
//           description1 = {
//             langCode: "purchase_donation_from",
//             user: fromUser,
//           };
//           // description = `Purchase donation from ${fromUser}`;
//         }
//       }
//       table_data[key] = {
//         index: parseInt(key) + 1,
//         description1: description1,
//         description: description,
//         amount:
//           value.type == "credit"
//             ? Number(value.amount)
//             : Number(value.amount) + Number(value.transaction_fee),
//         type: value.type,
//         transaction_date: new Date(value.createdAt).toLocaleDateString(),
//         balance: balance,
//       };
//     });
//     var subUserNames = [];
//     var parAccountStatus = !(await common.isSubAccount(originUserId, prefix));
//     var subAccountCount = await common.getSubAccountCount(originUserId, prefix);
//     parAccountStatus = parAccountStatus && subAccountCount > 0 ? true : false;
//     if (parAccountStatus) {
//       let isSubaccount = await common.isSubAccount(id, prefix);
//       var subaccounts;

//       if (!isSubaccount) {
//         subaccounts = await common.getSubAccountUsernames(id, prefix);
//       } else {
//         let parentId = await common.getParentId(id, prefix);
//         subaccounts = await common.getSubAccountUsernames(parentId, prefix);
//       }

//       Object.entries(subaccounts).map(([key, value]) => {
//         subUserNames[key] = {
//           value: value.username,
//         };
//       });
//     }
//     let data = {
//       count: count,
//       table_data: table_data,
//       subAccounts: subUserNames,
//       parAccountStatus,
//     };
//     let response = await successMessage({ value: data });
//     return res.json(response);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json([
//       {
//         status: false,
//       },
//       {
//         message: `Error:${error.message}`,
//       },
//     ]);
//   }
// };

exports.getEwalletStatementTable = async (req, res) => {
  const prefix = req.headers["api-key"];
  if (!prefix) {
    let response = await errorMessage({ code: 1001 });
    return res.json(response);
  }
  if (req?.query?.username) {
    req.user.id = await common.usernameToId(req.query.username, prefix);
  }
  const { id } = req.user;
  const originUserId = await common.usernameToId(req.user.username, prefix);

  const loggedUsername = await common.idToUsername(id, prefix);
  var table_data = [];
  const { start, length } = req.query;
  try {
    const statement = await WalletHistories.findAll({
      attributes: [
        "user_id",
        "from_id",
        "amount",
        "amount_type",
        "balance",
        "type",
        "date_added",
        "wallet_address",
        "transaction_fee",
        "created_at",
      ],
      where: {
        user_id: id,
      },
      offset: parseInt(start) ? parseInt(start) : 0,
      limit: parseInt(length) ? parseInt(length) : 10,
      include: [
        {
          model: User,
          attributes: ["username"],
          as: "userCoinWallet", //from_id
        },
        {
          model: User,
          attributes: ["username"],
          as: "fundCoinUser", //user_id
        },
      ],
      order: [["id", "ASC"]],
      prefix,
    });
    const moduleStatus = await modStatus.getModuleStatus(prefix);
    var count = await WalletHistories.count({
      where: {
        user_id: id,
      },
      prefix,
    });
    if (!statement) {
      return res.status(400).send({
        message: "statement not found",
      });
    }
    let payoutFee = await PayoutConfig.findOne({
      attributes: ["fee_amount"],
      prefix,
    });
    let userCurrency = await common.getUserCurrencySymbol(id, prefix);
    Object.entries(statement).map(([key, value]) => {
      var balance;
      var description;
      var description1;

      if (value.amount_type == "admin_credit") {
        description1 = {
          langCode: "credited_by",
          // user: fromUser ? fromUser : "Admin",
        };
        // description = `Credited by ${fromUser}`;
      } else if (value.amount_type == "self_transfer_to_beb") {
        description1 = {
          langCode: "fund_transfer_to_beb",
        };
      } else if (value.amount_type == "self_transfer") {
        description1 = {
          langCode: "fund_transfer_from_beb",
        };
      } else if (value.amount_type == "admin_debit") {
        description1 = {
          langCode: "deducted_by",
        };
      } else if (value.amount_type == "transfer") {
        description1 = {
          langCode: "recieved_fund",
        };
      } else if (value.amount_type == "register") {
        description1 = {
          langCode: "deducted_for_register",
        };
      } else if (value.amount_type == "payout_request") {
        description1 = {
          langCode: "payout_release_for_request",
          user: "",
          currency: userCurrency,
          fee: payoutFee.fee_amount,
          fee_type: "payout",
        };
      } else if (value.amount_type == "self_transfer_from_parent") {
        if (value.type == "credit") {
          description1 = {
            langCode: "self_transfer_from_parent",
            user: value?.userCoinWallet?.username
              ? value?.userCoinWallet?.username
              : "admin",
          };
        } else if (value.type == "debit") {
          description1 = {
            langCode: "self_transfer_to_parent",
            user: value?.userCoinWallet?.username
              ? value?.userCoinWallet?.username
              : "admin",
          };
        }
      } else if (value.amount_type == "user_usdt_transfer") {
        if (value.type == "credit") {
          description1 = {
            langCode: "fund_transfer_from",
            user: value?.userCoinWallet?.username
              ? value?.userCoinWallet?.username
              : "admin",
          };
        } else if (value.type == "debit") {
          description1 = {
            langCode: "fund_transfer_to",
            user: value?.userCoinWallet?.username
              ? value?.userCoinWallet?.username
              : "admin",
            currency: userCurrency,
            fee: value.transaction_fee,
            fee_type: "fundtransfer",
          };
        }
      } else {
        description1 = {
          langCode: value.amount_type,
        };
      }

      table_data[key] = {
        index: parseInt(key) + 1,
        description1: description1,
        description: description,
        amount:
          value.type == "credit"
            ? Number(value.amount)
            : Number(value.amount) + Number(value.transaction_fee),
        type: value.type,
        transaction_date: new Date(value.date_added).toLocaleDateString(),
        balance: value.balance,
      };
      // console.log("=========Date==========", value);
    });
    var subUserNames = [];
    var parAccountStatus = !(await common.isSubAccount(originUserId, prefix));
    var subAccountCount = await common.getSubAccountCount(originUserId, prefix);
    parAccountStatus = parAccountStatus && subAccountCount > 0 ? true : false;
    if (parAccountStatus) {
      let isSubaccount = await common.isSubAccount(id, prefix);
      var subaccounts;

      if (!isSubaccount) {
        subaccounts = await common.getSubAccountUsernames(id, prefix);
      } else {
        let parentId = await common.getParentId(id, prefix);
        subaccounts = await common.getSubAccountUsernames(parentId, prefix);
      }

      Object.entries(subaccounts).map(([key, value]) => {
        subUserNames[key] = {
          value: value.username,
        };
      });
    }
    let data = {
      count: count,
      table_data: table_data,
      subAccounts: subUserNames,
      parAccountStatus,
    };
    let response = await successMessage({ value: data });
    return res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json([
      {
        status: false,
      },
      {
        message: `Error:${error.message}`,
      },
    ]);
  }
};

exports.getEwalletHistoryTable = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    if (req?.query?.username) {
      req.user.id = await common.usernameToId(req.query.username, prefix);
    }
    const originUserId = await common.usernameToId(req.user.username, prefix);
    const userId = req.user.id;
    let [tableData, whereStatement] = [[], []];
    let { start, length, order, direction, start_date, end_date, type } =
      req.query;

    let filters = {
      order: order ? order : "updated_at",
      limit: length ? parseInt(length) : 10,
      start: start ? parseInt(start) : 0,
      direction: _.includes(["ASC", "DESC"]) ? direction : "ASC",
    };
    type = type ? type : "";
    const loggedUsername = await common.idToUsername(userId, prefix);

    if (userId) {
      if (type == "user_credit") {
        let condition1 = {
          [Op.or]: {
            to_id: userId,
          },
        };
        whereStatement.push(condition1);
      } else if (type == "user_debit") {
        let condition1 = {
          [Op.or]: {
            from_id: userId,
          },
        };
        whereStatement.push(condition1);
      } else {
        let condition1 = {
          [Op.or]: {
            to_id: userId,
            from_id: userId,
          },
        };
        whereStatement.push(condition1);
      }
    }
    if (start_date) {
      let condition2 = {
        created_at: {
          [Op.gte]: start_date,
        },
      };
      whereStatement.push(condition2);
    }
    if (end_date) {
      let condition3 = {
        created_at: {
          [Op.lte]: new Date(end_date).setDate(
            new Date(end_date).getDate() + 1
          ),
        },
      };
      whereStatement.push(condition3);
    }
    const fundTransferDetails = await fundTransfer.findAll({
      attributes: [
        "id",
        "from_id",
        "to_id",
        "amount",
        "amount_type",
        "trans_fee",
        "transaction_id",
        "notes",
        "created_at",
      ],
      include: [
        {
          model: User,
          as: "fromUser",
          attributes: ["username"],
        },
        {
          model: User,
          as: "toUser",
          attributes: ["username"],
        },
      ],
      where: whereStatement,
      order: [[filters.order, filters.direction]],
      offset: filters.start,
      limit: filters.limit,
      prefix,
    });
    const totalFundTransferDetails = await fundTransfer.findAll({
      attributes: [
        "id",
        "from_id",
        "to_id",
        "amount",
        "amount_type",
        "trans_fee",
        "transaction_id",
        "notes",
        "created_at",
      ],
      include: [
        {
          model: User,
          as: "fromUser",
          attributes: ["username"],
        },
        {
          model: User,
          as: "toUser",
          attributes: ["username"],
        },
      ],
      where: whereStatement,
      order: [[filters.order, filters.direction]],
      prefix,
    });

    const count = totalFundTransferDetails.length;
    Object.entries(fundTransferDetails).map(([key, value]) => {
      var description;
      var langDesc;
      if (loggedUsername == value.fromUser.username) {
        console.log("inside if condition");
        langDesc = {
          langCode: "fund_transfer_to",
          user: value.toUser.username,
        };
        description = `Fund transfer to ${value.toUser.username}`;
        value.amount_type = "user_debit";
      } else if (loggedUsername == value.toUser.username) {
        console.log("inside else condition");
        langDesc = {
          langCode: "fund_transfer_from",
          user: value.fromUser.username,
        };
        description = `Transfer from ${value.fromUser.username}`;
        value.amount_type = "user_credit";
      }
      tableData[key] = {
        description: description,
        description1: langDesc,
        transaction_id: value.transaction_id,
        amount: value.amount,
        transaction_fee: value.trans_fee,
        transfer_type: value.amount_type == "user_debit" ? "debit" : "credit",
        type: value.amount_type == "user_debit" ? "debit" : "credit",
        date: moment(value.created_at).format("MM/DD/YYYY"),
      };
    });

    var subUserNames = [];

    var parAccountStatus = await common.isSubAccount(originUserId, prefix);
    parAccountStatus = !parAccountStatus;
    var subAccountCount = await common.getSubAccountCount(originUserId, prefix);
    parAccountStatus = parAccountStatus && subAccountCount > 0 ? true : false;
    if (parAccountStatus) {
      let isSubaccount = await common.isSubAccount(userId, prefix);
      var subaccounts;
      if (!isSubaccount) {
        subaccounts = await common.getSubAccountUsernames(userId, prefix);
      } else {
        let parentId = await common.getParentId(userId, prefix);
        subaccounts = await common.getSubAccountUsernames(parentId, prefix);
      }

      Object.entries(subaccounts).map(([key, value]) => {
        subUserNames[key] = {
          value: value.username,
        };
      });
    }
    let data = {
      count: count,
      table_data: tableData,
      subAccounts: subUserNames,
      parAccountStatus,
    };
    let response = await successMessage({
      value: data,
    });
    res.json(response);
  } catch (err) {
    console.log(err);
    res.json(err.message);
  }
};

exports.getPurchaseWalletTable = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    if (req?.query?.username) {
      req.user.id = await common.usernameToId(req.query.username, prefix);
    }
    const originUserId = await common.usernameToId(req.user.username, prefix);

    const user_id = req.user.id;
    let description;
    let table_data = [];
    var { length, start, order, direction } = req.query;
    let filters = {
      order: order,
      limit: parseInt(length) ? parseInt(length) : 10,
      start: parseInt(start) ? parseInt(start) : 0,
      direction: direction,
    };
    const moduleStatus = await modStatus.getModuleStatus(prefix);
    const ewalletDetails = await purchaseWalletHsty.findAll({
      include: [
        {
          model: User,
          attributes: ["username"],
        },
      ],
      where: {
        user_id,
      },
      offset: filters.start,
      limit: filters.limit,
      prefix,
    });
    if (parseInt(start)) {
      var previousBalance = await mlm_laravel.query(
        `SELECT SUM(IF(f.type = 'credit', f.purchase_wallet, 0)) as credit, SUM(IF(f.type = 'debit' AND f.amount_type != 'payout_release', f.purchase_wallet, 0)) as debit FROM (SELECT * FROM ${prefix}purchase_wallet_histories as e WHERE e.user_id = :userId ORDER BY e.id LIMIT :limit) as f`,
        {
          replacements: {
            userId: user_id,
            limit: parseInt(start),
          },
          type: QueryTypes.SELECT,
          raw: true,
          prefix,
        }
      );
      var balance = previousBalance[0].credit - previousBalance[0].debit;
    } else {
      var balance = 0;
    }
    let count = await purchaseWalletHsty.count({
      include: [
        {
          model: User,
          attributes: [["username", "from_user"]],
        },
      ],
      where: {
        user_id,
      },
      prefix,
    });
    var arrayCommission = [
      "referal",
      "level_commission",
      "repurchase_level_commission",
      "upgrade_level_commission",
      "xup_commission",
      "xup_repurchase_level_commission",
      "xup_upgrade_level_commission",
      "matching_bonus",
      "matching_bonus_purchase",
      "matching_bonus_upgrade",
      "sales_commission",
    ];
    var lanDesc;
    const bebLiveValue = await common.getLiveBebValue(prefix);
    balance = balance * bebLiveValue;

    Object.entries(ewalletDetails).map(([key, value]) => {
      let bebValueOfAmount = value.amount / bebLiveValue;
      if (value.type == "debit") {
        balance = balance - parseFloat(bebValueOfAmount);
      } else if (value.type == "credit") {
        balance = balance + parseFloat(bebValueOfAmount);
      }
      if (value.amount_type == "donation") {
        if (value.type == "debit") {
          description = `Donation debit ${value.user.username}`;
          lanDesc = {
            langCode: "donation_debit",
            user: value.user.username,
          };
        } else {
          description = `Donation credit ${value.user.username}`;
          lanDesc = {
            langCode: "donation_credit",
            user: value.user.username,
          };
        }
      } else if (value.amount_type == "recruit_level_bonus") {
        (description = `referal commission (${value.user.username})`),
          (lanDesc = {
            langCode: "referal_commission",
            user: value.user.username,
          });
      } else if (value.amount_type == "roi_level_commission") {
        (description = `ROI level Commission (${value.user.username})`),
          (lanDesc = {
            langCode: "roi_level_commission",
            user: value.user.username,
          });
      } else if (value.amount_type == "daily_investment") {
        (description = "Daily roi"),
          (lanDesc = {
            langCode: "daily_roi_commission",
          });
      } else if (value.amount_type == "cash_back") {
        (description = "Instant cashback"),
          (lanDesc = {
            langCode: "instant_cashback",
          });
      } else if (value.amount_type == "level_commission") {
        (description = "Level commission"),
          (lanDesc = {
            langCode: "level_commission",
          });
      } else if (value.amount_type == "self_transfer") {
        (description = "BEB to USDT wallet"),
          (lanDesc = {
            langCode: "self_transfer",
          });
      } else if (value.amount_type == "self_transfer_to_beb") {
        (description = "USDT to BEB wallet"),
          (lanDesc = {
            langCode: "self_transfer",
          });
      } else if (
        value.amount_type == "board_commission" &&
        moduleStatus.table_status
      ) {
        description = `Table commission`;
        lanDesc = {
          langCode: "table_commission",
          user: "",
        };
      } else if (value.amount_type == "repurchase") {
        description = `Deducted for repurchase by ${value.user.username}`;
        lanDesc = {
          langCode: "deducted _for_repurchase_by",
          user: value.user.username,
        };
      } else if (value.amount_type == "purchase_donation") {
        lanDesc = {
          langCode: "purchase_donation_from",
          user: value.user.username,
        };
        description = `Purchase donation from ${value.user.username}`;
      } else if (_.includes(arrayCommission, value.amount_type)) {
        description = `${value.amount_type}_from ${value.user.username}`;
        lanDesc = {
          langCode: `${value.amount_type}_from`,
          user: value.user.username,
        };
      } else {
        let slugdescription = value.amount_type.replace(/-/g, "_");
        lanDesc = {
          langCode: `${slugdescription}`,
          user: "",
        };
        description = `${slugdescription}`;
      }

      // table_data[key] = {
      //   description: description,
      //   description1: lanDesc,
      //   amount: value.purchase_wallet / bebLiveValue,
      //   type: value.type,
      //   debit: `${dc.defaultCurrencySymbol}${value.purchase_wallet/bebLiveValue}`,
      //   credit: `${dc.defaultCurrencySymbol}${value.purchase_wallet/beb}`,
      //   date: moment(value.created_at).format("MM/DD/YYYY"),
      //   balance: balance,
      // };
      table_data[key] = {
        description: description,
        description1: lanDesc,
        amount: value.purchase_wallet / bebLiveValue,
        type: value.type,
        debit: `BEB ${value.purchase_wallet / bebLiveValue}`,
        credit: `BEB ${value.purchase_wallet / bebLiveValue}`,
        date: moment(value.created_at).format("MM/DD/YYYY"),
        balance: balance,
      };
    });
    var parAccountStatus = !(await common.isSubAccount(originUserId, prefix));
    var subUserNames = [];
    var subAccountCount = await common.getSubAccountCount(originUserId, prefix);
    parAccountStatus = parAccountStatus && subAccountCount > 0 ? true : false;
    if (parAccountStatus) {
      let isSubaccount = await common.isSubAccount(user_id, prefix);
      var subaccounts;
      if (!isSubaccount) {
        subaccounts = await common.getSubAccountUsernames(user_id, prefix);
      } else {
        let parentId = await common.getParentId(user_id, prefix);
        subaccounts = await common.getSubAccountUsernames(parentId, prefix);
      }

      Object.entries(subaccounts).map(([key, value]) => {
        subUserNames[key] = {
          value: value.username,
        };
      });
    }
    let data = {
      count: count,
      table_data: table_data,
      subAccounts: subUserNames,
      parAccountStatus,
    };
    let response = await successMessage({
      value: data,
    });
    res.json(response);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err.message);
  }
};

exports.getEarningExportData = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    if (req?.query?.username) {
      req.user.id = await common.usernameToId(req.query.username, prefix);
    }
    const user_id = req.user.id;
    let data = [];
    let trans = [];
    var { categories, start_date, end_date, length, start, order, direction } =
      req.query;
    let filters = {
      order: order,
      limit: parseInt(length) ? parseInt(length) : null,
      start: parseInt(start) ? parseInt(start) : 0,
      direction: direction,
    };
    const userEarns = await userEarnings(
      user_id,
      categories,
      start_date,
      end_date,
      filters,
      prefix
    );
    // Object.entries(userEarns).map(([key, value]) => {
    //   data[key] = {
    //     category: value.category ? value.category : "Total",
    //     total_amount: value.total_amount ? value.total_amount : 0,
    //     tax: value.tds ? value.tds : 0,
    //     service_charge: value.service_charge ? value.service_charge : 0,
    //     amount_payable: value.amount_payable ? value.amount_payable : 0,
    //     transaction_date: value.transaction_date
    //       ? moment(value.transaction_date).format("MM/DD/YYYY")
    //       : "",
    //   };
    // });
    Object.entries(userEarns).map(([key, value]) => {
      trans[key] = {
        category: value.category
          ? value.category.replaceAll("-", "_")
          : "Total",
        discription: {
          langCode: value.category
            ? value.category.replaceAll("-", "_")
            : "Total",
          user: "",
        },
        total_amount: value.total_amount ? value.total_amount : 0,
        tax: value.tds ? value.tds : 0,
        service_charge: value.service_charge ? value.service_charge : 0,
        amount_payable: value.amount_payable ? value.amount_payable : 0,
        transaction_date: value.transaction_date
          ? moment(value.transaction_date).format("MM/DD/YYYY")
          : "",
      };
      if (value.category == "roi_level_commission") {
        trans[key].discription.langCode = value["roi_level_commission_from"];
        trans[key].discription.user = value["userDetail.user.username"];
      } else if (value.category == "recruit_level_bonus") {
        trans[key].discription.langCode = value["recruit_level_bonus_from"];
        trans[key].discription.user = value["userDetail.user.username"];
      }
    });

    let response = await successMessage({
      value: trans,
    });
    return res.json(response);
  } catch (err) {
    console.log(err);
    return res.json(err.message);
  }
};

exports.getUserEarningsTable = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    if (req?.query?.username) {
      req.user.id = await common.usernameToId(req.query.username, prefix);
    }
    const originUserId = await common.usernameToId(req.user.username, prefix);

    const user_id = req.user.id;
    let [trans, enableBonus, subUserNames] = [[], [], []];
    var { start_date, end_date, length, start, order, direction } = req.query;
    let filters = {
      order: order ? order.split(",") : "",
      limit: parseInt(length) ? parseInt(length) : 10,
      start: parseInt(start),
      direction: direction,
    };
    let allTransaction = await userEarnings(
      user_id,
      filters.order,
      start_date,
      end_date,
      filters,
      prefix
    );
    let totalTransactions = await userEarnings(
      user_id,
      filters.order,
      start_date,
      end_date,
      "",
      prefix
    );
    let count = totalTransactions.length;
    let bonus = await getEnabledBonusCategories(prefix);
    Object.entries(bonus).map(([key, value]) => {
      enableBonus[key] = {
        key: value.replace(/[- ]/g, "_"),
        value: value,
      };
    });
    Object.entries(allTransaction).map(([key, value]) => {
      trans[key] = {
        category: value.category
          ? value.category.replaceAll("-", "_")
          : "Total",
        discription: {
          langCode: value.category
            ? value.category.replaceAll("-", "_")
            : "Total",
          user: "",
        },
        total_amount: value.total_amount ? value.total_amount : 0,
        tax: value.tds ? value.tds : 0,
        service_charge: value.service_charge ? value.service_charge : 0,
        amount_payable: value.amount_payable ? value.amount_payable : 0,
        transaction_date: value.transaction_date
          ? moment(value.transaction_date).format("MM/DD/YYYY")
          : "",
      };
      if (value.category == "roi_level_commission") {
        trans[key].discription.langCode = "roi_level_commission_from";

        trans[key].discription.user = value["userDetail.user.username"];
        // trans[key].discriptio
      } else if (value.category == "recruit_level_bonus") {
        trans[key].discription.langCode = "recruit_level_bonus_from";
        trans[key].discription.user = value["userDetail.user.username"];
      }
    });

    var parAccountStatus = !(await common.isSubAccount(originUserId, prefix));
    var subAccountCount = await common.getSubAccountCount(originUserId, prefix);
    parAccountStatus = parAccountStatus && subAccountCount > 0 ? true : false;
    if (parAccountStatus) {
      let isSubaccount = await common.isSubAccount(user_id, prefix);
      var subaccounts;
      if (!isSubaccount) {
        subaccounts = await common.getSubAccountUsernames(user_id, prefix);
      } else {
        let parentId = await common.getParentId(user_id, prefix);
        subaccounts = await common.getSubAccountUsernames(parentId, prefix);
      }

      Object.entries(subaccounts).map(([key, value]) => {
        subUserNames[key] = {
          value: value.username,
        };
      });
    }

    let data = {
      count: count,
      category: enableBonus,
      subAccounts: subUserNames,
      parAccountStatus,
      table_data: trans,
    };
    let response = await successMessage({
      value: data,
    });
    res.json(response);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err.message);
  }
};

exports.ewalletTile = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    let userId = req.user.id;
    let ewalletTile = [];

    const moduleStatus = await modStatus.getModuleStatus(prefix);
    const balance = await usrBalance.findOne({
      attributes: ["balance_amount", "purchase_wallet"],
      where: {
        user_id: userId,
      },
      prefix,
    });
    const coinBalance = await UserWalletBalance.findOne({
      attributes: ["balance"],
      where: {
        user_id: userId,
      },
      prefix,
    });
    console.log("=================coin balance = ", coinBalance.balance);
    const totalCommission = await legAmount.findOne({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("amount_payable")), "sum"],
      ],
      where: {
        user_id: userId,
      },
      raw: true,
      prefix,
    });
    // const total = await getEwalletOverviewTotal(moduleStatus, userId, prefix);
    // return res.json(total)
    const transFee = await getTransactionFee(prefix);
    const repurchaseStatus = moduleStatus.repurchase_status;
    const purchaseWallet = moduleStatus.purchase_wallet;
    // let credit = {
    //   amount: total?.credit ? Number(total?.credit) : 0,
    //   text: "credited",
    //   amountWithCurrency: total?.credit ? Number(total?.credit) : 0,
    //   icon: `${process.env.SITE_URL}/uploads/logos/income-w.png`,
    //   bg_color: "#8777DE",
    //   currency: "$",
    // };
    // ewalletTile.push(credit);
    // let debit = {
    //   amount: total?.debit ? Number(total?.debit) : 0,
    //   text: "debited",
    //   amountWithCurrency: total?.debit ? Number(total?.debit) : 0,
    //   icon: `${process.env.SITE_URL}/uploads/logos/Bonus-w.png`,
    //   bg_color: "#38A5A9",
    //   currency: "$",
    // };
    // ewalletTile.push(debit);
    let balanceArr = {
      amount: coinBalance?.balance ? Number(coinBalance?.balance) : 0,
      text: "ewalletBalance",
      amountWithCurrency: coinBalance?.balance ? coinBalance?.balance : 0,
      icon: `${process.env.SITE_URL}/uploads/logos/E-Wallet-w.png`,
      bg_color: "#5B9CCE",
      currency: "$",
    };
    ewalletTile.push(balanceArr);

    const bebLiveValue = await common.getLiveBebValue(prefix);
    console.log("========bebe value ======================", bebLiveValue);
    let purchaseWalletValue = balance.purchase_wallet / bebLiveValue;
    let purchase = {
      amount: purchaseWalletValue ? Number(purchaseWalletValue) : 0,
      text: "purchaseWallet",
      amountWithCurrency: purchaseWalletValue ? purchaseWalletValue : 0,
      icon: `${process.env.SITE_URL}/uploads/logos/income-w.png`,
      bg_color: "#6176C1",
      currency: "BEB",
    };
    ewalletTile.push(purchase);

    let totalEarned = {
      amount: totalCommission?.sum ? Number(totalCommission?.sum) : 0,
      text: "commissionEarned",
      amountWithCurrency: totalCommission?.sum
        ? Number(totalCommission?.sum)
        : 0,
      icon: `${process.env.SITE_URL}/uploads/logos/income-w.png`,
      bg_color: "#E0937A",
      currency: "$",
    };
    ewalletTile.push(totalEarned);

    const defaultCurrencyValue = await common.getDefaultPlanCurrencyValue(
      prefix
    );
    const defaultCurrencyCode = await common.getDefaultCurrencyCode(prefix);
    const isSubaccount = await common.isSubAccount(userId, prefix);
    let data = {
      transactionFee: transFee,
      repurchase_status: repurchaseStatus == 0 ? "no" : "yes",
      purchase_wallet: purchaseWallet == 0 ? "no" : "yes",
      transactionFeewithCurrency: transFee,
      ewallet_tile: ewalletTile,
      balance: Number(balanceArr.amount),
      purchaseWallet_balance: Number(purchase.amount),
      balanceWithCurrency: balanceArr.amountWithCurrency,
      defaultcurrencyvalue: defaultCurrencyValue,
      defaultcurrencycode: defaultCurrencyCode,
      primaryAccount: !isSubaccount,
    };
    let response = await successMessage({
      value: data,
    });
    res.json(response);
  } catch (err) {
    console.log(err);
    return res.json(err.message);
  }
};

exports.fundTransfer = async (req, res) => {
  var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  let t = await mlm_laravel.transaction();
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const userId = req.user.id;
    let { to_user_name, pswd, transaction_note, amount } = req.body;
    if (to_user_name == req.user.username) {
      let response = await errorMessage({ code: 1072 });
      return res.status(422).json(response);
    }
    const moduleStatus = await modStatus.getModuleStatus(prefix);
    if (moduleStatus.multi_currency_status) {
      const default_currency = await common.getUserCurrencyId(userId, prefix);
      if (default_currency == null) {
        let defaultCurrencyValue = await common.getDefaultPlanCurrencyValue(
          prefix
        );
        amount = (Number(amount) / Number(defaultCurrencyValue)).toFixed(8);
      } else {
        let currencyValue = await common.getUserCurrencyValue(
          default_currency,
          prefix
        );
        amount = (Number(amount) / Number(currencyValue)).toFixed(8);
      }
    }
    const fromUserId = userId;
    const toUserId = await common.usernameToId(to_user_name, prefix);
    if (!toUserId) {
      return res.json({
        status: false,
        error: {
          code: 1004,
          description: "Incorrect Input Format / Validation Error",
          fields: {
            to_user_name: "This username is not available",
            to_user_name_err: "user_exists",
          },
        },
      });
    }
    if (amount <= 0) {
      let response = await errorMessage({ code: 406 });
      return res.json(response);
    }
    const transFee = await getTransactionFee(prefix);
    const totalRegAmount = Number(amount) + Number(transFee);
    if (totalRegAmount < 1) {
      let response = await errorMessage({ code: 406 });
      return res.status(422).json(response);
    }
    const userPass = await getUserTransPassword(fromUserId, prefix);
    const fromUserBalance = await UserWalletBalance.findOne({
      attributes: ["id", "balance", "wallet_address"],
      where: {
        user_id: fromUserId,
      },
      prefix,
    });
    const toUserBalance = await UserWalletBalance.findOne({
      attributes: ["id", "balance", "wallet_address"],
      where: {
        user_id: toUserId,
      },
      prefix,
    });

    if (totalRegAmount <= Number(fromUserBalance.balance)) {
      const checkPass = await bcrypt.compare(pswd, userPass);
      if (checkPass) {
        const uniqueTransactionId = Str.random(9);
        const totalFromUserBal =
          Number(fromUserBalance.balance) - Number(totalRegAmount);
        const totalToUserBal = Number(toUserBalance.balance) + Number(amount);
        await fromUserBalance.update(
          {
            balance: totalFromUserBal,
          },
          {
            transaction: t,
          },
          prefix
        );
        await toUserBalance.update(
          {
            balance: totalToUserBal,
          },
          {
            transaction: t,
          },
          prefix
        );

        const TransactionDetails = await Transactions.create(
          {
            transaction_id: uniqueTransactionId,
          },
          {
            transaction: t,
            prefix,
          }
        );

        const fromUserTransfer = await fundTransfer.create(
          {
            from_id: fromUserId,
            to_id: toUserId,
            amount: Number(amount),
            amount_type: "user_credit",
            notes: transaction_note,
            trans_fee: transFee,
            transaction_id: TransactionDetails.id,
          },
          {
            transaction: t,
            prefix,
          }
        );
        // await ewalletHistory.create(
        //   {
        //     user_id: toUserId,
        //     from_id: fromUserId,
        //     reference_id: fromUserTransfer.id,
        //     ewallet_type: "fund_transfer",
        //     amount: Number(amount),
        //     balance: totalToUserBal,
        //     from_balance: totalFromUserBal,
        //     purchase_wallet: 0,
        //     amount_type: "user_debit",
        //     type: "credit",
        //     transaction_id: TransactionDetails.id,
        //     transaction_fee: transFee,
        //     date_added: new Date(),
        //   },
        //   {
        //     transaction: t,
        //     prefix,
        //   }
        // );
        const debitHistory = await WalletHistories.create(
          {
            user_id: fromUserId,
            from_id: toUserId,
            reference_id: fromUserTransfer.id,
            amount: Number(amount),
            balance: totalFromUserBal,
            amount_type: "user_usdt_transfer",
            type: "debit",
            transaction_id: TransactionDetails.id,
            wallet_address: fromUserBalance.wallet_address,
            transaction_fee: transFee,
            date_added: new Date(),
          },
          {
            transaction: t,
            prefix,
          }
        );
        const creditHistory = await WalletHistories.create(
          {
            user_id: toUserId,
            from_id: fromUserId,
            reference_id: fromUserTransfer.id,
            amount: Number(amount),
            balance: totalToUserBal,
            amount_type: "user_usdt_transfer",
            type: "credit",
            transaction_id: TransactionDetails.id,
            wallet_address: toUserBalance.wallet_address,
            transaction_fee: transFee,
            date_added: new Date(),
          },
          {
            transaction: t,
            prefix,
          }
        );

        // user activity
        let data = {
          to_user: to_user_name,
          trans_note: transaction_note,
          amount: amount,
        };
        let dataArr = JSON.stringify(data);
        await common.insertUserActivity(
          "Fund Transfered",
          fromUserId,
          "Fund Has Be Transfered",
          dataArr,
          t,
          ip,
          prefix
        );

        await t.commit();
        let response = await successMessage({ code: 200 });
        return res.json(response);
      } else {
        await t.rollback();
        let response = await errorMessage({ code: 1015 });
        return res.json(response);
      }
    } else {
      await t.rollback();
      let response = await errorMessage({ code: 1014 });
      return res.json(response);
    }
  } catch (err) {
    console.log(err);
    await t.rollback();
    return res.json(err);
  }
};

async function getEwalletOverviewTotal(moduleStatus, userId, prefix) {
  let credit = 0;
  var debit = 0;
  let amountTypes = [];

  if (moduleStatus.pin_status) {
    amountTypes = [
      "pin_purchase",
      "pin_purchase_refund",
      "pin_purchase_delete",
    ];
  }
  amountTypes = [
    ...amountTypes,
    "admin_credit",
    "admin_debit",
    "user_credit",
    "user_debit",
    "payout_request",
    "payout_release_manual",
    "payout_delete",
    "payout_inactive",
    "withdrawal_cancel",
  ];
  let eStatus = await paymentConfig.findOne({
    attributes: ["status"],
    where: {
      name: "E-wallet",
    },
    prefix,
  });
  if (eStatus.status) {
    amountTypes = [...amountTypes, "registration"];
    if (moduleStatus.ecom_status || moduleStatus.repurchase_status) {
      amountTypes = [...amountTypes, "repurchase"];
    }
    if (moduleStatus.package_upgrade) {
      amountTypes = [...amountTypes, "upgrade"];
    }
    if (moduleStatus.subscription_status) {
      amountTypes = [...amountTypes, "package_validity"];
    }
  }
  let enableBonusList = await getEnabledBonusList(prefix);
  amountTypes = [...amountTypes, ...enableBonusList];
  let ewalletCredit = await ewalletHistory.findAll({
    attributes: [
      Sequelize.literal(
        "SUM(IF(ewallet_type = 'commission', amount, amount)) as credit"
      ),
    ],
    where: {
      amount_type: amountTypes,
      user_id: userId,
      type: "credit",
    },
    raw: true,
    prefix,
  });
  let ewalletdebit = await ewalletHistory.findAll({
    attributes: [
      Sequelize.literal(
        "SUM(IF(ewallet_type = 'commission', amount, amount)) as debit"
      ),
    ],
    where: {
      user_id: userId,
      type: "debit",
    },
    raw: true,
    prefix,
  });
  ewalletdebit[0]["debit"] = Number(ewalletdebit[0]["debit"]) ?? 0;
  let ewalletdebit2 = await ewalletHistory.findAll({
    attributes: [
      Sequelize.literal(
        "SUM(IF(ewallet_type = 'commission', amount, amount)) as debit"
      ),
    ],
    where: {
      ewallet_type: "fund_transfer",
      from_id: userId,
    },
    raw: true,
    prefix,
  });
  ewalletdebit2[0]["debit"] = Number(ewalletdebit2[0]["debit"]) ?? 0;
  const transFee = await ewalletHistory.findOne({
    attributes: [
      [
        Sequelize.fn("SUM", Sequelize.col("transaction_fee")),
        "transaction_fee",
      ],
    ],
    where: {
      amount_type: ["payout_request", "user_debit", "user_credit"],
      from_id: userId,
    },
    prefix,
  });
  transFee.transaction_fee = Number(transFee.transaction_fee) ?? 0;
  let result = {
    credit: ewalletCredit[0]["credit"],
    debit:
      ewalletdebit[0]["debit"] +
      ewalletdebit2[0]["debit"] +
      transFee.transaction_fee,
  };
  return result;
}

async function getEnabledBonusList(prefix) {
  let list = [];
  let level_commission_status = 0;
  let xup_commission_status = 0;
  const moduleStatus = await modStatus.getModuleStatus(prefix);
  const config = await compensation.findOne({ prefix });

  if (
    _.includes(["Matrix", "Unilevel", "Donation"], moduleStatus.mlm_plan) ||
    moduleStatus.sponsor_commission_status
  ) {
    level_commission_status = 1;
  }
  if (moduleStatus.xup_status && level_commission_status) {
    xup_commission_status = 1;
    level_commission_status = 0;
  }
  if (moduleStatus.referral_status) {
    list.push("recruit_level_bonus");
  }
  if (moduleStatus.rank_status) {
    list.push("rank_bonus");
  }
  if (level_commission_status) {
    list.push("level_commission");
    if (moduleStatus.repurchase_status && moduleStatus.ecom_status) {
      list.push("repurchase_level_commission");
    }
    if (moduleStatus.package_upgrade) {
      list.push("roi_level_commission");
    }
  }
  if (xup_commission_status) {
    list.push("xup_commission");
    if (moduleStatus.repurchase_status && moduleStatus.ecom_status) {
      list.push("xup_repurchase_level_commission");
    }
    if (moduleStatus.package_upgrade) {
      list.push("xup_upgrade_level_commission");
    }
  }
  if (moduleStatus.mlm_plan == "Binary") {
    list.push("leg");
    if (moduleStatus.repurchase_status && moduleStatus.ecom_status) {
      list.push("repurchase_leg");
    }
    if (moduleStatus.package_upgrade) {
      list.push("upgrade_leg");
    }
  }
  if (moduleStatus.mlm_plan == "Stair_Step") {
    list.push("stair_step", "override_bonus");
  }
  if (moduleStatus.mlm_plan == "Board") {
    list.push("board_commission");
  }
  if (moduleStatus.roi_status && moduleStatus.hyip_status) {
    list.push("daily_investment");
  }
  if (moduleStatus.mlm_plan == "Donation") {
    list.push("donation", "purchase_donation");
  }
  if (config.matching_bonus) {
    list.push("matching_bonus");
    if (moduleStatus.repurchase_status && moduleStatus.ecom_status) {
      list.push("matching_bonus_purchase");
    }
    if (moduleStatus.package_upgrade) {
      list.push("matching_bonus_upgrade");
    }
  }
  if (config.pool_bonus) {
    list.push("pool_bonus");
  }
  if (config.fast_start_bonus) {
    list.push("fast_start_bonus");
  }
  if (config.performance_bonus) {
    const performanceDetails = await performance.findAll({
      attributes: ["name", "slug"],
      prefix,
    });
    Object.entries(performanceDetails).map(([key, value]) => {
      list.push(value.name.replace(/ /g, "_"));
    });
  }
  return list;
}

async function userEarnings(
  user_id,
  categories,
  fromDate,
  toDate,
  filters,
  prefix
) {
  let [whereStatement, list, enableBonus] = [[], [], []];
  let bonusList = await getEnabledBonusList(prefix);
  Object.entries(bonusList).map(([key, value]) => {
    enableBonus.push(value.replaceAll(" ", "_"));
  });
  if (user_id) {
    let condition1 = {
      user_id: user_id,
    };
    whereStatement.push(condition1);
  }
  if (fromDate) {
    fromDate = moment(fromDate).format("YYYY-MM-DD 00:00:00");
    let condition2 = {
      date_of_submission: {
        [Op.gte]: fromDate,
      },
    };
    whereStatement.push(condition2);
  }
  if (toDate) {
    toDate = moment(toDate).format("YYYY-MM-DD 23:59:59");

    let condition3 = {
      date_of_submission: {
        [Op.lte]: toDate,
      },
    };
    whereStatement.push(condition3);
  }
  if (categories) {
    if (_.includes(categories, ["donation"])) {
      list.push("donation", "purchase_donation");
    }
    if (_.includes(categories, ["level_commission"])) {
      list.push(
        _.intersection(
          [
            "level_commission",
            "repurchase_level_commission",
            "upgrade_level_commission",
          ],
          enableBonus
        )
      );
    }
    if (_.includes(categories, ["xup_commission"])) {
      list.push(
        _.intersection(
          [
            "xup_commission",
            "xup_repurchase_level_commission",
            "xup_upgrade_level_commission",
          ],
          enableBonus
        )
      );
    }
    if (_.includes(categories, ["leg"])) {
      list.push(
        _.intersection(["leg", "repurchase_leg", "upgrade_leg"], enableBonus)
      );
    }
    if (_.includes(categories, ["matching_bonus"])) {
      list.push(
        _.intersection(
          [
            "matching_bonus",
            "matching_bonus_purchase",
            "matching_bonus_upgrade",
          ],
          enableBonus
        )
      );
    }
    if (_.difference(categories, enableBonus)) {
      list.push(categories);
    }
    let condition4 = {
      amount_type: list,
    };
    whereStatement.push(condition4);
  }
  const earnings = await legAmount.findAll({
    attributes: [
      Sequelize.literal(
        "CASE WHEN amount_type = 'purchase_donation' THEN 'donation' WHEN amount_type = 'repurchase_leg' THEN 'leg' WHEN amount_type = 'upgrade_leg' THEN 'leg' WHEN amount_type = 'matching_bonus_purchase' THEN 'matching_bonus' WHEN amount_type = 'matching_bonus_upgrade' THEN 'matching_bonus' ELSE amount_type END AS category"
      ),
      "from_id",
      "total_amount",
      "amount_payable",
      "tds",
      "service_charge",
      ["date_of_submission", "transaction_date"],
    ],
    raw: true,
    include: [
      {
        model: UserDetails,
        attributes: ["name", "second_name"],
        include: [
          {
            model: User,
            attributes: ["username"],
          },
        ],
      },
    ],
    where: whereStatement,
    offset: filters.start,
    limit: filters.limit,
    prefix,
  });

  return earnings;
}

async function getEnabledBonusCategories(prefix) {
  let categories = [];

  var bonusList = await getEnabledBonusList(prefix);
  bonusList.push("cashback");
  bonusList = _.difference(bonusList, [
    // "recruit_level_bonus",
    // "cashback",
    // "daily_wage",
    "level_commission",
    // "purchase_donation",
    // "repurchase_level_commission",
    // "upgrade_level_commission",
    // "xup_repurchase_level_commission",
    // "xup_upgrade_level_commission",
    // "repurchase_leg",
    // "upgrade_leg",
    // "matching_bonus_purchase",
    // "matching_bonus_upgrade",
  ]);

  categories = _.merge(bonusList, categories);
  return categories;
}

async function getTransactionFee(prefix) {
  const fee = await Config.findOne({
    attributes: ["trans_fee"],
    prefix,
  });
  return fee.trans_fee;
}

async function getUserTransPassword(userId, prefix) {
  const pass = await TransPass.findOne({
    attributes: ["password"],
    where: {
      user_id: userId,
    },
    prefix,
  });
  return pass.password;
}

exports.bebwalletToUsdtWalletFundTrasnfer = async (req, res) => {
  let t = await mlm_laravel.transaction();

  try {
    var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;
    let { pswd, transaction_note, amount } = req.body;
    const moduleStatus = await modStatus.getModuleStatus(prefix);
    if (moduleStatus.multi_currency_status) {
      console.log(
        "======================inside multi currency statu================="
      );
      const default_currency = await common.getUserCurrencyId(id, prefix);
      if (default_currency == null) {
        let defaultCurrencyValue = await common.getDefaultPlanCurrencyValue(
          prefix
        );
        amount = (Number(amount) / Number(defaultCurrencyValue)).toFixed(8);
      } else {
        let currencyValue = await common.getUserCurrencyValue(
          default_currency,
          prefix
        );
        amount = (Number(amount) / Number(currencyValue)).toFixed(8);
      }
    }

    if (Number(amount) <= 0) {
      let response = await errorMessage({ code: 406 });
      return res.json(response);
    }
    // const transFee = await getTransactionFee(prefix);
    const transFee = Number(amount) * 0.1;
    console.log("============transaction fee=========", transFee);
    let totalRegAmount = Number(amount) + Number(transFee);
    if (totalRegAmount < 0) {
      let response = await errorMessage({ code: 406 });
      return res.status(422).json(response);
    }
    const userPass = await getUserTransPassword(id, prefix);
    // console.log(userPass);
    const cashWalletBalanceDetails = await usrBalance.findOne({
      attributes: ["id", "balance_amount", "purchase_wallet"],
      where: {
        user_id: id,
      },
      prefix,
    });
    const toUserBalance = await UserWalletBalance.findOne({
      attributes: ["id", "balance", "wallet_address"],
      where: {
        user_id: id,
      },
      prefix,
    });
    const bebLiveValue = await common.getLiveBebValue(prefix);
    amount = Number(amount) * Number(bebLiveValue);
    totalRegAmount = Number(totalRegAmount) * Number(bebLiveValue);
    console.log("=========total reg amount =============", totalRegAmount);
    if (
      totalRegAmount <=
      Number(cashWalletBalanceDetails.purchase_wallet) * Number(bebLiveValue)
    ) {
      const checkPass = await bcrypt.compare(pswd, userPass);

      if (checkPass) {
        const uniqueTransactionId = Str.random(9);
        const remainingCashWalletBalance =
          Number(cashWalletBalanceDetails.purchase_wallet) -
          Number(totalRegAmount);

        const latestProductWallet =
          Number(toUserBalance.balance) + Number(amount);

        const debitbalnce = await cashWalletBalanceDetails.update(
          {
            purchase_wallet: remainingCashWalletBalance,
          },
          {
            transaction: t,
          },
          prefix
        );

        const creditBalence = await toUserBalance.update(
          {
            balance: latestProductWallet,
          },
          {
            transaction: t,
          },
          prefix
        );
        const TransactionDetails = await Transactions.create(
          {
            transaction_id: uniqueTransactionId,
          },
          {
            transaction: t,
            prefix,
          }
        );
        const fund_transfer_details = await fundTransfer.create(
          {
            from_id: id,
            to_id: id,
            amount,
            amount_type: "self_transfer",
            trans_fee: transFee,
          },
          { transaction: t, prefix }
        );
        const cash_wallet_history = await purchaseWalletHsty.create(
          {
            user_id: id,
            from_user_id: id,
            purchase_wallet: Number(totalRegAmount),
            amount: Number(totalRegAmount),
            balance: remainingCashWalletBalance,
            amount_type: "self_transfer",
            type: "debit",
            transaction_fee: transFee,
            transaction_id: fund_transfer_details.dataValues.id,
          },
          { transaction: t, prefix }
        );

        const debitHistory = await WalletHistories.create(
          {
            user_id: id,
            from_id: id,
            reference_id: fund_transfer_details.dataValues.id,
            amount: Number(amount),
            balance: latestProductWallet,
            amount_type: "self_transfer",
            type: "credit",
            transaction_id: TransactionDetails.id,
            wallet_address: toUserBalance.wallet_address,
            transaction_fee: transFee,
            date_added: new Date(),
          },
          {
            transaction: t,
            prefix,
          }
        );
        let data = {
          user: id,
          trans_note: transaction_note,
          amount: amount,
        };
        let dataArr = JSON.stringify(data);
        await common.insertUserActivity(
          "Fund Transfered",
          id,
          "Fund Has Be Transfered",
          dataArr,
          t,
          ip,
          prefix
        );

        await t.commit();
        //add to ewallet history ( product wallet history)

        let response = await successMessage({ code: 200 });
        return res.json(response);
        //send success response
      } else {
        await t.rollback();
        let response = await errorMessage({ code: 1015 });
        return res.json(response);
      }
    } else {
      await t.rollback();
      let response = await errorMessage({ code: 1071 });
      return res.json(response);
    }
  } catch (error) {
    await t.rollback();
    console.log(error);
    let response = await errorMessage({ code: 406 });
    return res.json(response);
  }
};
async function getUserTransPassword(userId, prefix) {
  const pass = await TransPass.findOne({
    attributes: ["password"],
    where: {
      user_id: userId,
    },
    prefix,
  });
  return pass.password;
}

exports.getSubAcountsParent = async (req, res) => {
  const prefix = req.headers["api-key"];
  if (!prefix) {
    let response = await errorMessage({ code: 1001 });
    return res.json(response);
  }
  try {
    const id = req.user.id;
    let user_details = await User.findOne({
      where: {
        id,
      },
      attributes: ["parent_id"],
      prefix,
    });
    var result;
    if (user_details.parent_id == null) {
      let usernameList = await common.getSubAccountUsernames(id, prefix);
      result = {
        isSubAccount: false,
        subAccountUsername: usernameList,
      };
    } else {
      parent_username = await common.idToUsername(
        user_details.parent_id,
        prefix
      );
      result = {
        isSubAccount: true,
        parentName: parent_username,
      };
    }
    return res.json({ status: true, data: result });
  } catch (error) {
    console.log(error);
    return res.json({ status: false, message: error.message });
  }
};

exports.usdtToBebSelfTransfer = async (req, res) => {
  try {
    let t = await mlm_laravel.transaction();

    var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;
    let { pswd, transaction_note, amount } = req.body;
    const moduleStatus = await modStatus.getModuleStatus(prefix);
    if (moduleStatus.multi_currency_status) {
      const default_currency = await common.getUserCurrencyId(userId, prefix);
      if (default_currency == null) {
        let defaultCurrencyValue = await common.getDefaultPlanCurrencyValue(
          prefix
        );
        amount = (Number(amount) / Number(defaultCurrencyValue)).toFixed(8);
      } else {
        let currencyValue = await common.getUserCurrencyValue(
          default_currency,
          prefix
        );
        amount = (Number(amount) / Number(currencyValue)).toFixed(8);
      }
    }

    if (Number(amount) <= 0) {
      let response = await errorMessage({ code: 406 });
      return res.json(response);
    }
    // const transFee = await getTransactionFee(prefix);
    const totalRegAmount = Number(amount);
    // + Number(transFee);
    if (totalRegAmount < 1) {
      let response = await errorMessage({ code: 406 });
      return res.status(422).json(response);
    }
    const userPass = await getUserTransPassword(id, prefix);
    // console.log(userPass);
    const cashWalletBalanceDetails = await usrBalance.findOne({
      attributes: ["id", "balance_amount", "purchase_wallet"],
      where: {
        user_id: id,
      },
      prefix,
    });
    const toUserBalance = await UserWalletBalance.findOne({
      attributes: ["id", "balance", "wallet_address"],
      where: {
        user_id: id,
      },
      prefix,
    });
    const bebLiveValue = await common.getLiveBebValue(prefix);
    // amount = amount * bebLiveValue;
    if (totalRegAmount <= Number(toUserBalance.balance)) {
      const checkPass = await bcrypt.compare(pswd, userPass);
      if (checkPass) {
        const uniqueTransactionId = Str.random(9);
        const remainingCashWalletBalance =
          Number(toUserBalance.balance) - Number(totalRegAmount);
        // const totalBebValue = Number(totalRegAmount) / Number(bebLiveValue);
        const latestProductWallet =
          Number(cashWalletBalanceDetails.purchase_wallet) +
          Number(totalRegAmount);

        await cashWalletBalanceDetails.update(
          {
            // balance_amount: remainingCashWalletBalance,
            purchase_wallet: latestProductWallet,
          },
          {
            transaction: t,
          },
          prefix
        );
        const creditBalence = await toUserBalance.update(
          {
            balance: remainingCashWalletBalance,
          },
          {
            transaction: t,
          },
          prefix
        );
        const TransactionDetails = await Transactions.create(
          {
            transaction_id: uniqueTransactionId,
          },
          {
            transaction: t,
            prefix,
          }
        );
        const fund_transfer_details = await fundTransfer.create(
          {
            from_id: id,
            to_id: id,
            amount,
            amount_type: "self_transfer",
            trans_fee: transFee,
          },
          { transaction: t, prefix }
        );
        const cash_wallet_history = await purchaseWalletHsty.create(
          {
            user_id: id,
            from_user_id: null,
            purchase_wallet: totalRegAmount,
            amount: totalRegAmount,
            balance: latestProductWallet,
            amount_type: "self_transfer_to_beb",
            type: "credit",
            transaction_fee: 0,
            transaction_id: fund_transfer_details.dataValues.id,
          },
          { transaction: t, prefix }
        );
        // const product_wallet_history = await ewalletHistory.create(
        //   {
        //     user_id: id,
        //     from_id: null,
        //     ewallet_type: "fund_transfer",
        //     amount: totalRegAmount,
        //     balance: remainingCashWalletBalance,
        //     amount_type: "self_transfer_to_beb",
        //     type: "debit",
        //     transaction_fee: 0,
        //     reference_id: fund_transfer_details.dataValues.id,
        //   },
        //   { transaction: t, prefix }
        // );
        const debitHistory = await WalletHistories.create(
          {
            user_id: id,
            from_id: id,
            reference_id: fund_transfer_details.dataValues.id,
            amount: Number(amount),
            balance: remainingCashWalletBalance,
            amount_type: "self_transfer_to_beb",
            type: "debit",
            transaction_id: TransactionDetails.id,
            wallet_address: toUserBalance.wallet_address,
            transaction_fee: transFee,
            date_added: new Date(),
          },
          {
            transaction: t,
            prefix,
          }
        );
        let data = {
          user: id,
          trans_note: transaction_note,
          amount: amount,
        };
        let dataArr = JSON.stringify(data);
        await common.insertUserActivity(
          "Fund Transfered",
          id,
          "Fund Has Be Transfered",
          dataArr,
          t,
          ip,
          prefix
        );

        await t.commit();
        //add to ewallet history ( product wallet history)

        let response = await successMessage({ code: 200 });
        return res.json(response);
        //send success response
      } else {
        await t.rollback();
        let response = await errorMessage({ code: 1015 });
        return res.json(response);
      }
    } else {
      await t.rollback();
      let response = await errorMessage({ code: 1071 });
      return res.json(response);
    }
  } catch (error) {
    console.log(error);
    let response = await errorMessage({ code: 1004 });
    return res.json(response);
  }
};

exports.getsubAccountsData = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.status(422).json(response);
    }
    const { id } = req.user;
    const isSubAccount = await common.isSubAccount(id, prefix);
    if (isSubAccount) {
      let response = await errorMessage({ code: 406 });
      return res.status(422).json(response);
    }
    const subAccountsData = await User.findAll({
      attributes: ["username"],
      include: [
        {
          model: usrBalance,
          attributes: ["balance_amount", "purchase_wallet"],
        },
        {
          model: UserWalletBalance,
          attributes: ["balance"],
        },
      ],
      where: {
        parent_id: id,
        active: 1,
      },
      prefix,
    });
    console.log(
      "==================================sub account data ================",
      JSON.stringify(subAccountsData)
    );
    let data = [];
    for await (let elements of subAccountsData) {
      console.log("========element=====", JSON.stringify(elements));
      let value = {
        username: elements.username,
        usdtBalance: elements.userWalletBalances[0].balance,
        bebBalance: elements.userBalances[0].purchase_wallet,
      };
      data.push(value);
    }
    let response = await successMessage({ value: data });
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    let response = await errorMessage({ code: 403 });
    return res.status(422).json(response);
  }
};

exports.parentAccountTransfer = async (req, res) => {
  try {
    let t = await mlm_laravel.transaction();
    var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.status(422).json(response);
    }
    // start
    const userId = req.user.id;
    let { subaccount_username, pswd, transaction_note, withdraw_amount } =
      req.body;
    let type = req.body?.wallet_type == "USDT Wallet" ? "usdt" : "beb";
    const subId = await common.usernameToId(subaccount_username, prefix);
    const moduleStatus = await modStatus.getModuleStatus(prefix);
    if (moduleStatus.multi_currency_status) {
      const default_currency = await common.getUserCurrencyId(fromId, prefix);
      if (default_currency == null) {
        let defaultCurrencyValue = await common.getDefaultPlanCurrencyValue(
          prefix
        );
        withdraw_amount = (
          Number(withdraw_amount) / Number(defaultCurrencyValue)
        ).toFixed(8);
      } else {
        let currencyValue = await common.getUserCurrencyValue(
          default_currency,
          prefix
        );
        withdraw_amount = (
          Number(withdraw_amount) / Number(currencyValue)
        ).toFixed(8);
      }
    }
    if (withdraw_amount <= 0) {
      let response = await errorMessage({ code: 406 });
      return res.json(response);
    }
    const transFee = await getTransactionFee(prefix);
    const totalRegAmount = Number(withdraw_amount) + Number(transFee);
    if (totalRegAmount < 1) {
      let response = await errorMessage({ code: 406 });
      return res.status(422).json(response);
    }
    const userPass = await getUserTransPassword(subId, prefix);
    const checkPass = await bcrypt.compare(pswd, userPass);
    if (!checkPass) {
      let response = await errorMessage({ code: 1021 });
      return res.status(422).json(response);
    }
    // ewallet or purchase wallet
    if (type == "usdt") {
      const fromUserBalance = await UserWalletBalance.findOne({
        attributes: ["id", "balance"],
        where: {
          user_id: subId,
        },
        prefix,
      });

      const toUserBalance = await UserWalletBalance.findOne({
        attributes: ["id", "balance"],
        where: {
          user_id: userId,
        },
        prefix,
      });

      if (totalRegAmount > Number(fromUserBalance.balance)) {
        let response = await errorMessage({ code: 1025 });
        return res.status(422).json(response);
      }

      const uniqueTransactionId = Str.random(9);
      const totalFromUserBal =
        Number(fromUserBalance.balance) - Number(totalRegAmount);
      const totalToUserBal =
        Number(toUserBalance.balance) + Number(withdraw_amount);
      await fromUserBalance.update(
        {
          balance: totalFromUserBal,
        },
        {
          transaction: t,
        },
        prefix
      );
      await toUserBalance.update(
        {
          balance: totalToUserBal,
        },
        {
          transaction: t,
        },
        prefix
      );

      const TransactionDetails = await Transactions.create(
        {
          transaction_id: uniqueTransactionId,
        },
        {
          transaction: t,
          prefix,
        }
      );

      const fromUserTransfer = await fundTransfer.create(
        {
          from_id: subId,
          to_id: userId,
          amount: Number(withdraw_amount),
          amount_type: "user_credit",
          notes: transaction_note,
          trans_fee: 0,
          transaction_id: TransactionDetails.id,
        },
        {
          transaction: t,
          prefix,
        }
      );
      // await ewalletHistory.create(
      //   {
      //     user_id: userId,
      //     from_id: subId,
      //     reference_id: fromUserTransfer.id,
      //     ewallet_type: "fund_transfer",
      //     amount: Number(withdraw_amount),
      //     balance: totalToUserBal,
      //     from_balance: totalFromUserBal,
      //     purchase_wallet: 0,
      //     amount_type: "self_transfer",
      //     type: "credit",
      //     transaction_id: uniqueTransactionId,
      //     transaction_fee: transFee,
      //     date_added: new Date(),
      //   },
      //   {
      //     transaction: t,
      //     prefix,
      //   }
      // );

      // check the status     continue.......
      const creditHistory = await WalletHistories.create(
        {
          user_id: userId,
          from_id: subId,
          reference_id: fromUserTransfer.id,
          amount: Number(withdraw_amount),
          balance: totalToUserBal,
          amount_type: "self_transfer_from_parent",
          type: "credit",
          transaction_id: TransactionDetails.id,
          wallet_address: toUserBalance.wallet_address,
          transaction_fee: 0,
          date_added: new Date(),
        },
        {
          transaction: t,
          prefix,
        }
      );
      const debitHistory = await WalletHistories.create(
        {
          user_id: subId,
          from_id: userId,
          reference_id: fromUserTransfer.id,
          amount: Number(withdraw_amount),
          balance: totalFromUserBal,
          amount_type: "self_transfer_from_parent",
          type: "debit",
          transaction_id: TransactionDetails.id,
          wallet_address: toUserBalance.wallet_address,
          transaction_fee: 0,
          date_added: new Date(),
        },
        {
          transaction: t,
          prefix,
        }
      );
    } else {
      const fromCashWallet = await usrBalance.findOne({
        attributes: ["id", "purchase_wallet"],
        where: {
          user_id: subId,
        },
        prefix,
      });

      const toCashWallet = await usrBalance.findOne({
        attributes: ["id", "purchase_wallet"],
        where: {
          user_id: userId,
        },
        prefix,
      });
      const bebLiveValue = await common.getLiveBebValue(prefix);
      withdraw_amount = withdraw_amount * bebLiveValue;
      if (totalRegAmount > Number(fromCashWallet.purchase_wallet)) {
        let response = await errorMessage({ code: 1025 });
        return res.status(422).json(response);
      }
      const uniqueTransactionId = Str.random(9);
      const remainingCashWalletBalance =
        Number(fromCashWallet.purchase_wallet) - Number(totalRegAmount);

      const latestProductWallet =
        Number(toCashWallet.purchase_wallet) + Number(withdraw_amount);

      await fromCashWallet.update(
        {
          purchase_wallet: remainingCashWalletBalance,
        },
        {
          transaction: t,
        },
        prefix
      );
      await toCashWallet.update(
        {
          purchase_wallet: latestProductWallet,
        },
        {
          transaction: t,
        },
        prefix
      );

      const TransactionDetails = await Transactions.create(
        {
          transaction_id: uniqueTransactionId,
        },
        {
          transaction: t,
          prefix,
        }
      );

      const fund_transfer_details = await fundTransfer.create(
        {
          from_id: userId,
          to_id: subId,
          amount: withdraw_amount,
          amount_type: "self_transfer",
          trans_fee: 0,
          transaction_id: TransactionDetails.id,
          notes: transaction_note,
        },
        { transaction: t, prefix }
      );
      console.log("------------------>", uniqueTransactionId);

      const cash_wallet_history = await purchaseWalletHsty.create(
        {
          user_id: userId,
          from_user_id: subId,
          purchase_wallet: withdraw_amount,
          amount: withdraw_amount,
          balance: remainingCashWalletBalance,
          amount_type: "self_transfer",
          type: "credit",
          transaction_fee: 0,
          transaction_id: TransactionDetails.id,
        },
        { transaction: t, prefix }
      );
      const cash_wallet_history2 = await purchaseWalletHsty.create(
        {
          user_id: subId,
          from_user_id: userId,
          purchase_wallet: withdraw_amount,
          amount: withdraw_amount,
          balance: remainingCashWalletBalance,
          amount_type: "self_transfer",
          type: "debit",
          transaction_fee: 0,
          transaction_id: TransactionDetails.id,
        },
        { transaction: t, prefix }
      );
      console.log("--->", JSON.stringify(cash_wallet_history));
    }

    let data = {
      to_user: subaccount_username,
      trans_note: transaction_note,
      amount: withdraw_amount,
    };
    let dataArr = JSON.stringify(data);
    await common.insertUserActivity(
      "Fund Transfered",
      subId,
      "Fund Has Be Transfered",
      dataArr,
      t,
      ip,
      prefix
    );

    await t.commit();
    let response = await successMessage({ code: 200 });
    return res.json(response);

    // end
  } catch (error) {
    console.log(error);
    await t.rollback();
    let response = await errorMessage({ code: 1014 });
    return res.json(response);
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;
    const pendTransaction = await PendingTransaction.findOne({
      where: {
        status: "initiated",
        user_id: id,
      },
      prefix,
    });
    console.log("==============blockchain payment status==================");
    if (pendTransaction) {
      //check
      let response = await successMessage({
        message: "Transaction processing, please wait",
      });
      return res.status(200).json(response);
    }
    const lastPendTransaction = await PendingTransaction.findOne({
      where: {
        user_id: id,
      },
      order: [["id", "DESC"]],
      prefix,
    });
    let unapprovedId = await common.getUnapprovedIdOfUserId(id, prefix);
    const newPendingTransaction = await PendingTransaction.create(
      {
        user_id: id,
        unapproved_user_id: unapprovedId,
        wallet_address: lastPendTransaction.wallet_address,
        status: "initiated",
        date: Date.now(),
        transaction_id: null,
        previous_timestamp: lastPendTransaction.previous_timestamp,
        token: "usdt",
      },
      { prefix }
    );
    if (newPendingTransaction) {
      let response = await successMessage({
        message: "Operation successfully completed please wait...",
      });
      return res.status(200).json(response);
    }
    let response = await errorMessage({ code: 1030 });
    return res.status(422).json(response);
  } catch (error) {
    console.log(error);
    let response = await errorMessage({ code: 403 });
    return res.status(422).json(response);
  }
};

exports.blockchainRecieve = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    var id = req.user.id;
    const { wallet_address, balance } = await UserWalletBalance.findOne({
      where: { user_id: id },
      prefix,
    });
    const pending = await PendingTransaction.findOne({
      where: {
        status: "initiated",
        user_id: id,
      },
      prefix,
    });
    console.log("==Recieve Payment blockchain==");
    if (pending) {
      let response = await successMessage({
        message: "checking for transaction please wait...",
      });
      return res.status(200).json(response);
    }
    const lastPendTransaction = await PendingTransaction.findOne({
      where: {
        user_id: id,
      },
      order: [["id", "DESC"]],
      prefix,
    });
    let unapprovedId = await common.getUnapprovedIdOfUserId(id, prefix);

    const pendingTransaction = await PendingTransaction.create(
      {
        user_id: id,
        unapproved_user_id: unapprovedId,
        wallet_address: wallet_address,
        status: "initiated",
        date: Date.now(),
        transaction_id: null,
        previous_timestamp: lastPendTransaction?.previous_timestamp
          ? lastPendTransaction?.previous_timestamp
          : 0,
        token: "usdt",
      },
      { prefix }
    );

    if (pendingTransaction) {
      let response = await successMessage({
        message: "Operation successfully completed please wait...",
      });
      return res.status(200).json(response);
    }

    let response = await errorMessage({ code: 1030 });
    return res.status(422).json(response);
  } catch (err) {
    console.log(err);
    res.status(422).json(err.message);
  }
};

exports.blockchainAccount = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;

    const wallet = await UserWalletBalance.findOne({
      where: { user_id: id },
      prefix,
    });
    console.log("==blockchain Account==");
    if (!wallet) {
      let response = await errorMessage({ code: 1030 });
      return res.status(422).json(response);
    }
    let result = {
      address: wallet.wallet_address,
      balance: wallet.balance,
    };
    let response = await successMessage({ value: result });
    return res.json(response);
  } catch (error) {
    console.log(error);
    let response = await errorMessage({ code: 403 });
    return res.status(422).json(response);
  }
};
