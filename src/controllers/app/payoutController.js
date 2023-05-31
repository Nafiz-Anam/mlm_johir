const modStatus = require("../../utils/app/moduleStatus");
const EwalletServices = require("../../utils/app/ewalletServices");
const db = require("../../models");
const { mlm_laravel } = require("../../models");
const bcrypt = require("bcryptjs");
const { errorMessage, successMessage } = require("../../utils/app/response");
const dc = require("../../utils/app/constants");
const moment = require("moment");
var _ = require("lodash");
const { Op, Sequelize } = require("sequelize");
const Config = db.payoutConfig;
const purchaseWalletHstry = db.purchaseWalletHistory;
const LegAmount = db.legAmt;
const configuration = db.configuration;
const TransPass = db.transPassword;
const balance = db.userBalance;
const Payout = db.payoutReleaseRequest;
const userDetails = db.userDetails;
const AmountPaid = db.amountPaid;
const User = db.user;
const ewalletHistory = db.ewalletHistory;
const common = require("../../utils/app/common");

// exports.payoutRequest = async (req, res) => {
//   try {
//     const prefix = req.headers["api-key"];
//     if (!prefix) {
//       let response = await errorMessage({ code: 1001 });
//       return res.json(response);
//     }
//     const userId = req.user.id;
//     let { payout_amount, transaction_password, withdraw } = req.body;
//     const moduleStatus = await modStatus.getModuleStatus(prefix);
//     const payoutConfig = await Config.findOne({
//       attributes: [
//         "min_payout",
//         "max_payout",
//         "fee_amount",
//         "request_validity",
//         "fee_mode",
//       ],
//       prefix,
//     });
//     const minPayoutAmount = payoutConfig.min_payout;
//     const maxPayoutAmount = payoutConfig.max_payout;
//     const payoutFeeAmount = payoutConfig.fee_amount;
//     const userBalance = await balance.findOne({
//       attributes: ["id", "balance_amount"],
//       where: {
//         user_id: userId,
//       },
//       prefix,
//     });

//     const userPayment = await userDetails.findOne({
//       attributes: ["payout_type"],
//       where: {
//         user_id: userId,
//       },
//       prefix,
//     });

//     const payoutMethod = userPayment.payout_type;
//     if (withdraw) {
//       const usertransPass = await TransPass.findOne({
//         attributes: ["password"],
//         where: {
//           user_id: userId,
//         },
//         prefix,
//       });
//       const passCheck = await bcrypt.compare(
//         transaction_password,
//         usertransPass.password
//       );
//       if (passCheck) {
//         if (moduleStatus.multi_currency_status) {
//           const default_currency = await common.getUserCurrencyId(
//             userId,
//             prefix
//           );
//           if (default_currency == null) {
//             let defaultCurrencyValue = await common.getDefaultPlanCurrencyValue(
//               prefix
//             );
//             payout_amount = (
//               parseFloat(payout_amount) / parseFloat(defaultCurrencyValue)
//             ).toFixed(8);
//           } else {
//             let currencyValue = await common.getUserCurrencyValue(
//               default_currency,
//               prefix
//             );
//             payout_amount = (
//               parseFloat(payout_amount) / parseFloat(currencyValue)
//             ).toFixed(8);
//           }
//         }
//         if (moduleStatus.kyc_status || !moduleStatus.kyc_status) {
//           const kycUpload = await userDetails.findOne({
//             attributes: ["kyc_status"],
//             where: {
//               user_id: userId,
//             },
//             prefix,
//           });
//           if (moduleStatus.kyc_status && !kycUpload.kyc_status) {
//             let response = await errorMessage({
//               code: 1019,
//             });
//             return res.status(422).json(response);
//           } else {
//             let deductAmount = Number(payout_amount) + Number(payoutFeeAmount);
//             const requestDate = Date("Y-m-d H:i:s");
//             let amounttoadd =
//               (Number(payout_amount) * Number(payoutFeeAmount)) / 100;
//             if (payoutConfig.fee_mode == "percentage") {
//               deductAmount = Number(payout_amount) + Number(amounttoadd);
//             }
//             if (
//               userBalance.balance_amount >= deductAmount &&
//               payout_amount >= minPayoutAmount &&
//               payout_amount <= maxPayoutAmount
//             ) {
//               let t = await mlm_laravel.transaction();
//               try {
//                 let payoutFee = payoutFeeAmount;
//                 if (payoutConfig.fee_mode == "percentage") {
//                   payoutFee = (payout_amount * payoutFeeAmount) / 100;
//                 }

