const { Op } = require("sequelize");
const db = require("../../models");
const pack = db.pack;
const User = db.user;
const Common = require("../../utils/web/common");
const PinNumbers = db.pinNumbers;
const Configuration = db.configuration;
const modStatus = require("../../utils/web/moduleStatus");
const OCProduct = db.ocProducts;

exports.getProductAmountAndPV = async (packageId, moduleStatus, prefix) => {
  let result;
  if (moduleStatus.ecom_status) {
    //TODO ECOM --- Completed need to check
    result = await OCProduct.findOne({
      attributes: ["pair_value", "price"],
      where: {
        product_id: packageId,
      },
      prefix,
    });
  } else {
    result = await pack.findOne({
      attributes: ["pair_value", "price"],
      where: {
        id: packageId,
      },
      prefix,
    });
  }
  let data = {
    pairValue: result.pair_value,
    productValue: result.price,
  };
  return data;
};

exports.getSponsorId = async (userId, prefix) => {
  const { sponsor_id } = await User.findOne({
    attributes: ["sponsor_id"],
    where: {
      id: userId,
    },
    prefix,
  });
  return sponsor_id;
};

// exports.runCalculations = async (
//   mlmplan,
//   action,
//   userId,
//   productPairValue,
//   sponorId,
//   moduleStatus,
//   t,
//   prefix
// ) => {
//   //TODO Calculate Commission PYTHON API
//   let pvResponse = await updatePersonalPV(
//     moduleStatus,
//     userId,
//     productPairValue,
//     action,
//     t,
//     prefix
//   );
//   let gpvResponse = await updateGroupPV(
//     moduleStatus,
//     userId,
//     productPairValue,
//     action,
//     t,
//     prefix
//   );
//   if (pvResponse && gpvResponse) {
//     return true;
//   } else {
//     return false;
//   }
// };

exports.updatePersonalPV = async (
  moduleStatus,
  userId,
  productPV,
  action,
  prefix
) => {
  try {
    if (moduleStatus.product_status) {
      const userDetails = await User.findOne({
        attributes: ["personal_pv", "id"],
        where: {
          id: userId,
        },
        prefix,
      });
      let newPV = parseInt(userDetails.personal_pv) + productPV;
      console.log("newPv", newPV);
      await userDetails.update(
        {
          personal_pv: newPV,
        },
        {},
        prefix
      );
      return true;
    }
    return false;
  } catch (Err) {
    console.log(Err.message);
    return false;
  }
};

