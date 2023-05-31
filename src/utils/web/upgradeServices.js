const db = require("../../models");
const Package = db.pack;
const User = db.user;
const PackageUpgradeHistory = db.packageUpgradeHistory;
const UpgradeSalesOrder = db.upgradeSalesOrder;
const RoiOrder = db.roiOrder;
const Common = require("../../utils/web/common");
const PackageExtendedValidityHistory = db.packageValidityHistories;
const RepurchaseServices = require("../../utils/web/repurchaseServices");
const commissionServices = require("./commissionServices");
const modStatus = require("../../utils/web/moduleStatus");
const OCProduct = db.ocProducts;

const getPackagePV = async (packageId, prefix) => {
  const moduleStatus = await modStatus.getModuleStatus(prefix);
  if (moduleStatus.ecom_status) {
    var { pair_value } = await OCProduct.findOne({
      attributes: ["pair_value"],
      where: {
        product_id: packageId,
      },
      prefix,
    });
  } else {
    var { pair_value } = await Package.findOne({
      attributes: ["pair_value"],
      where: {
        id: packageId,
      },
      prefix,
    });
  }

  return pair_value;
};

const packageValidityUpgrade = async (
  userId,
  packageDetails,
  purchase,
  prefix,
  t,
  byUpgrade = false,
  payType = "manual"
) => {
  let result = false,
    latestid,
    expiryDate;
  let lastInsertedId = await Common.getMaxPackageValidityOrderId(prefix);
  if (lastInsertedId == null) {
    latestid = 1;
  } else {
    latestid = lastInsertedId.id;
  }
  let invoiceNo = "VLDPCK" + (1000 + latestid + 1);
  if (byUpgrade) {
    result = true;
  } else {
    let productPV = await Common.getProductPvByPackageId(
      packageDetails.id,
      prefix
    );
    //TODO --- CHECK RENEWAL
    await PackageExtendedValidityHistory.create(
      {
        user_id: userId,
        invoice_id: invoiceNo,
        package_id: packageDetails.id,
        payment_type: purchase.by_using,
        total_amount: purchase.total_amount,
        product_pv: productPV,
        date_submitted: new Date(),
        pay_type: payType,
      },
      { transaction: t, prefix }
    );
    result = true;
  }

  if (result) {
    result = invoiceNo;
    let validityDate = await Common.getValidityDate(userId, prefix);
    if (validityDate < new Date()) {
      expiryDate = await Common.getPackageValidityDate(
        packageDetails.id,
        prefix
      );
    } else {
      expiryDate = await Common.getPackageValidityDate(
        packageDetails.id,
        prefix,
        validityDate
      );
    }

    const userDetails = await User.findOne({
      where: {
        id: userId,
      },
      prefix,
    });

    await userDetails.update(
      {
        product_validity: expiryDate,
      },
      { transaction: t },
      prefix
    );
  }
  return result;
};
exports.upgradeMembershipPackage = async (
  userId,
  currentPackageId,
  productId,
  packageId,
  paymentAmount,
  paymentMethod,
  moduleStatus,
  paymentStatus,
  prefix,
  t
) => {
  let currentPackagePV, newPackagePV, pvDifference;
  try {
    currentPackagePV = await getPackagePV(currentPackageId, prefix);
    newPackagePV = await getPackagePV(packageId, prefix);
    pvDifference = parseInt(Number(newPackagePV));
    // - parseInt(Number(currentPackagePV));
    const userDetails = await User.findOne({
      where: {
        id: userId,
      },
      prefix,
    });

    if (moduleStatus.ecom_status) {
      await userDetails.update(
        {
          oc_product_id: packageId,
        },
        { transaction: t },
        prefix
      );
    } else {
      await userDetails.update(
        {
          product_id: packageId,
        },
        { transaction: t },
        prefix
      );
    }

    await PackageUpgradeHistory.create(
      {
        user_id: userId,
        current_package_id: currentPackageId,
        new_package_id: packageId,
        pv_difference: pvDifference,
        payment_amount: paymentAmount,
        payment_type: paymentMethod,
        status: paymentStatus == "confirmed" ? 1 : 0,
        done_by: userId,
      },
      {
        transaction: t,
        prefix,
      }
    );

    await UpgradeSalesOrder.create(
      {
        user_id: userId,
        package_id: packageId,
        amount: paymentAmount,
        total_pv: pvDifference,
        payment_method: paymentMethod,
      },
      { transaction: t, prefix }
    );
    //TODO
    if (moduleStatus.roi_status) {
      let paymentMethodType;
      switch (paymentMethod) {
        case "freejoin":
          paymentMethodType = "free-joining";
          break;
        case "epin":
          paymentMethodType = "e-pin";
          break;
        case "stripe":
          paymentMethodType = "stripe";
          break;
        case "ewallet":
          paymentMethodType = "e-wallet";
          break;
        case "banktransfer":
          paymentMethodType = "bank-transfer";
          break;
        case "ewallet":
          paymentMethodType = "e-wallet";
          break;
      }
      let paymentId = await Common.getPaymentGatewayId(
        paymentMethodType,
        prefix
      );
      let productDetails = await Common.getProductDetails(packageId, 1, prefix);

      let roi = productDetails.roi;
      let days = productDetails.days;
      let packAmount = productDetails.price;
      await RoiOrder.create(
        {
          user_id: userId,
          package_id: packageId,
          amount: packAmount,
          payment_method: paymentId,
          max_amount: packAmount * 3,
          commission_amount: 0,
          roi: roi,
          days: days,
        },
        { transaction: t, prefix }
      );
    }
    if (moduleStatus.subscription_status) {
      let packageDetails = {},
        purchase = {};
      packageDetails["id"] = packageId;
      purchase["by_using"] = paymentMethod;
      purchase["user_id"] = userId;

      await packageValidityUpgrade(userId, packageDetails, purchase, prefix, t);
    }
    if (pvDifference > 0 || paymentAmount > 0) {
      let mlmPlan = moduleStatus.mlm_plan,
        rankStatus = moduleStatus.rank_status,
        ocOrderId = 0,
        action = "upgrade";
      let uplineId = await Common.getFatherId(userId, prefix);
      let sponorId = await Common.getSponsorId(userId, prefix);
      let userPosition = await Common.getUserPosition(userId, prefix);

      if (mlmPlan == "Matrix") {
        uplineId = sponorId;
      }
      let dataArr = {
        sponsorId: sponorId,
        productId: packageId,
        productPV: pvDifference,
        productAmount: paymentAmount,
        placementId: uplineId,
        position: userPosition,
      };
      // commission
      console.log(
        "*******************************************commission*******************"
      );
      console.log(
        ` user id is ${userId} data array ${JSON.stringify(dataArr)}`
      );
      commissionServices.commissionCall(userId, dataArr, "upgrade", prefix);
    }
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

exports.upgradeMembershipPackagePending = async (
  userId,
  currentPackageId,
  productId,
  packageId,
  paymentAmount,
  paymentType,
  moduleStatus,
  paymentStatus,
  paymentReceipt = "",
  prefix,
  t
) => {
  try {
    let currentPackagePV, newPackagePV, pvDifference;

    currentPackagePV = await getPackagePV(currentPackageId, prefix);
    newPackagePV = await getPackagePV(packageId, prefix);

    pvDifference =
      parseFloat(Number(newPackagePV)) - parseFloat(Number(currentPackagePV));
    await PackageUpgradeHistory.create(
      {
        user_id: userId,
        current_package_id: currentPackageId,
        new_package_id: packageId,
        pv_difference: pvDifference,
        payment_amount: paymentAmount,
        payment_type: paymentType,
        status: paymentStatus == "confirmed" ? 1 : 0,
        payment_receipt: paymentReceipt,
        done_by: userId,
      },
      { transaction: t, prefix }
    );
    return true;
  } catch (err) {
    return false;
  }
};