//                 await Payout.create(
//                   {
//                     user_id: userId,
//                     amount: payout_amount,
//                     balance_amount: payout_amount,
//                     date: requestDate,
//                     payout_fee: payoutFee,
//                     status: "0",
//                     payment_method: payoutMethod,
//                   },
//                   {
//                     transaction: t,
//                     prefix,
//                   }
//                 );
//                 const remainingBalance =
//                   Number(userBalance.balance_amount) - Number(deductAmount);
//                 await userBalance.update(
//                   {
//                     balance_amount: remainingBalance,
//                   },
//                   {
//                     transaction: t,
//                   },
//                   prefix
//                 );
//                 await EwalletServices.addEwalletHistory(
//                   userId,
//                   null,
//                   Payout.id,
//                   "payout",
//                   deductAmount,
//                   remainingBalance,
//                   "payout_request",
//                   "debit",
//                   null,
//                   null,
//                   0,
//                   null,
//                   prefix,
//                   t
//                 );
//                 await t.commit();
//                 return res.json({
//                   status: true,
//                   data: { message: "Payout request sent successfully" },
//                 });
//               } catch (err) {
//                 await t.rollback();
//                 return res.status(422).send({
//                   message: `Error: ${err.message}`,
//                 });
//               }
//             } else if (deductAmount > userBalance.balance_amount) {
//               let response = await errorMessage({
//                 code: 1028,
//               });
//               return res.status(422).json(response);
//             } else {
//               let response = await errorMessage({
//                 code: 1027,
//               });
//               return res.status(422).json(response);
//             }
//           }
//         }
//         let response = await errorMessage({
//           code: 1019,
//         });
//         return res.status(422).json(response);
//       } else {
//         let response = await errorMessage({
//           code: 1015,
//         });
//         return res.status(422).json(response);
//       }
//     } else {
//       let response = await errorMessage({ code: 1031 });
//       return res.status(422).json(response);
//     }
//   } catch (err) {
//     console.log(err);
//     return res.json(err.message);
//   }
// };

