const db = require("../../models");
const Configuration = db.configuration;
const modStatus = require("../../utils/app/moduleStatus");
const UserBalance = db.userBalance;
const PurchaseWalletHistory = db.purchaseWalletHistory;
const PinRequest = db.pinReq;

const getPurchaseIncomeConfig = (exports.getPurchaseIncomeConfig = async (
  prefix
) => {
  const moduleStatus = await modStatus.getModuleStatus(prefix);
  if (moduleStatus.purchase_wallet) {
    let { purchase_income_perc } = await Configuration.findOne({ prefix });
    return purchase_income_perc;
  } else {
    return 0;
  }
});

exports.getPurchaseWalletAmount = async (id, prefix) => {
  const { balance_amount } = await UserBalance.findOne({
    where: {
      user_id: id,
    },
    prefix,
  });
  return balance_amount;
};

// const updateLegamount = (exports.updateLegamount = async () => {});

// const updateEwallethistory = (exports.updateEwallethistory = async () => {});

// exports.updatePurchaseWallet = async (
//   userId,
//   fromId,
//   amount,
//   amountType,
//   legId,
//   type = "credit",
//   insertedId,
//   prefix,
//   t
// ) => {
//   try {
//     let percentage = await getPurchaseIncomeConfig(prefix);
//     let purchaseAmount = parseInt(amount * percentage) / 100;
//     if (purchaseAmount > 0) {
//       const userDetails = await UserBalance.findOne({
//         where: {
//           user_id: userId,
//         },
//         prefix,
//       });
//       let { purchase_wallet, balance_amount } = userDetails;
//       let newPurchaseWalletAmount = parseInt(purchase_wallet + purchaseAmount);
//       let newBalanceAmount = parseInt(balance_amount - purchaseAmount);
//       await userDetails.update(
//         {
//           balance_amount: newBalanceAmount,
//           purchase_wallet: newPurchaseWalletAmount,
//         },
//         { transaction: t },
//         prefix
//       );

//       await insertPurchasewalletHistory(
//         userId,
//         fromId,
//         amount,
//         purchaseAmount,
//         amountType,
//         type,
//         legId,
//         0,
//         prefix,
//         t
//       );

//       await updateLegamount(userId, amount, legId, prefix, t);

//       await updateEwallethistory(userId, amount, legId, prefix, t);
//     }
//   } catch (err) {
//     return false;
//   }
// };

const insertPurchasewalletHistory = (exports.insertPurchasewalletHistory =
  async (
    usedUserId,
    fromId,
    amount,
    purchaseAmount,
    amountType,
    type,
    ewalletId,
    transactionId = "0",
    tds = 0,
    prefix,
    t
  ) => {
    try {
      if (ewalletId == 0) {
        await PurchaseWalletHistory.create(
          {
            user_id: usedUserId,
            from_user_id: fromId,
            transaction_id: transactionId,
            amount,
            purchase_wallet: purchaseAmount,
            amount_type: amountType,
            type,
            date: new Date(),
            tds,
          },
          { transaction: t, prefix }
        );
      } else {
        await PurchaseWalletHistory.create(
          {
            user_id: usedUserId,
            from_user_id: fromId,
            ewallet_refid: ewalletId,
            transaction_id: transactionId,
            amount,
            purchase_wallet: purchaseAmount,
            amount_type: amountType,
            type,
            date: new Date(),
            tds,
          },
          { transaction: t, prefix }
        );
      }
      return true;
    } catch (error) {
      return false;
    }
  });

exports.deductFromPurchaseWallet = async (userId, amount, prefix, t) => {
  try {
    const Details = await UserBalance.findOne({
      where: {
        user_id: userId,
      },
      prefix,
    });
    let newBalance = Details.purchase_wallet - amount;
    let fixed = newBalance.toFixed(8);
    await Details.update(
      {
        purchase_wallet: fixed,
      },
      { transaction: t },
      prefix
    );
    return true;
  } catch (err) {
    return false;
  }
};

exports.deductFromWallet = async (userId, amount, prefix, t) => {
  try {
    const Details = await UserBalance.findOne({
      where: {
        user_id: userId,
      },
      prefix,
    });
    let newBalance = Details.balance_amount - amount;
    let fixed = newBalance.toFixed(8);
    await Details.update(
      {
        balance_amount: fixed,
      },
      { transaction: t },
      prefix
    );
    return true;
  } catch (err) {
    return false;
  }
};

exports.getUserPinRequestCount = async (
  userId,
  status = 0,
  readStatus = "",
  prefix
) => {
  let whereStatement = [];
  if (readStatus != "") {
    let condition1 = {
      read_status: readStatus,
    };
    whereStatement.push(condition1);
  }
  let allOtherCondition = {
    user_id: userId,
    status,
  };
  whereStatement.push(allOtherCondition);

  const result = await PinRequest.findAll({
    where: whereStatement,
    prefix,
  });
  return result.length;
};
