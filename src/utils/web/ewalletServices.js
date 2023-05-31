const db = require("../../models");
const axios = require("axios");
const JSEncrypt = require("node-jsencrypt");
const FormData = require("form-data");
import fs from "fs";
import { join } from "path";
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const transPass = db.transPassword;
const UserBalance = db.userBalance;
const modStatus = require("./moduleStatus");
const RepurchaseServices = require("./repurchaseServices");
const Common = require("./common");
const CartServices = require("./cartServices");
const Str = require("@supercharge/strings");
const Transactions = db.transactions;
const EwalletPaymentDetails = db.ewalletPaymentDetails;
const EwalletHistory = db.ewalletHistory;
const PayoutReleaseRequest = db.payoutReleaseRequest;
const UserWalletBalance = db.userWalletBalance;
const WalletHistories = db.walletHistories;

const checkEwalletPassword = (exports.checkEwalletPassword = async (
  userId,
  password,
  prefix
) => {
  const passwordDetails = await transPass.findOne({
    where: {
      user_id: userId,
    },
    prefix,
  });

  // password verification
  const validPassword = await bcrypt.compare(
    password,
    passwordDetails.password
  );
  return validPassword;
});

const getBalanceAmount = (exports.getBalanceAmount = async (userId, prefix) => {
  let { balance_amount } = await UserBalance.findOne({
    where: {
      user_id: userId,
    },
    prefix,
  });
  return balance_amount;
});

const getTotalPaymentAmount = (exports.getTotalPaymentAmount = async (
  type,
  productId = "",
  prefix,
  userId
) => {
  let totalAmount = 0;
  const moduleStatus = await modStatus.getModuleStatus(prefix);
  var productAmount = 0,
    productDetails;
  switch (type) {
    case "registration":
      let registerAmount = await Common.getRegisterAmount(prefix);
      if (moduleStatus.product_status) {
        if (productId == "") {
          return false;
        }
        productDetails = await Common.getProduct(productId, prefix);
        productAmount = productDetails.price;
      }
      totalAmount = registerAmount + productAmount;
      break;
    case "subscription_renewal":
      productDetails = await Common.getProduct(productId, prefix);
      totalAmount = productDetails.price ? productDetails.price : 0;
      break;
    case "repurchase":
      totalAmount = await CartServices.totalAmount(userId, prefix);
      break;
    case "package_upgrade":
      let packageId = await Common.getProductPackageId(
        productId,
        "registration",
        prefix
      );
      let currentPackageId = await Common.getProductId(userId, prefix);
      let currentPackageAmount = await Common.getCartProduct(
        currentPackageId,
        prefix
      );
      let packageAmount = await Common.getCartProduct(packageId, prefix);
      totalAmount = packageAmount;
      // - currentPackageAmount;
      break;
    default:
      return false;
  }
  return totalAmount;
});

exports.validatePayment = async (
  userName,
  transactionPassword,
  productId,
  type,
  loginUserId,
  prefix
) => {
  let userId = await Common.usernameToId(userName, prefix),
    totalAmount;
  let validatePass = await checkEwalletPassword(
    userId,
    transactionPassword,
    prefix
  );
  if (!validatePass) {
    return "passwordError";
  }
  let userBalanceAmount = await getBalanceAmountWallet(userId, prefix);
  if (userBalanceAmount <= 0) return "insufficientEwalletBalance";

  switch (type) {
    case "subscription_renewal":
      totalAmount = await getTotalPaymentAmount(
        type,
        productId,
        prefix,
        userId
      );
      break;
    case "package_upgrade":
      let packageId = await Common.getProductPackageId(
        productId,
        "registration",
        prefix
      );
      let currentPackageId = await Common.getProductId(loginUserId, prefix);
      let currentPackageAmount = await Common.getCartProduct(
        currentPackageId,
        prefix
      );
      let newPackageAmount = await Common.getCartProduct(packageId, prefix);
      totalAmount = parseInt(newPackageAmount);
      //  - parseInt(currentPackageAmount);
      break;
    default:
      return "invalidTransactionDetails";
  }

  if (userBalanceAmount >= totalAmount) {
    return true;
  } else {
    return "insufficientEwalletBalance";
  }
};