exports.payoutRequest = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const userId = req.user.id;
    let { payout_amount, transaction_password, withdraw } = req.body;
    const moduleStatus = await modStatus.getModuleStatus(prefix);
    const payoutConfig = await Config.findOne({
      attributes: [
        "min_payout",
        "max_payout",
        "fee_amount",
        "request_validity",
        "fee_mode",
      ],
      prefix,
    });
    const minPayoutAmount = payoutConfig.min_payout;
    const maxPayoutAmount = payoutConfig.max_payout;
    const payoutFeeAmount = payoutConfig.fee_amount;
    const userBalance = await UserWalletBalance.findOne({
      attributes: ["id", "balance"],
      where: {
        user_id: userId,
      },
      prefix,
    });

    const userPayment = await userDetails.findOne({
      attributes: ["payout_type", "bitcoin_address"],
      where: {
        user_id: userId,
      },
      prefix,
    });

    if (!userPayment.bitcoin_address || userPayment.bitcoin_address == "") {
      let response = await errorMessage({ code: 1076 });
      return res.status(422).json(response);
    }
    let walletPayment = await PaymentConfig.findOne({
      where: {
        name: "Wallet",
      },
      prefix,
    });
    const payoutMethod = walletPayment.id;
    if (withdraw) {
      const usertransPass = await TransPass.findOne({
        attributes: ["password"],
        where: {
          user_id: userId,
        },
        prefix,
      });
      const passCheck = await bcrypt.compare(
        transaction_password,
        usertransPass.password
      );
      if (passCheck) {
        if (moduleStatus.multi_currency_status) {
          const default_currency = await common.getUserCurrencyId(
            userId,
            prefix
          );
          if (default_currency == null) {
            let defaultCurrencyValue = await common.getDefaultPlanCurrencyValue(
              prefix
            );
            payout_amount = (
              parseFloat(payout_amount) / parseFloat(defaultCurrencyValue)
            ).toFixed(8);
          } else {
            let currencyValue = await common.getUserCurrencyValue(
              default_currency,
              prefix
            );
            payout_amount = (
              parseFloat(payout_amount) / parseFloat(currencyValue)
            ).toFixed(8);
          }
        }
        if (moduleStatus.kyc_status || !moduleStatus.kyc_status) {
          const kycUpload = await userDetails.findOne({
            attributes: ["kyc_status"],
            where: {
              user_id: userId,
            },
            prefix,
          });
          if (moduleStatus.kyc_status && !kycUpload.kyc_status) {
            let response = await errorMessage({
              code: 1019,
            });
            return res.status(422).json(response);
          } else {
            let deductAmount = Number(payout_amount) + Number(payoutFeeAmount);
            const requestDate = Date("Y-m-d H:i:s");
            let amounttoadd =
              (Number(payout_amount) * Number(payoutFeeAmount)) / 100;
            if (payoutConfig.fee_mode == "percentage") {
              deductAmount = Number(payout_amount) + Number(amounttoadd);
            }

            if (
              userBalance.balance >= deductAmount &&
              payout_amount >= minPayoutAmount &&
              payout_amount <= maxPayoutAmount
            ) {
              let t = await mlm_laravel.transaction();
              try {
                //Payout from wallet api call
                let reqData = {
                  recipient: decrypt(userPayment.bitcoin_address),
                  amount: Number(payout_amount),
                };
                const isAddressValid = await axios.post(
                  `${process.env.blockchainWalletIp}/api/isvalid`,
                  { address: decrypt(userPayment.bitcoin_address) },
                  {
                    headers: {
                      "x-auth-token": `${process.env.blockChainAccessKey}`,
                    },
                  }
                );
                console.log(isAddressValid, isAddressValid.data.status);
                if (!isAddressValid.data.status) {
                  let response = await errorMessage({ code: 1078 });
                  return res.status(422).json(response);
                }
                const walletAddress = await axios.post(
                  `${process.env.blockchainWalletIp}/api/transfer`,
                  reqData,
                  {
                    headers: {
                      "x-auth-token": `${process.env.blockChainAccessKey}`,
                    },
                  }
                );
                console.log(
                  "=======================response from api ============ ",
                  walletAddress.data,
                  walletAddress.data.status,
                  walletAddress.status
                );
                const walletpayoutHst = await WalletPayoutHistory.create(
                  {
                    ref_id: 0,
                    amount: Number(payout_amount),
                    request_type: "by_user",
                    status: walletAddress.data.status,
                    address: userPayment.bitcoin_address,
                    date: new Date(),
                    response: JSON.stringify(walletAddress.data),
                  },
                  {
                    prefix,
                  }
                );

                if (walletAddress.data.status) {
                  let payoutFee = payoutFeeAmount;
                  if (payoutConfig.fee_mode == "percentage") {
                    payoutFee = (payout_amount * payoutFeeAmount) / 100;
                  }

                  const PayoutId = await Payout.create(
                    {
                      user_id: userId,
                      amount: payout_amount,
                      balance_amount: payout_amount,
                      date: requestDate,
                      payout_fee: payoutFee,
                      status: "1",
                      payment_method: payoutMethod,
                    },
                    {
                      transaction: t,
                      prefix,
                    }
                  );
                  const walletpayoutHst2 = await walletpayoutHst.update(
                    {
                      ref_id: PayoutId.id,
                    },
                    { transaction: t },
                    prefix
                  );
                  const remainingBalance =
                    Number(userBalance.balance) - Number(deductAmount);
                  await userBalance.update(
                    {
                      balance: remainingBalance,
                    },
                    {
                      transaction: t,
                    },
                    prefix
                  );
                  // await EwalletServices.addEwalletHistory(
                  //   userId,
                  //   null,
                  //   Payout.id,
                  //   "payout",
                  //   deductAmount,
                  //   remainingBalance,
                  //   "payout_request",
                  //   "debit",
                  //   null,
                  //   null,
                  //   0,
                  //   null,
                  //   prefix,
                  //   t
                  // );
                  const debitHistory = await WalletHistories.create(
                    {
                      user_id: userId,
                      from_id: userId,
                      reference_id: PayoutId.id,
                      amount: Number(deductAmount),
                      balance: remainingBalance,
                      amount_type: "payout_request",
                      type: "debit",
                      transaction_id: walletAddress.data.transaction_id,
                      wallet_address: walletAddress.data.address,
                      transaction_fee: payoutFee,
                      date_added: new Date(),
                    },
                    {
                      transaction: t,
                      prefix,
                    }
                  );

                  const amtPaid = await AmountPaid.create(
                    {
                      user_id: userId,
                      amount: payout_amount,
                      date: new Date(),
                      transaction_id: walletAddress.data.transaction_id,
                      type: "released",
                      status: 1,
                      payment_method: walletPayment.id,
                      payout_fee: payoutFee,
                      request_id: PayoutId.id,
                    },
                    {
                      transaction: t,
                      prefix,
                    }
                  );
                  await t.commit();
                  return res.json({
                    status: true,
                    data: { message: "Payout request sent successfully" },
                  });
                } else {
                  console.log(
                    "=====================response from api call ==============",
                    walletAddress
                  );
                  let response = await errorMessage({ code: 1077 });
                  response.error.description =
                    response.error.description + walletAddress.message;
                }
              } catch (err) {
                console.log(err);
                await t.rollback();
                return res.status(422).send({
                  message: `Error: ${err.message}`,
                });
              }
            } else if (deductAmount > userBalance.balance) {
              let response = await errorMessage({
                code: 1028,
              });
              return res.status(422).json(response);
            } else {
              let response = await errorMessage({
                code: 1027,
              });
              return res.status(422).json(response);
            }
          }
        }
        let response = await errorMessage({
          code: 1019,
        });
        return res.status(422).json(response);
      } else {
        let response = await errorMessage({
          code: 1015,
        });
        return res.status(422).json(response);
      }
    } else {
      let response = await errorMessage({ code: 1031 });
      return res.status(422).json(response);
    }
  } catch (err) {
    console.log(err);
    return res.json(err.message);
  }
};

