const { Op } = require("sequelize");
const db = require("../../models");
const Common = require("../../utils/app/common");
const moment = require("moment");
const modStatus = require("../../utils/app/moduleStatus");
const User = db.user;
const Package = db.pack;
const PackageValidityHistory = db.productValidityHistory;
const SubscriptionConfig = db.subscriptionConfig;
const OCProducts = db.ocProducts;

exports.getSubscriptionDetails = async (userId, prefix) => {
  let [whereStatement1, whereStatement2] = [[], []];
  let moduleStatus = await modStatus.getModuleStatus(prefix);
  if (moduleStatus.product_status) {
    let condition1 = {
      product_id: {
        [Op.ne]: "",
      },
    };
    if (!moduleStatus.ecom_status) {
      let condition2 = {
        active: 1,
      };
      whereStatement2.push(condition2);
    }
    whereStatement1.push(condition1);
  }
  let condition3 = {
    id: userId,
  };
  whereStatement1.push(condition3);
  if (moduleStatus.ecom_status) {
    var result = await User.findOne({
      attributes: ["product_validity"],
      include: [
        {
          model: OCProducts,
          as: "oc_package",
          attributes: ["product_id", "price"],
          where: whereStatement2,
        },
      ],
      where: whereStatement1,
      prefix,
    });
  } else {
    var result = await User.findOne({
      attributes: ["product_validity"],
      include: [
        {
          model: Package,
          as: "package",
          attributes: ["id", "price"],
          where: whereStatement2,
        },
      ],
      where: whereStatement1,
      prefix,
    });
  }
  return result;
};

exports.packageValidityUpgrade = async (
  package_id,
  purchase,
  byUpgrade,
  t,
  prefix
) => {
  try {
    let moduleStatus = await modStatus.getModuleStatus(prefix);
    let lastInsertedId = await Common.getMaxPackageValidityOrderId(prefix);
    if (lastInsertedId == null) {
      latestid = 1;
    } else {
      latestid = lastInsertedId.id;
    }
    let invoiceNo = "VLDPCK" + (1000 + latestid + 1);
    if (byUpgrade) {
      return true;
    } else {
      let result = await PackageValidityHistory.create(
        {
          user_id: purchase.user_id,
          invoice_id: invoiceNo,
          package_id,
          payment_type: purchase.by_using,
          total_amount: purchase.total_amount,
          product_pv: await Common.getPackagePV(package_id, prefix),
          date_submitted: Date.now(),
          pay_type: "manual",
        },
        { transaction: t, prefix }
      );
      if (result) {
        let validateDate = await getValidityDate(purchase.user_id, prefix);
        console.log("validateDate", validateDate);
        if (validateDate == null || validateDate == undefined) {
          var expiryDate = await getPackageValidityDate(
            package_id,
            validateDate,
            moduleStatus,
            prefix
          );
        } else if (validateDate < Date.now()) {
          var expiryDate = await getPackageValidityDate(
            package_id,
            "",
            moduleStatus,
            prefix
          );
        } else {
          var expiryDate = await getPackageValidityDate(
            package_id,
            validateDate,
            moduleStatus,
            prefix
          );
        }
        let data = {
          product_validity: expiryDate,
        };
        let userProduct = await User.findOne({
          where: { id: purchase.user_id },
          prefix,
        });
        let userProductUpdate = await userProduct.update(
          data,
          { transaction: t },
          prefix
        );
        if (!userProductUpdate) {
          return false;
        }
      }
      return result;
    }
    return false;
  } catch (error) {
    await t.rollback();
    console.log(error);
    return false;
  }
};

async function getValidityDate(userId, prefix) {
  let result = await User.findOne({
    attributes: ["product_validity"],
    where: { id: userId },
    prefix,
  });
  return result.product_validity;
}
async function getPackageValidityDate(
  packageId,
  validateDate,
  moduleStatus,
  prefix
) {
  console.log(`package id ${packageId} validate date ${validateDate}`);
  if (validateDate) {
    var expiryDate = validateDate;
  } else {
    var expiryDate = Date.now();
  }
  if (!moduleStatus.subscription_status) {
    return expiryDate;
  }
  let subscription = await SubscriptionConfig.findOne({ prefix });
  if (subscription.based_on == "amount_based") {
    var result = subscription.subscription_period;
  } else if (moduleStatus.ecom_status) {
    let period = await OCProducts.findOne({
      attributes: ["product_id", "validity"],
      where: { product_id: packageId },
      prefix,
    });
    var result = period.validity;
  } else {
    let period = await Package.findOne({
      attributes: ["id", "validity"],
      where: { id: packageId },
      prefix,
    });
    var result = period.validity;
  }
  let pckValiditity = await calculateProductValidity(result, expiryDate);
  return pckValiditity;
}
async function calculateProductValidity(packageValidityInMonths, validatyDate) {
  if (validatyDate) {
    validatyDate = new Date(validatyDate);
  } else {
    validatyDate = new Date();
  }
  console.log(
    "validity_date",
    validatyDate,
    "packageValidityInMonths",
    packageValidityInMonths
  );
  let productValidity = validatyDate.setMonth(
    validatyDate.getMonth() + Number(packageValidityInMonths)
  );
  console.log(`product validity ${productValidity}`);
  productValidity = moment(productValidity).format("YYYY-MM-DD HH:mm:ss");
  return productValidity;
}