const ewalletPayment = (exports.ewalletPayment = async (
  ewalletUserId,
  usedUserId,
  totalAmount,
  paymentType,
  prefix,
  t
) => {
  try {
    const transactionId = Str.random(12);
    const transactionid = await Transactions.create(
      {
        transaction_id: transactionId,
      },
      {
        transaction: t,
        prefix,
      }
    );
    const addEwalletPaymentDetails = await EwalletPaymentDetails.create(
      {
        user_id: ewalletUserId,
        used_user: usedUserId,
        amount: totalAmount,
        used_for: paymentType,
        transaction_id: transactionid.id,
      },
      {
        transaction: t,
        prefix,
      }
    );

    // let userBalanceDetails = await UserBalance.findOne({
    //   where: {
    //     user_id: ewalletUserId,
    //   },
    //   prefix,
    // });

    let userBalanceDetails = await UserWalletBalance.findOne({
      where: {
        user_id: ewalletUserId,
      },
      prefix,
    });
    let { balance } = userBalanceDetails;
    let newBalanceAmount = parseFloat(Number(balance) - Number(totalAmount));
    let roundedBalance = newBalanceAmount.toFixed(8);
    // const addHistory = await addEwalletHistory(
    //   ewalletUserId,
    //   usedUserId,
    //   addEwalletPaymentDetails.id,
    //   "ewallet_payment",
    //   totalAmount,
    //   roundedBalance,
    //   paymentType,
    //   "debit",
    //   transactionid.id,
    //   "",
    //   0,
    //   "",
    //   prefix,
    //   t
    // );
    const creditHistory = await WalletHistories.create(
      {
        user_id: ewalletUserId,
        from_id: usedUserId,
        reference_id: transactionid.id,
        amount: Number(totalAmount),
        balance: roundedBalance,
        amount_type: `ewallet_payment_${paymentType}`,
        type: "debit",
        transaction_id: addEwalletPaymentDetails.id,
        wallet_address: null,
        transaction_fee: 0,
        date_added: new Date(),
      },
      {
        transaction: t,
        prefix,
      }
    );

    if (creditHistory == false) {
      return false;
    }

    //TODO Deduct user balance
    const deductBalance = await deductUserBalanceAmountWallet(
      ewalletUserId,
      totalAmount,
      prefix,
      t
    );

    if (deductBalance == false) {
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
});

const addEwalletHistory = (exports.addEwalletHistory = async (
  ewalletUserId,
  fromUserId,
  ewalletId,
  ewalletType,
  usedAmount,
  balance,
  amountType,
  type,
  transactionid,
  transactionNote = "",
  transactionFee,
  pendingId = false,
  prefix,
  t
) => {
  try {
    const moduleStatus = await modStatus.getModuleStatus(prefix);
    let pendingId;
    if (!pendingId) {
      pendingId = "NULL";
    }

    let history = await EwalletHistory.create(
      {
        user_id: ewalletUserId,
        from_id: fromUserId,
        ewallet_type: ewalletType,
        amount: usedAmount,
        amount_type: amountType,
        type,
        reference_id: ewalletId,
        balance: balance,
        // pending_id: pendingId,
        transaction_id: transactionid,
        transaction_note: transactionNote,
        transaction_fee: transactionFee,
        date_added: new Date(),
        purchase_wallet: 0.0,
      },
      { transaction: t, prefix }
    );
    if (moduleStatus.MLM_PLAN == "Donation" && type == "credit") {
      let keyPath = join(__dirname, "../public_key.pem");
      let data = {
        sponsor_id: ewalletUserId,
      };
      let insertData = JSON.stringify(data);
      let secretKey = JSON.stringify(process.env.commission_prefix);
      const publicKey = fs.readFileSync(keyPath, "utf-8");
      const jsEncrypt = new JSEncrypt();
      jsEncrypt.setPublicKey(publicKey);
      var encryptData = jsEncrypt.encrypt(insertData);
      var encryptKey = jsEncrypt.encrypt(secretKey);
      let form = new FormData();
      form.append("enc_data", encryptData);
      var checkDonation = await axios.post(
        `${process.env.commission_url}calculateDonationManual`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            prefix: prefix,
            SECRET_KEY: encryptKey,
          },
        }
      );
    }
    return true;
  } catch (err) {
    return false;
  }
});

exports.runPayment = async (
  ewalletUser,
  transPass,
  productId,
  type,
  paymentType,
  prefix,
  t
) => {
  try {
    const userId = await Common.usernameToId(ewalletUser, prefix);
    const totalAmount = await getTotalPaymentAmount(
      type,
      productId,
      prefix,
      userId
    );
    console.log(`totalAmount ${totalAmount}`);
    let payment = await ewalletPayment(
      userId,
      userId,
      totalAmount,
      paymentType,
      prefix,
      t
    );
    return payment;
  } catch (err) {
    return false;
  }
};
const getBalanceAmountWallet = (exports.getBalanceAmountWallet = async (
  userId,
  prefix
) => {
  try {
    let { balance } = await UserWalletBalance.findOne({
      where: {
        user_id: userId,
      },
      prefix,
    });
    return balance ? balance : false;
  } catch (error) {
    console.log(error);
    return false;
  }
});

const deductUserBalanceAmountWallet = (exports.deductUserBalanceAmountWallet =
  async (ewalletUserId, usedAmount, prefix, t) => {
    try {
      var userBalanceDetails = await UserWalletBalance.findOne({
        where: {
          user_id: ewalletUserId,
        },
        prefix,
      });

      let { balance } = userBalanceDetails;
      let newBalanceAmount = parseFloat(Number(balance) - Number(usedAmount));
      let roundedBalance = newBalanceAmount.toFixed(8);
      await userBalanceDetails.update(
        {
          balance: roundedBalance,
        },
        { transaction: t },
        prefix
      );
      return true;
    } catch (Err) {
      return false;
    }
  });

const deductUserBalanceAmount = (exports.deductUserBalanceAmount = async (
  ewalletUserId,
  usedAmount,
  prefix,
  t
) => {
  try {
    var userBalanceDetails = await UserBalance.findOne({
      where: {
        user_id: ewalletUserId,
      },
      prefix,
    });

    let { balance_amount } = userBalanceDetails;
    let newBalanceAmount = parseFloat(
      Number(balance_amount) - Number(usedAmount)
    );
    let roundedBalance = newBalanceAmount.toFixed(8);
    await userBalanceDetails.update(
      {
        balance_amount: roundedBalance,
      },
      { transaction: t },
      prefix
    );
    return true;
  } catch (Err) {
    return false;
  }
});

exports.userPayoutRequestCount = async (
  userId,
  status = 1,
  date = "",
  readStatus = "",
  prefix
) => {
  let whereStatement = [];
  if (date != "") {
    let condition1 = {
      updated_at: {
        [Op.gte]: date,
      },
    };
    whereStatement.push(condition1);
  }
  if (readStatus != "") {
    let condition2 = {
      read_status: readStatus,
    };
    whereStatement.push(condition2);
  }
  let allOtherCondition = {
    user_id: userId,
    status: status,
  };
  whereStatement.push(allOtherCondition);
  const result = await PayoutReleaseRequest.findAll({
    where: whereStatement,
    prefix,
  });
  return result.length;
};