exports.payoutRequestGet = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const userId = req.user.id;
    const payoutConfig = await Config.findOne({
      attributes: [
        "min_payout",
        "max_payout",
        "fee_amount",
        "request_validity",
        "fee_mode",
      ],
      prefix,
    });

    // res.json(payoutConfig)
    const minPayoutAmount = payoutConfig.min_payout;
    const maxPayoutAmount = payoutConfig.max_payout;
    var payoutFeeAmount = payoutConfig.fee_amount;
    const userBalance = await balance.findOne({
      attributes: ["id", "balance_amount"],
      where: {
        user_id: userId,
      },
      prefix,
    });

    const defaultCurrencyCode = await common.getDefaultCurrencyCode(prefix);
    const defaultCurrencyIcon = await common.getDefaultCurrencyIcon(prefix);
    const payoutReleaseAmount = await Payout.findAll({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("balance_amount")), "amount"],
      ],
      where: {
        user_id: userId,
        status: "pending",
      },
      raw: true,
      prefix,
    });
    const userPayment = await userDetails.findOne({
      attributes: ["payout_type"],
      where: {
        user_id: userId,
      },
      prefix,
    });
    const payoutMethod = userPayment.payout_type;
    const paymentMethodName = await common.getPaymentMethodName(
      payoutMethod,
      prefix
    );
    let avaliableMaxPayout;
    const totalAmt = await AmountPaid.findOne({
      attributes: ["amount"],
      where: {
        type: "released",
        user_id: userId ? userId : "",
      },
      prefix,
    });
    let possiblePayoutAmt = userBalance.balance_amount - payoutFeeAmount;
    if (possiblePayoutAmt <= 0) {
      possiblePayoutAmt = 0;
    }
    if (payoutConfig.fee_mode == "percentage") {
      possiblePayoutAmt =
        (userBalance.balance_amount * 100) / (100 + payoutFeeAmount).toFixed(2);
    }
    if (possiblePayoutAmt <= maxPayoutAmount) {
      avaliableMaxPayout = possiblePayoutAmt;
    } else {
      avaliableMaxPayout = maxPayoutAmount;
    }
    if (payoutConfig.fee_mode == "percentage") {
      payoutFeeAmount = `${payoutFeeAmount}`;
    }
    let amount = {
      balance: userBalance.balance_amount,
      payout_fee: payoutFeeAmount,
      fee: payoutFeeAmount,
      type: payoutConfig.fee_mode,
      available_max_payout: avaliableMaxPayout,
      defaultCurrencyCode,
    };

    let newAvailableMaxAmount;

    if (payoutConfig.fee_mode == "percentage") {
      const amountToWIthdraw = (
        (Number(userBalance.balance_amount) * Number(payoutFeeAmount)) /
        100
      ).toFixed(2);

      newAvailableMaxAmount =
        Number(userBalance.balance_amount) - Number(amountToWIthdraw);
      console.log(newAvailableMaxAmount);
      var payout = `${payoutFeeAmount} % of Withdrawal Amount`;
    } else {
      console.log(
        ` user balance ${userBalance.balance_amount}  amount to withdraw${payoutFeeAmount}`
      );
      newAvailableMaxAmount =
        Number(userBalance.balance_amount) - Number(payoutFeeAmount);
      if (newAvailableMaxAmount < 0) {
        newAvailableMaxAmount = 0;
      }
      var payout = payoutFeeAmount;
    }

    let particulars = [
      {
        key: "Default Currency",
        amount: `${defaultCurrencyCode} (${defaultCurrencyIcon})`,
      },
      {
        key: "Ewallet Balance",
        amount: userBalance.balance_amount,
      },
      {
        key: "Ewallet Amount Already In Payout Process",
        amount: payoutReleaseAmount[0].amount,
      },
      {
        key: "Total Paid Amount",
        amount: totalAmt?.amount ? totalAmt?.amount : 0,
      },
      {
        key: "Preferred Payout Method",
        amount: paymentMethodName,
      },
      {
        key: "Minimum Withdrawal Amount",
        amount: minPayoutAmount,
      },
      {
        key: "Maximum Withdrawal Amount",
        amount: maxPayoutAmount,
      },
      {
        key: "Available Maximum Withdrawal Amount",
        amount: Number(newAvailableMaxAmount.toFixed(2)),
      },
      {
        key: "Payout Request Validity Days",
        amount: `${payoutConfig.request_validity} Days`,
      },
      {
        key: "Payout Fee",
        amount: payout,
      },
    ];

    let data = {
      amount: amount,
      particulars: particulars,
    };
    let response = await successMessage({
      value: data,
    });
    return res.json(response);
  } catch (err) {
    return res.json(err.message);
  }
};