const updateGroupPV = (exports.updateGroupPV = async (
  moduleStatus,
  userId,
  productPV,
  action,
  prefix
) => {
  try {
    if (moduleStatus.product_status) {
      var { sponsor_id } = await User.findOne({
        attributes: ["sponsor_id"],
        where: {
          id: userId,
        },
        prefix,
      });
      if (sponsor_id != null) {
        var userDetails = await User.findOne({
          attributes: ["group_pv", "id"],
          where: {
            id: sponsor_id,
          },
          prefix,
        });
        let newPV = parseInt(userDetails.group_pv) + productPV;
        await userDetails.update(
          {
            group_pv: newPV,
          },
          {},
          prefix
        );
        await updateGroupPV(
          moduleStatus,
          sponsor_id,
          productPV,
          action,
          prefix
        );
      }
      return true;
    }
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
});

const getEpinDetails = async (epin, userId, upgradeUserId, prefix) => {
  let result = await PinNumbers.findOne({
    attributes: ["numbers", "balance_amount", "amount", "allocated_user"],
    where: {
      allocated_user: userId,
      status: "active",
      numbers: epin,
      amount: {
        [Op.gt]: 0,
      },
      expiry_date: {
        [Op.gte]: new Date(),
      },
    },
    prefix,
  });
  if (result == null) {
    return false;
  } else {
    return result;
  }
};

exports.checkAllEpins = async (
  pinDetails,
  productId = "",
  productStatus,
  sponorId,
  paymentType,
  id,
  prefix
) => {
  let isPinOk = false,
    pinArray = [],
    productAmount = 0,
    totalAmount = 0;
  if (productStatus && productId != "") {
    let productDetails = await Common.getProductDetails(productId, 1, prefix);
    productAmount = productDetails.price;
  }
  let registerAmount = await Common.getRegisterAmount(prefix);
  switch (paymentType) {
    case "registration":
      totalAmount = productAmount + registerAmount;
      break;
    case "subscription_renewal":
      totalAmount = productAmount;
      break;
    case "package_upgrade":
      let packageId = await Common.getProductPackageId(
        productId,
        "registration",
        prefix
      );
      let currentPackageId = await Common.getProductId(id, prefix);
      let currentPackageAmount = await Common.getCartProduct(
        currentPackageId,
        prefix
      );
      let packageAmount = await Common.getCartProduct(packageId, prefix);
      totalAmount = packageAmount - currentPackageAmount;
      break;
  }
  let arrayLength = pinDetails.length;
  if (arrayLength > 0) {
    for await (let [key, value] of Object.entries(pinDetails)) {
      //TODO CHECK
      let pinValue = value.pin;
      let epinDetails = await Common.checkEPinValidity(
        pinValue,
        id,
        sponorId,
        prefix
      );
      if (epinDetails && epinDetails.balance_amount > 0) {
        let epinAmount = epinDetails["balance_amount"];
        let epinBalanceAmount = epinDetails["balance_amount"];
        let epinUsedAmount = epinDetails["balance_amount"];
        if (totalAmount) {
          if (epinAmount == totalAmount) {
            epinBalanceAmount = 0;
            totalAmount = 0;
          } else {
            if (epinAmount > totalAmount) {
              epinBalanceAmount = epinAmount - totalAmount;
              epinUsedAmount = totalAmount;
              totalAmount = 0;
            } else {
              epinBalanceAmount = 0;
              registerAmount = totalAmount - epinAmount;
              totalAmount = registerAmount >= 0 ? registerAmount : 0;
            }
          }
          if (totalAmount == 0) {
            isPinOk = true;
          }
        } else {
          epinUsedAmount = 0;
        }
        pinArray[key] = {
          pin: epinDetails.numbers,
          amount: epinAmount, //TODO Default Currency Value
          balance_amount: epinBalanceAmount,
          reg_balance_amount: totalAmount,
          epin_used_amount: epinUsedAmount,
          i: key,
          product_amount: productAmount,
        };
      } else {
        pinArray[key] = {
          pin: "nopin",
          amount: "0",
          balance_amount: "0",
          reg_balance_amount: "0",
          epin_used_amount: "0",
          i: key + 1,
          product_amount: productAmount,
        };
      }
    }
  } else {
    pinArray[0] = {
      pin: "nopin",
      amount: 0,
      balance_amount: 0,
      reg_balance_amount: "0",
      epin_used_amount: "0",
      product_amount: 0,
      isPinOk,
    };
  }
  return pinArray;
};

exports.validateAllEpins = async (
  pinDetails,
  totalCartAmount,
  userId,
  prefix,
  upgradeUserId = ""
) => {
  let result = [],
    isPinOk = false;
  for await (let [key, value] of Object.entries(pinDetails)) {
    let epin = value.pin;
    let totalRegAmount = totalCartAmount;
    let pinValueDetails = await getEpinDetails(
      epin,
      userId,
      upgradeUserId,
      prefix
    );
    if (pinValueDetails) {
      let epinAmount = pinValueDetails.balance_amount;
      let epinUsedAmount = Math.min(epinAmount, totalCartAmount);
      let epinBalanceAmount =
        parseFloat(epinAmount) - parseFloat(epinUsedAmount);
      totalCartAmount -= epinUsedAmount;
      if (epinUsedAmount != 0) {
        if (totalCartAmount == 0) {
          isPinOk = true;
        }
        result[key] = {
          pin: epin,
          amount: epinAmount,
          balance_amount: epinBalanceAmount,
          reg_balance_amount: parseFloat(totalCartAmount),
          epin_used_amount: parseFloat(epinUsedAmount),
          product_amount: parseFloat(totalRegAmount),
        };
      }
    } else {
      result[key] = {
        pin: "nopin",
        amount: 0,
        balance_amount: 0,
        reg_balance_amount: 0,
        epin_used_amount: 0,
        product_amount: 0,
      };
    }
  }
  return result;
};

exports.UpdateUsedEpin = async (pinArray, id, method, prefix, t) => {
  try {
    for await (let [key, value] of Object.entries(pinArray)) {
      let pinNum = value.pin;
      let pinBalance = value.balance_amount;
      let pinDetails = await PinNumbers.findOne({
        where: {
          numbers: pinNum,
        },
        prefix,
      });
      if (pinBalance == 0) {
        await pinDetails.update(
          {
            status: "used",
            used_user: id,
            balance_amount: 0,
          },
          { transaction: t },
          prefix
        );
      } else {
        let newPinBalance = pinBalance.toFixed(2);
        await pinDetails.update(
          {
            status: "active",
            used_user: id,
            balance_amount: newPinBalance,
          },
          { transaction: t },
          prefix
        );
      }
    }
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

exports.UpdateUsedUserEpin = async (pinArray, userId, prefix, t) => {
  try {
    for await (let [key, value] of Object.entries(pinArray)) {
      let pinNum = value.pin;
      let pinBalance = value.balance_amount;
      let pinDetails = await PinNumbers.findOne({
        where: {
          numbers: pinNum,
        },
        prefix,
      });
      if (pinBalance == 0) {
        await pinDetails.update(
          {
            status: "used",
            balance_amount: 0,
          },
          { transaction: t },
          prefix
        );
      } else {
        //TODO Default currency
        let newPinBalance = pinBalance.toFixed(2);
        await pinDetails.update(
          {
            status: "active",
            balance_amount: newPinBalance,
          },
          { transaction: t },
          prefix
        );
      }
    }
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

//TODO Insert
exports.insertUsedPin = async (
  pinArray,
  id,
  method,
  pendingStatus = false,
  emailVerification = "no",
  prefix,
  t
) => {
  let pendingId = "NULL",
    status = "yes";
  if (pendingStatus || emailVerification == "yes") {
    pendingId = id;
    id = "NULL";
  }
  for await (let [key, value] of Object.entries(pinArray)) {
    let pinNum = value.pin;
    let pinBalance = value.balance_amount;
    let pinAmount = value.amount;
    let pinDetails = await PinNumbers.findOne({
      where: {
        numbers: pinNum,
      },
      prefix,
    });

    if (pinBalance == 0) {
      status = "used";
    }
  }
};
