const db = require("../../models");
const Configuration = db.configuration;
const UserDetails = db.userDetails;
const User = db.user;
const PaymentReceipts = db.paymentReceipts;
const { join } = require("path");
const fs = require("fs");
const { mlm_laravel } = require("../../models");
const BankTransferSettings = db.bankTransferSettings;
const Common = require("./common");
const RepurchaseServices = require("../../utils/web/repurchaseServices");
const PaymentGatewayConfig = db.paymentConfig;
const Compensation = db.compensation;
const RankConfiguration = db.rankConfig;
var _ = require("lodash");
const CommissionServices = require("../../utils/web/commissionServices");

exports.getUploadConfig = async (prefix) => {
  const { upload_config } = await Configuration.findOne({
    attributes: ["upload_config"],
    prefix,
  });
  return upload_config;
};

exports.getUploadCount = async (user_id, prefix) => {
  const upload_count = await UserDetails.findOne({
    attributes: ["upload_count"],
    where: {
      user_id,
    },
    prefix,
  });
  if (upload_count) {
    return upload_count.upload_count;
  }
  return 0;
};

exports.storeBTReceipt = async (username, filename, type, id, prefix, t) => {
  try {
    let result;
    let paymentReceiptResult = await PaymentReceipts.findOne({
      where: {
        user_id: id,
        type: type,
      },
      prefix,
    });
    if (paymentReceiptResult == null) {
      result = await PaymentReceipts.create(
        {
          receipt: filename,
          user_id: id ? id : null,
          username: username ? username : null,
          type,
        },
        {
          transaction: t,
          prefix,
        }
      );
    } else {
      const oldImageUrl = join(
        __dirname,
        "../uploads/images/bank/",
        paymentReceiptResult.receipt ? paymentReceiptResult.receipt : ""
      );
      if (fs.existsSync(oldImageUrl)) {
        fs.unlinkSync(oldImageUrl);
      }
      result = await paymentReceiptResult.update(
        {
          receipt: filename,
        },
        { transaction: t },
        prefix
      );
    }
    return true;
  } catch (err) {
    console.log(err.message);
    return false;
  }
};

exports.bankReceiptUnpproved = async(username,filename,type,id,prefix,t) => {
  try {
    let result;
    let paymentReceiptResult = await PaymentReceipts.findOne({
      where: {
        pending_registrations_id: id,
        type: type,
      },
      prefix,
    });
    if (paymentReceiptResult == null) {
      result = await PaymentReceipts.create(
        {
          receipt: filename,
          username: username ? username : null,
          type,
        },
        {
          transaction: t,
          prefix,
        }
      );
    } else {
      const oldImageUrl = join(
        __dirname,
        "../uploads/images/bank/",
        paymentReceiptResult.receipt ? paymentReceiptResult.receipt : ""
      );
      if (fs.existsSync(oldImageUrl)) {
        fs.unlinkSync(oldImageUrl);
      }
      result = await paymentReceiptResult.update(
        {
          receipt: filename,
        },
        { transaction: t },
        prefix
      );
    }
    return true;
  } catch (err) {
    console.log(err.message);
    return false;
  }
}

const getCompensationConfig = async (value) => {
  const result = await Compensation.findOne({
    where: {
      [value]: 1,
    },
  });
  return result.value;
};

exports.updateUploadCount = async (user_id, prefix, t) => {
  try {
    const uploadCountDetails = await UserDetails.findOne({
      where: {
        user_id,
      },
      prefix,
    });

    await uploadCountDetails.update(
      {
        upload_count: uploadCountDetails.upload_count + 1,
      },
      { transaction: t },
      prefix
    );
    return true;
  } catch (err) {
    return false;
  }
};

exports.getBankInfo = async () => {
  const { account_info } = await BankTransferSettings.findOne();
  return account_info;
};

exports.getBankPaymentStatus = async () => {
  const { repurchase } = await PaymentGatewayConfig.findOne({
    attributes: ["repurchase"],
    where: {
      name: "Bank Transfer",
    },
  });
  return repurchase;
};

exports.updateUserPV = async (
  cartItems,
  totalAmount,
  user_id,
  defaultAddressId,
  order_status,
  paymentType,
  moduleStatus,
  t,
  prefix
) => {
  try {
    let mlmPlan = moduleStatus.mlm_plan,
      updatePV = true,
      productPairValue = 0,
      productAmount = 0,
      quantity = 0,
      ocOrderId = 0;
    let upline_id = await Common.getFatherId(user_id, prefix);
    let position = await Common.getUserPosition(user_id, prefix);

    for await (const item of cartItems) {
      let productDetails = await RepurchaseServices.getProductAmountAndPV(
        item.package_id,
        moduleStatus,
        prefix
      );
      let productPV = productDetails.pairValue * item.quantity;
      productPairValue += productPV;
      quantity += item.quantity;
      productAmount += productDetails.productValue * item.quantity;
    }

    let sponorId = await RepurchaseServices.getSponsorId(user_id, prefix);

    if (mlmPlan == "Matrix") {
      upline_id = sponorId;
    }

    let dataArr = {
      sponsorId: sponorId,
      productPV: productPairValue,
      productId: 1,
      quantity: quantity,
      productAmount: productAmount,
      placementId: upline_id,
      position: position,
    };
    await t.commit();
    console.log(
      "*******************************************commission*******************"
    );
    CommissionServices.commissionCall(user_id, dataArr, "repurchase", prefix);
    return true;
  } catch (error) {
    await t.rollback();
    console.log(error);
  }
};

exports.getReceipt = async (username = "", id, method, prefix) => {
  try {
    let paymentReceiptResult;
    if (username == "") {
      paymentReceiptResult = await PaymentReceipts.findOne({
        where: {
          user_id: id,
          type: method,
        },
        prefix,
      });
    } else {
      paymentReceiptResult = await PaymentReceipts.findOne({
        where: {
          username,
          type: method,
        },
        prefix,
      });
    }
    return paymentReceiptResult;
  } catch (error) {
    console.log(error);
  }
};