exports.getPendingList = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    let userId = req.user.id;
    let [tableData, whereStatement] = [[], []];
    var { length, start, order, direction } = req.query;
    let filters = {
      order: order ? order : "updated_at",
      limit: length ? parseInt(length) : 10,
      start: start ? parseInt(start) : 0,
      direction: _.includes(["ASC", "DESC"]) ? direction : "ASC",
    };
    if (userId) {
      let condition1 = {
        user_id: userId,
      };
      whereStatement.push(condition1);
    }
    let condition2 = {
      status: 0,
    };
    whereStatement.push(condition2);
    const userBalance = await balance.findOne({
      attributes: ["balance_amount"],
      where: {
        user_id: userId,
      },
      prefix,
    });
    const pendingRequests = await Payout.findAll({
      attributes: [
        "id",
        "user_id",
        "balance_amount",
        "payment_method",
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: User,
          attributes: ["username", "delete_status"],
          where: {
            active: 1,
          },
        },
      ],
      where: whereStatement,
      order: [[filters.order, filters.direction]],
      offset: filters.start,
      limit: filters.limit,
      prefix,
    });

    const pendingRequestsCount = await Payout.findAll({
      attributes: [
        "id",
        "user_id",
        "balance_amount",
        "payment_method",
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: User,
          attributes: ["username", "delete_status"],
          where: {
            active: 1,
          },
        },
      ],
      where: whereStatement,
      prefix,
    });
    const count = pendingRequestsCount.length;
    Object.entries(pendingRequests).map(([key, value]) => {
      tableData[key] = {
        request_id: value.id,
        payout_amount: value.balance_amount,
        ewallet_balance: userBalance.balance_amount,
        requested_date: moment(value.created_at).format(
          "MMMM Do YYYY, h:mm:ss a"
        ),
      };
    });

    let data = {
      count: count,
      table_data: tableData,
    };
    let response = await successMessage({
      value: data,
    });
    return res.json(response);
  } catch (error) {}
};

exports.getRejectedList = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    let userId = req.user.id;
    let [tableData, whereStatement] = [[], []];
    var { length, start, order, direction } = req.query;
    let filters = {
      order: order ? order : "updated_at",
      limit: length ? parseInt(length) : 10,
      start: start ? parseInt(start) : 0,
      direction: _.includes(["ASC", "DESC"]) ? direction : "ASC",
    };
    if (userId) {
      let condition1 = {
        user_id: userId,
      };
      whereStatement.push(condition1);
    }
    let condition2 = {
      status: 2,
    };
    whereStatement.push(condition2);
    const rejectedRequests = await Payout.findAll({
      attributes: [
        "id",
        "user_id",
        "balance_amount",
        "payment_method",
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: User,
          attributes: ["username", "delete_status"],
          where: {
            active: 1,
          },
        },
      ],
      where: whereStatement,
      order: [[filters.order, filters.direction]],
      offset: filters.start,
      limit: filters.length,
      prefix,
    });
    const rejectedRequestsCount = await Payout.findAll({
      attributes: [
        "id",
        "user_id",
        "balance_amount",
        "payment_method",
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: User,
          attributes: ["username", "delete_status"],
          where: {
            active: 1,
          },
        },
      ],
      where: whereStatement,
      order: [[filters.order, filters.direction]],
      prefix,
    });
    const count = rejectedRequestsCount.length;
    Object.entries(rejectedRequests).map(([key, value]) => {
      tableData[key] = {
        amount: value.balance_amount,
        requested_date: moment(value.created_at).format(
          "MMMM Do YYYY, h:mm:ss a"
        ),
        rejected_date: moment(value.updated_at).format(
          "MMMM Do YYYY, h:mm:ss a"
        ),
      };
    });
    let data = {
      count: count,
      table_data: tableData,
    };
    let response = await successMessage({
      value: data,
    });
    return res.json(response);
  } catch (err) {
    return res.json(err.message);
  }
};

exports.getApprovedPaidList = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    let userId = req.user.id;
    let paidStatus = "approved_paid";
    let tableData = [];
    var { length, start, order, direction } = req.query;
    let filters = {
      order: order ? order : "updated_at",
      limit: length ? parseInt(length) : 10,
      start: start ? parseInt(start) : 0,
      direction: _.includes(["ASC", "DESC"]) ? direction : "ASC",
    };
    const paidRequest = await getReleasedWithdrawDetails(
      userId,
      paidStatus,
      filters,
      prefix
    );

    const paidTotalResult = await getReleasedWithdrawDetailsCount(
      userId,
      paidStatus,
      prefix
    );

    const count = paidTotalResult.length;
    for await (let [key, value] of Object.entries(paidRequest)) {
      let paymentmethod = await common.getPaymentMethodName(
        value.payment_method,
        prefix
      );
      tableData[key] = {
        amount: value.amount,
        paid_date: moment(value.created_at).format("MMMM Do YYYY, h:mm:ss a"),
        payout_method: await changePaymentMethod(paymentmethod),
      };
    }
    let data = {
      count: count,
      table_data: tableData,
    };
    let response = await successMessage({
      value: data,
    });
    return res.json(response);
  } catch (err) {
    return res.json(err.message);
  }
};

exports.getApprovedPendingList = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    let userId = req.user.id;
    let paidStatus = "approved_pending";
    let tableData = [];
    var { length, start, order, direction } = req.query;
    let filters = {
      order: order ? order : "updated_at",
      limit: length ? parseInt(length) : 10,
      start: start ? parseInt(start) : 0,
      direction: _.includes(["ASC", "DESC"]) ? direction : "ASC",
    };
    const waitingRequest = await getReleasedWithdrawDetails(
      userId,
      paidStatus,
      filters,
      prefix
    );
    const waitingRequestCount = await getReleasedWithdrawDetailsCount(
      userId,
      paidStatus,
      prefix
    );
    const count = waitingRequestCount.length;
    Object.entries(waitingRequest).map(([key, value]) => {
      tableData[key] = {
        amount: value.amount,
        payout_method: "Bank Transfer",
        approved_date: moment(value.created_at).format(
          "MMMM Do YYYY h:mm:ss a"
        ),
      };
    });
    let data = {
      count: count,
      table_data: tableData,
    };
    let response = await successMessage({
      value: data,
    });
    return res.json(response);
  } catch (err) {
    return res.json(err.message);
  }
};

exports.getPayoutTiles = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    let status = 0;
    let data, pendingAmount, approvedAmount, paidAmount, rejectedAmount;
    const userId = req.user.id;
    const payoutConfig = await Config.findOne({
      attributes: ["release_type"],
      prefix,
    });
    const pendingAmountResult = await getTotalAmountPendingRequest(
      userId,
      status,
      prefix
    );
    if (pendingAmountResult == null) {
      pendingAmount = 0;
    } else {
      pendingAmount = pendingAmountResult;
    }
    const approvedAmountResult = await getTotalAmountApproved(userId, prefix);
    if (approvedAmountResult == null) {
      approvedAmount = 0;
    } else {
      approvedAmount = approvedAmountResult;
    }
    const paidAmountResult = await getTotalAmountPaid(userId, prefix);
    if (paidAmountResult == null) {
      paidAmount = 0;
    } else {
      paidAmount = paidAmountResult;
    }
    const rejectedAmountResult = await getTotalAmountRejected(userId, prefix);
    if (rejectedAmountResult == null) {
      rejectedAmount = 0;
    } else {
      rejectedAmount = rejectedAmountResult;
    }

    let payoutTile = [
      {
        text: "pending",
        amount: pendingAmount,
        amountWithCurrency: `${dc.defaultCurrencySymbol}${pendingAmount}`,
        icon: `${process.env.SITE_URL}/uploads/newui/pending.png`,
        bg_color: "#ffe690",
      },
      {
        text: "approved",
        amount: approvedAmount,
        amountWithCurrency: `${dc.defaultCurrencySymbol}${approvedAmount}`,
        icon: `${process.env.SITE_URL}/uploads/newui/Approved.png`,
        bg_color: "#44badc",
      },
      {
        text: "paid",
        amount: paidAmount,
        amountWithCurrency: `${dc.defaultCurrencySymbol}${paidAmount}`,
        icon: `${process.env.SITE_URL}/uploads/newui/paid.png`,
        bg_color: "#5bc554",
      },
      {
        text: "rejected",
        amount: rejectedAmount,
        amountWithCurrency: `${dc.defaultCurrencySymbol}${rejectedAmount}`,
        icon: `${process.env.SITE_URL}/uploads/newui/Rejected.png`,
        bg_color: "#e92222cc",
      },
    ];
    data = {
      payout_tile: payoutTile,
    };
    if (payoutConfig.release_type == "from_ewallet") {
      data["button_show"] = false;
    } else {
      let currentDate = new Date().getDay();
      //CHANGE TO 1 AFTER TESTING
      data["button_show"] = currentDate == 1 ? true : false;
    }
    let response = await successMessage({
      value: data,
    });
    return res.json(response);
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

exports.payoutRequestCancellation = async (req, res) => {
  let data = [];
  try {
    const prefix = req.headers["api-key"];
    var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const payoutArr = req.body;
    // return res.status(200).json(payoutArr)
    for await (let [key, value] of Object.entries(payoutArr)) {
      let t = await mlm_laravel.transaction();
      var userId = await Payout.findOne({
        attributes: ["user_id"],
        where: {
          id: value,
        },
        prefix,
      });
      if (!userId) {
        let response = errorMessage({
          code: 1070,
        });
        return res.json(response);
      }
      let result = await deletePayoutRequest(
        value,
        userId.user_id,
        "payout",
        "credit",
        t,
        prefix
      );
      if (result) {
        await common.insertUserActivity(
          "request deleted",
          userId.user_id,
          "payout request deleted",
          "",
          t,
          ip,
          prefix
        );
        await t.commit();
      }
    }
    let response = await successMessage({
      message: "Withdrawal canceled sucessfully",
    });
    return res.json(response);
  } catch (err) {
    console.log(err.message);
    return res.json(err.message);
  }
};

async function deletePayoutRequest(
  value,
  userId,
  ewalletType,
  type,
  t,
  prefix
) {
  const moduleStatus = await modStatus.getModuleStatus(prefix);
  try {
    const userPayout = await Payout.findOne({
      where: {
        id: value,
      },
      prefix,
    });
    await userPayout.update(
      {
        status: 2,
      },
      {
        transaction: t,
      },
      prefix
    );
    const refundAmount = await getPayoutRefundAmount(value, userId, prefix);

    let TotalBalance = refundAmount + UserBalance.balance_amount;

    let referenceId = value;

    let history = await EwalletServices.addEwalletHistory(
      userId,
      null,
      referenceId,
      "payout",
      refundAmount,
      TotalBalance,
      "payout_delete",
      "credit",
      null,
      null,
      0,
      null,
      prefix,
      t
    );
    if (refundAmount && history) {
      var UserBalance = await balance.findOne({
        attributes: ["id", "balance_amount"],
        where: {
          user_id: userId,
        },
        prefix,
      });
      let addTotalAmount = refundAmount + UserBalance.balance_amount;
      await UserBalance.update(
        {
          balance_amount: addTotalAmount,
        },
        {
          transaction: t,
        },
        prefix
      );
    }
    return true;
  } catch (err) {
    await t.rollback();
    console.log(err.message);
  }
}

async function getPayoutRefundAmount(id, userId, prefix) {
  const refund = await Payout.findOne({
    attributes: ["balance_amount", "payout_fee"],
    where: {
      id: id,
      user_id: userId,
    },
    prefix,
  });
  const refundAmt = refund.balance_amount + refund.payout_fee;
  return refundAmt;
}

async function getReleasedWithdrawDetails(userId, paidStatus, filters, prefix) {
  let whereStatement = [];
  if (userId) {
    let condition1 = {
      user_id: userId,
    };
    whereStatement.push(condition1);
  }
  if (paidStatus == "approved_paid") {
    let condition2 = {
      status: 1,
      payment_method: 4,
    };
    whereStatement.push(condition2);
  }
  if (paidStatus == "approved_pending") {
    let condition3 = {
      status: 0,
      payment_method: 4,
    };
    whereStatement.push(condition3);
  }
  let condition4 = {
    type: "released",
  };
  whereStatement.push(condition4);
  const paidRequest = await AmountPaid.findAll({
    attributes: ["id", "amount", "payment_method", "created_at"],
    include: [
      {
        model: User,
        attributes: ["username", "delete_status"],
      },
    ],
    where: whereStatement,
    order: [[filters.order, filters.direction]],
    offset: filters.start,
    limit: filters.limit,
    prefix,
  });
  return paidRequest;
}

async function getReleasedWithdrawDetailsCount(userId, paidStatus, prefix) {
  let whereStatement = [];
  if (userId) {
    let condition1 = {
      user_id: userId,
    };
    whereStatement.push(condition1);
  }
  if (paidStatus == "approved_paid") {
    let condition2 = {
      status: 1,
    };
    whereStatement.push(condition2);
  }
  if (paidStatus == "approved_pending") {
    let condition3 = {
      status: 1,
      payment_method: 4,
    };
    whereStatement.push(condition3);
  }
  let condition4 = {
    type: "released",
  };
  whereStatement.push(condition4);
  const paidRequest = await AmountPaid.findAll({
    attributes: ["id", "amount", "payment_method", "created_at"],
    include: [
      {
        model: User,
        attributes: ["username", "delete_status"],
      },
    ],
    where: whereStatement,
    prefix,
  });
  return paidRequest;
}

async function getTotalAmountPendingRequest(userId, status, prefix) {
  let whereStatement = [];
  if (userId) {
    let condition1 = {
      user_id: userId,
    };
    whereStatement.push(condition1);
  }
  let condition2 = {
    status: status,
  };
  whereStatement.push(condition2);
  const pendingAmt = await Payout.findAll({
    attributes: [[Sequelize.fn("SUM", Sequelize.col("balance_amount")), "sum"]],
    where: whereStatement,
    raw: true,
    prefix,
  });
  return pendingAmt[0].sum;
}

async function getTotalAmountApproved(userId, prefix) {
  let whereStatement = [];
  if (userId) {
    let condition1 = {
      user_id: userId,
    };
    whereStatement.push(condition1);
  }
  let condition2 = {
    type: "released",
    status: 0,
    payment_method: 4,
  };
  whereStatement.push(condition2);
  const approvedAmt = await AmountPaid.findAll({
    attributes: [[Sequelize.fn("SUM", Sequelize.col("amount")), "sum"]],
    where: whereStatement,
    raw: true,
    prefix,
  });
  return approvedAmt[0].sum;
}

async function getTotalAmountPaid(userId, prefix) {
  let whereStatement = [];
  if (userId) {
    let condition1 = {
      user_id: userId,
    };
    whereStatement.push(condition1);
  }
  let condition2 = {
    type: "released",
    status: 1,
  };
  whereStatement.push(condition2);

  const paidAmt = await AmountPaid.findAll({
    attributes: [[Sequelize.fn("SUM", Sequelize.col("amount")), "sum"]],
    where: whereStatement,
    raw: true,
    prefix,
  });

  return paidAmt[0].sum;
}

async function getTotalAmountRejected(userId, prefix) {
  let whereStatement = [];
  if (userId) {
    let condition1 = {
      user_id: userId,
    };
    whereStatement.push(condition1);
  }
  let condition2 = {
    status: 2,
  };
  whereStatement.push(condition2);
  const rejectedAmt = await Payout.findAll({
    attributes: [[Sequelize.fn("SUM", Sequelize.col("balance_amount")), "sum"]],
    where: whereStatement,
    raw: true,
    prefix,
  });

  return rejectedAmt[0].sum;
}

const changePaymentMethod = async (data) => {
  console.log(data);
  let code;

  switch (data) {
    case "Paypal":
      code = "paypal";
      break;
    case "Authorize.Net":
      code = "authorize";
      break;
    case "Bitcoin":
      code = "bitcoin";
      break;
    case "Blockchain":
      code = "blockchain";
      break;
    case "Bitgo":
      code = "bitgo";
      break;
    case "Payeer":
      code = "payeer";
      break;
    case "Sofort":
      code = "sofort";
      break;
    case "SquareUp":
      code = "squareup";
      break;
    case "E-pin":
      code = "epin";
      break;
    case "E-wallet":
      code = "ewallet";
      break;
    case "Bank Transfer":
      code = "banktransfer";
      break;
    case "Free Joining":
      code = "freejoin";
      break;
    case "Stripe":
      code = "stripe";
      break;
    default:
      break;
  }
  return code;
};
