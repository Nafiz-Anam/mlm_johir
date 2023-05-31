var crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { Op, Sequelize } = require("sequelize");
const Str = require("@supercharge/strings");
const modStatus = require("../../utils/app/moduleStatus");
const db = require("../../models");
const User = db.user;
const Package = db.pack;
const Cart = db.carts;
const pinNum = db.pinNumbers;
const PendingUsers = db.pendingRegistration;
const PaymentGatewayConfig = db.paymentConfig;
const Treepath = db.treepath;
const PackageValidityHistory = db.packageValidityHistories;
const SubscriptionConfig = db.subscriptionConfig;
const Configuration = db.configuration;
const Countries = db.countries;
const Activities = db.activities;
const DonationRates = db.donationRates;
const UserBalance = db.userBalance;
const Transactions = db.transactions;
const UserDetails = db.userDetails;
const Currencies = db.currencies;
const Tokens = db.accessToken;
const OCProduct = db.ocProducts;
const OCCart = db.ocCart;
const StringValidator = db.stringValidator;
const OcOrderProduct = db.ocOrderProduct;
const OcOrderTotal = db.ocOrderTotal;
const legAmount = db.legAmt;
const roiOrder = db.roiOrder;
const jwt = require("jsonwebtoken");

exports.getAdminId = async (prefix) => {
  const { id } = await User.findOne({
    attributes: ["id"],
    where: {
      user_type: "admin",
    },
    prefix,
  });
  return id;
};

exports.usernameToId = async (username, prefix) => {
  try {
    const id = await User.findOne({
      attributes: ["id"],
      where: {
        username: username,
      },
      prefix,
    });
    return id.id;
  } catch (err) {
    return false;
  }
};

exports.idToUsername = async (id, prefix) => {
  try {
    const { username } = await User.findOne({
      attributes: ["username"],
      where: {
        id: id,
      },
      prefix,
    });
    return username;
  } catch (err) {
    return false;
  }
};

exports.userExists = async (id, prefix) => {
  try {
    const result = await User.findOne({
      where: {
        id: id,
      },
      prefix,
    });
    return result;
  } catch (err) {
    return false;
  }
};

exports.createInvoiceNo = async (id) => {
  const newValue = 1000 + id;
  return "RPCHSE" + newValue;
};

exports.isUserActive = async (id, prefix) => {
  try {
    const result = await User.findOne({
      where: {
        id: id,
        active: 1,
      },
      prefix,
    });
    return result;
  } catch (err) {}
};
exports.getProductName = async (id, prefix) => {
  try {
    const moduleStatus = await modStatus.getModuleStatus(prefix);
    if (moduleStatus.ecom_status) {
      const result = await OCProduct.findOne({
        attributes: ["model", "price"],
        where: {
          product_id: id,
        },
        prefix,
      });
      return result;
    } else {
      const result = await Package.findOne({
        attributes: ["name", "price"],
        where: {
          id: id,
        },
        prefix,
      });
      console.log("result", result);
      return result;
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getProductNameFromUserID = async (userId, prefix) => {
  //TODO -ECOM --- completed need to check
  const moduleStatus = await modStatus.getModuleStatus(prefix);
  if (moduleStatus.ecom_status) {
    const userProductDetails = await User.findOne({
      where: {
        id: userId,
      },
      include: [
        {
          model: OCProduct,
          as: "oc_package",
        },
      ],
      prefix,
    });
    console.log(JSON.stringify(userProductDetails));
    return userProductDetails.oc_package.model;
  } else {
    const userProductDetails = await User.findOne({
      where: {
        id: userId,
      },
      include: [
        {
          model: Package,
          as: "package",
        },
      ],
      prefix,
    });
    return userProductDetails.package.name;
  }
};

exports.getMembershipPackageDetails = async (userId, prefix) => {
  const userProductDetails = await User.findOne({
    attributes: ["id"],
    where: {
      id: userId,
    },
    include: [
      {
        model: Package,
        as: "package",
        attributes: ["name", "id", "price", "pair_value"],
        where: {
          type: "registration",
        },
      },
    ],
    prefix,
  });
  return userProductDetails;
};

exports.getUpgradablePackageList = async (details, prefix) => {
  var currentPackageSlab = await getSponsorPackageSlab(details.id, prefix);
  let whereStatement = {
    type: "registration",
    active: 1,
    id: {
      [Op.ne]: details.package["id"],
    },
    price: {
      [Op.gt]: details.package["price"],
    },
  };
  if (currentPackageSlab == "entry") {
    whereStatement["package_type"] = currentPackageSlab;
  }
  var pakcgeDetailsDetails = await Package.findAll({
    attaributes: ["name", "id", "price", "pair_value"],
    where: whereStatement,
    prefix,
  });

  if (pakcgeDetailsDetails.length == 0) {
    pakcgeDetailsDetails = await Package.findAll({
      attaributes: ["name", "id", "price", "pair_value"],
      where: {
        type: "registration",
        active: 1,
        id: {
          [Op.ne]: details.package["id"],
        },
        price: {
          [Op.gt]: details.package["price"],
        },
      },
      prefix,
    });
  }

  return pakcgeDetailsDetails;
};

exports.getFatherId = async (userId, prefix) => {
  const { father_id } = await User.findOne({
    where: {
      id: userId,
    },
    prefix,
  });
  return father_id;
};

exports.getUserPosition = async (userId, prefix) => {
  const { position } = await User.findOne({
    where: {
      id: userId,
    },
    prefix,
  });
  return position;
};

exports.getSponsorId = async (id, prefix) => {
  const { sponsor_id } = await User.findOne({
    attributes: ["sponsor_id"],
    where: {
      id,
    },
    prefix,
  });
  return sponsor_id;
};

exports.isUserAvailable = async (username, prefix) => {
  const { active } = await User.findOne({
    attributes: ["active"],
    where: {
      username,
    },
    prefix,
  });
  return active;
};

exports.totalCartAmount = async (user_id, prefix) => {
  let amount = 0;
  const cartDetails = await Cart.findAll({
    where: {
      user_id,
    },
    prefix,
  });

  for await (const item of cartDetails) {
    let singlePackageDetail = await Package.findOne({
      where: {
        id: item.package_id,
      },
      prefix,
    });
    amount += singlePackageDetail.price * item.quantity;
  }
  return amount;
};

exports.getProductDetails = async (productId = "", status = 1, prefix) => {
  let whereStatement = [],
    productDetails = [];
  const moduleStatus = await modStatus.getModuleStatus(prefix);
  if (moduleStatus.ecom_status) {
    //TODO ECOM --- Completed need to check
    if (status != "") {
      let condition1 = {
        status: status,
      };
      whereStatement.push(condition1);
    }
    if (productId != "") {
      if (typeof productId == "string") {
        const packageId = await getPackageId(productId, prefix);
        let condition2 = {
          product_id: packageId,
        };
        whereStatement.push(condition2);
      } else {
        let condition2 = {
          product_id: productId,
        };
        whereStatement.push(condition2);
      }
    }
    productDetails = OCProduct.findOne({
      where: whereStatement,
      prefix,
    });
  } else {
    if (status != "") {
      let condition1 = {
        active: status,
      };
      whereStatement.push(condition1);
    }
    if (productId != "") {
      if (typeof productId == "string") {
        const packageId = await getPackageId(productId, prefix);
        let condition2 = {
          id: packageId,
        };
        whereStatement.push(condition2);
      } else {
        let condition2 = {
          id: productId,
        };
        whereStatement.push(condition2);
      }
    }
    productDetails = Package.findOne({
      where: whereStatement,
      prefix,
    });
  }
  return productDetails;
};

const getPackageId = (exports.getPackageId = async (productId, prefix) => {
  const moduleStatus = await modStatus.getModuleStatus(prefix);
  if (moduleStatus.ecom_status) {
    let { product_id } = await OCProduct.findOne({
      where: {
        model: productId,
      },
      prefix,
    });
    return product_id;
  } else {
    let { id } = await Package.findOne({
      where: {
        product_id: productId,
      },
      prefix,
    });
    return id;
  }
});

exports.getProductId = async (id, prefix) => {
  const moduleStatus = await modStatus.getModuleStatus(prefix);
  if (moduleStatus.ecom_status) {
    let { oc_product_id } = await User.findOne({
      attributes: ["oc_product_id"],
      where: {
        id,
      },
      prefix,
    });
    return oc_product_id;
  } else {
    let { product_id } = await User.findOne({
      attributes: ["product_id"],
      where: {
        id,
      },
      prefix,
    });
    return product_id;
  }
};

exports.getCartProduct = async (packageId, prefix) => {
  const moduleStatus = await modStatus.getModuleStatus(prefix);
  if (moduleStatus.ecom_status) {
    console.log(packageId);
    //TODO ECOM --- Completed need to check
    const { price } = await OCProduct.findOne({
      attributes: ["price"],
      where: {
        product_id: packageId,
      },
      prefix,
    });
    return price;
  } else {
    const { price } = await Package.findOne({
      attributes: ["price"],
      where: {
        id: packageId,
      },
      prefix,
    });
    return price;
  }
};

exports.checkEPinValidity = async (ePin, id, sponsorId, prefix) => {
  let epinArray = [];
  let epinDetail = await pinNum.findOne({
    attributes: ["numbers", "balance_amount"],
    where: {
      numbers: ePin,
      allocated_user: id,
      // purchase_status: 1,
      status: "active",
      amount: {
        [Op.gt]: 0,
      },
      expiry_date: {
        [Op.gte]: new Date(),
      },
    },
    prefix,
  });

  let result = {
    numbers: epinDetail?.numbers ? epinDetail.numbers : 0,
    balance_amount: epinDetail?.balance_amount ? epinDetail?.balance_amount : 0,
  };
  return result;
};

exports.getPackageNameFromPackageId = async (
  packageId,
  moduleStatus,
  prefix
) => {
  if (moduleStatus.ecom_status) {
    //TODO ECOM --- Completed need to check
    const { model } = await OCProduct.findOne({
      attributes: ["model"],
      where: {
        product_id: packageId,
        package_type: "registration",
      },
      prefix,
    });
    return model;
  } else {
    const { name } = await Package.findOne({
      attributes: ["name"],
      where: {
        id: packageId,
        type: "registration",
      },
      prefix,
    });
    return name;
  }
};

exports.getPaymentGatewayId = async (slug, prefix) => {
  const { id } = await PaymentGatewayConfig.findOne({
    attributes: ["id"],
    where: {
      slug,
    },
    prefix,
  });
  return id;
};

exports.getMaxPackageValidityOrderId = async (prefix) => {
  const result = await PackageValidityHistory.findOne({
    order: [["createdAt", "DESC"]],
    prefix,
  });
  return result;
};

exports.getProductPvByPackageId = async (packageId, prefix) => {
  const moduleStatus = await modStatus.getModuleStatus(prefix);
  if (moduleStatus.ecom_status) {
    //TODO ECOM --- Completed need to check
    let { pair_value } = await OCProduct.findOne({
      attributes: ["pair_value"],
      where: {
        product_id: packageId,
      },
      prefix,
    });
    return pair_value;
  } else {
    let { pair_value } = await Package.findOne({
      attributes: ["pair_value"],
      where: {
        id: packageId,
      },
      prefix,
    });
    return pair_value;
  }
};

exports.getValidityDate = async (userId, prefix) => {
  const { product_validity } = await User.findOne({
    attributes: ["product_validity"],
    where: {
      id: userId,
    },
    prefix,
  });
  return product_validity;
};

const getSubscriptionStatus = async (prefix) => {
  const subscriptionDetails = await SubscriptionConfig.findOne({
    prefix,
  });
  return subscriptionDetails;
};

const calculateProductValidity = async (
  validityInMonths,
  validityDate = "",
  prefix
) => {
  let newValidityDate;
  if ((validityDate = "")) {
    newValidityDate = new Date();
  }
  let monthValidity = "+" + validityInMonths + " month";
  let time = Date.parse(validityDate) / 1000;
  //TODO Check product validity
  let productValidity = new Date();
  return productValidity;
};

exports.getPackageValidityDate = async (
  packageId,
  prefix,
  validityDate = ""
) => {
  let subscriptionPeriod;
  const moduleStatus = await modStatus.getModuleStatus(prefix);
  let expiryDate;
  if (validityDate != "") {
    expiryDate = validityDate;
  } else {
    expiryDate = new Date();
  }
  if (!moduleStatus.subscription_status) {
    return expiryDate;
  }
  let subscriptionConf = await getSubscriptionStatus(prefix);
  if (subscriptionConf.based_on == "member_package") {
    subscriptionPeriod = subscriptionConf.subscription_period;
  } else if (moduleStatus.ecom_status) {
    //TODO ECOM --- Completed need to check
    const { validity } = await OCProduct.findOne({
      where: {
        product_id: packageId,
      },
      prefix,
    });
    subscriptionPeriod = validity;
  } else {
    const { validity } = await Package.findOne({
      where: {
        id: packageId,
      },
      prefix,
    });
    subscriptionPeriod = validity;
  }
  expiryDate = await calculateProductValidity(
    subscriptionPeriod,
    expiryDate,
    prefix
  );
  return expiryDate;
};

exports.getRegisterAmount = async (prefix) => {
  const { reg_amount } = await Configuration.findOne({
    attributes: ["reg_amount"],
    prefix,
  });
  return reg_amount;
};

exports.getProduct = async (id, prefix) => {
  const moduleStatus = await modStatus.getModuleStatus(prefix);
  if (moduleStatus.ecom_status) {
    if (typeof id == "string") {
      return await OCProduct.findOne({
        where: {
          model: id,
        },
        prefix,
      });
    } else {
      return await OCProduct.findOne({
        where: {
          product_id: id,
        },
        prefix,
      });
    }
  } else {
    if (typeof id == "string") {
      return await Package.findOne({
        where: {
          product_id: id,
        },
        prefix,
      });
    } else {
      return await Package.findOne({
        where: {
          id: id,
        },
        prefix,
      });
    }
  }
};

exports.getProductPackageId = async (productId, packageType, prefix) => {
  const moduleStatus = await modStatus.getModuleStatus(prefix);
  if (moduleStatus.ecom_status) {
    //TODO ECOM --- Completed need to check [check whether its needed or not]
    const { product_id } = await OCProduct.findOne({
      attributes: ["product_id"],
      where: {
        product_id: productId,
        package_type: packageType,
      },
      prefix,
    });
    return product_id;
  } else {
    if (moduleStatus.product_status) {
      const { id } = await Package.findOne({
        attributes: ["id"],
        where: {
          id: productId,
          type: packageType,
        },
        prefix,
      });
      return id;
    }
  }
};

exports.getAdminUsername = async (prefix) => {
  const admin = await User.findOne({
    attributes: ["id", "username"],
    where: {
      user_type: "admin",
    },
    prefix,
  });
  return admin.username;
};

exports.idToCountryName = async (id, prefix) => {
  let result = await Countries.findOne({
    where: {
      id: id,
    },
    prefix,
  });
  return result.name;
};
exports.countrynameToId = async (name, prefix) => {
  try {
    let result = await Countries.findOne({
      where: {
        name: name,
      },
      prefix,
    });
    return result.id;
  } catch (error) {
    return false;
  }
};
exports.getProfilePic = async (userId, prefix) => {
  let result = await UserDetails.findOne({
    attributes: ["image"],
    where: { user_id: userId },
    prefix,
  });
  return result.image;
};

exports.insertUserActivity = async (
  activity,
  userId,
  description,
  data,
  t,
  ip,
  prefix
) => {
  try {
    await Activities.create(
      {
        ip: ip,
        user_id: userId,
        activity: activity,
        description: description,
        data: data,
        user_type: "user",
      },
      {
        transaction: t,
        prefix,
      }
    );
    return true;
  } catch (error) {
    await t.rollback();
    console.log(error);
    return false;
  }
};
exports.idToLevelName = async (id, prefix) => {
  const { name } = await DonationRates.findOne({
    where: {
      id,
    },
    prefix,
  });
  return name;
};

//get referral count based on sponsor id
exports.getReferalCount = async (id, prefix) => {
  const Details = await User.findAll({
    where: {
      sponsor_id: id,
    },
    prefix,
  });

  return Details.length;
};

exports.getUserBalanceAmount = async (id, prefix) => {
  const { balance_amount } = await UserBalance.findOne({
    where: {
      user_id: id,
    },
    prefix,
  });
  return balance_amount;
};

exports.createUniqueTransaction = async (prefix, t) => {
  try {
    const transactionId = Str.random(15);
    const Details = await Transactions.create(
      {
        transaction_id: transactionId,
      },
      { transaction: t, prefix }
    );
    return Details.id;
  } catch (err) {
    return false;
  }
};

exports.getUserType = async (id, prefix) => {
  const { user_type } = await User.findOne({
    where: {
      id,
    },
    prefix,
  });
  return user_type;
};

exports.getEmailId = async (id, prefix) => {
  const { email } = await UserDetails.findOne({
    where: {
      user_id: id,
    },
    prefix,
  });
  return email;
};

exports.getUnreadDocumentsCount = async (id, prefix) => {
  return 0;
};

exports.getMaxCommissionAlert = async (id, prefix) => {
  // const totalCommissionEarned = await legAmount.findAll({
  //   attributes: [[Sequelize.fn("sum", Sequelize.col("total_amount")), "total"]],
  //   where: {
  //     user_id: id,
  //     [Op.or]: [
  //       { amount_type: "recruit_level_bonus" },
  //       { amount_type: "cashback" },
  //       { amount_type: "daily_wage" },
  //       { amount_type: "roi_level_commission" },
  //     ],
  //   },
  //   raw: true,
  //   prefix,
  // });
  // const packagePrice = await User.findOne({
  //   attributes: ["id"],
  //   include: [
  //     {
  //       model: Package,
  //       attributes: ["id", "name", "price"],
  //       as: "package",
  //     },
  //   ],
  //   where: {
  //     id,
  //   },
  //   prefix,
  // });
  // let maxCommissionLimit = 3 * packagePrice.package.price;
  const commissioAMount = await roiOrder.findOne({
    attributes: [
      // [Sequelize.fn("MAX", Sequelize.col("id")), "id"],
      "id",
      "max_amount",
      "commission_amount",
    ],
    where: {
      user_id: id,
    },
    order: [["id", "DESC"]],
    limit: 1,
    prefix,
  });

  let percentage = await getPercentage(
    Number(commissioAMount?.commission_amount),
    Number(commissioAMount?.max_amount)
  );
  let data = {
    percentage: Number(percentage),
    totalCommissionEarned: Number(commissioAMount?.commission_amount),
    Limit: Number(commissioAMount?.max_amount),
  };
  return data;
};

exports.isEligibleUpgrade = async (id, prefix) => {
  const commissioAMount = await roiOrder.findOne({
    attributes: [
      // [Sequelize.fn("MAX", Sequelize.col("id")), "id"],
      "id",
      "max_amount",
      "commission_amount",
    ],
    where: {
      user_id: id,
    },
    order: [["id", "DESC"]],
    limit: 1,
    prefix,
  });

  let percentage = await getPercentage(
    Number(commissioAMount.commission_amount),
    Number(commissioAMount.max_amount)
  );
  if (percentage >= 100) {
    return true;
  }
  return false;
};

exports.getDefaultPlanCurrencyValue = async (prefix) => {
  const result = await Currencies.findOne({
    where: {
      default: 1,
    },
    prefix,
  });
  if (result == null) {
    return 1;
  }
  return result.value;
};

exports.getUserCurrencySymbol = async (id, prefix) => {
  var { default_currency } = await User.findOne({
    where: {
      id,
    },
    prefix,
  });
  if (default_currency == null) {
    const result = await Currencies.findOne({
      where: {
        default: 1,
      },
      prefix,
    });
    default_currency = result.id;
  }
  const value = await Currencies.findOne({
    where: {
      id: default_currency,
    },
    prefix,
  });
  if (value == null) {
    return null;
  }
  return value.symbol_left;
};

exports.getUserCurrencyValue = async (id, prefix) => {
  const value = await Currencies.findOne({
    where: {
      id,
    },
    prefix,
  });
  if (value == null) {
    return null;
  }
  return value.value;
};

exports.getUserCurrencyId = async (id, prefix) => {
  const { default_currency } = await User.findOne({
    where: {
      id,
    },
    prefix,
  });
  return default_currency;
};

exports.getDefaultCurrencyCode = async (prefix) => {
  const currencyDetails = await Currencies.findOne({
    where: {
      default: 1,
    },
    prefix,
  });
  if (currencyDetails == null) {
    return "USD";
  }
  return currencyDetails.code;
};

exports.getProductValidityDate = async (id, prefix) => {
  let { product_validity } = await User.findOne({
    where: { id },
    prefix,
  });
  if (product_validity == undefined || product_validity == "") {
    return (product_validity = "NA");
  }
  return product_validity.toLocaleDateString();
};

exports.getProductIdFromPackageId = async (product_id, prefix) => {
  let { id } = await Package.findOne({
    attributes: ["id"],
    where: {
      product_id,
    },
    prefix,
  });
  return id;
};

exports.getPaymentMethodId = async (slug, prefix) => {
  const result = await PaymentGatewayConfig.findOne({
    where: {
      slug,
    },
    prefix,
  });
  if (result == null) {
    return false;
  }
  return result.id;
};

exports.getDefaultCurrencyIcon = async (prefix) => {
  const currencyDetails = await Currencies.findOne({
    where: {
      default: 1,
    },
    prefix,
  });
  if (currencyDetails == null) {
    return "$";
  }
  return currencyDetails.symbol_left;
};

exports.getPaymentMethodName = async (id, prefix) => {
  const paymentMethod = await PaymentGatewayConfig.findOne({
    where: { id },
    prefix,
  });
  if (paymentMethod == null) {
    return "";
  }
  return paymentMethod.name;
};

exports.getPaymentMethodSlug = async (id, prefix) => {
  const paymentMethod = await PaymentGatewayConfig.findOne({
    where: { id },
    prefix,
  });
  if (paymentMethod == null) {
    return "";
  }
  return paymentMethod.slug;
};

exports.checkDownline = async (loggedId, userId, prefix) => {
  let result = await Treepath.findOne({
    where: {
      ancestor: loggedId,
      descendant: userId,
    },
    prefix,
  });
  if (result) {
    return true;
  } else {
    return false;
  }
};

exports.getPackagePV = async (packageid, prefix) => {
  try {
    const moduleStatus = await modStatus.getModuleStatus(prefix);
    if (moduleStatus.ecom_status) {
      var { pair_value } = await OCProduct.findOne({
        where: {
          product_id: packageid,
        },
        prefix,
      });
    } else {
      var { pair_value } = await Package.findOne({
        where: {
          id: packageid,
        },
        prefix,
      });
    }
    return pair_value;
  } catch (error) {
    return 0;
  }
};

exports.getUserProductValidity = async (id, prefix) => {
  try {
    const { product_validity } = await User.findOne({
      where: {
        id,
      },
      prefix,
    });
    return product_validity;
  } catch (error) {
    return false;
  }
};

exports.getAccessToken = async (user_id, prefix) => {
  try {
    const tokenvalue = await Tokens.findOne({
      where: {
        user_id,
      },
      prefix,
    });
    return tokenvalue == null ? false : tokenvalue.mobile_token;
  } catch (error) {
    return false;
  }
};

exports.getAccessTokenUnapproved = async (id, prefix) => {
  let tokenValue = await PendingUsers.findOne({
    where: {
      id: id,
    },
    prefix,
  });
  return tokenValue == null ? false : tokenValue.user_tokens;
};

const checkString = (exports.checkString = async (string, prefix) => {
  try {
    const stringexist = await StringValidator.findOne({
      where: {
        string,
      },
      prefix,
    });
    if (stringexist == null) {
      return false;
    }
    return stringexist;
  } catch (error) {
    console.log(error);
    return false;
  }
});

exports.updateCheckString = async (string, prefix) => {
  try {
    const stringDetails = await StringValidator.findOne({
      where: {
        string,
      },
      prefix,
    });
    if (stringDetails == null) {
      return false;
    }
    await stringDetails.update(
      {
        status: 0,
      },
      {},
      prefix
    );
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

exports.createEcomLink = async (id, title, prefix) => {
  try {
    let randomString = "",
      randomStringExist = false;
    const stringDetails = await StringValidator.findOne({
      where: {
        user_id: id,
        status: 1,
      },
      prefix,
    });
    if (title == "ecomStore") {
      title = "store";
    }
    var Prefix = prefix.replace("_", "");
    if (stringDetails !== null) {
      let url = `${process.env.store_url}account/login&string=${stringDetails.string}&db_prefix=${Prefix}&${title}=1`;
      return url;
    }
    do {
      randomString = crypto.randomBytes(30).toString("hex");
      randomStringExist = await checkString(randomString, prefix);
    } while (randomStringExist !== false);

    await StringValidator.create(
      {
        user_id: id,
        string: randomString,
        status: 1,
      },
      {
        prefix,
      }
    );

    let url = `${process.env.store_url}account/login&string=${randomString}&db_prefix=${Prefix}&${title}=1`;
    return url;
  } catch (error) {
    console.log(error);
    return "";
  }
};

exports.getUserFullName = async (id, prefix) => {
  try {
    const userFullNameDetails = await UserDetails.findOne({
      attributes: ["name", "second_name"],
      where: {
        user_id: id,
      },
      prefix,
    });
    let fullname = `${userFullNameDetails.name} ${userFullNameDetails.second_name}`;
    return fullname;
  } catch (error) {
    return "";
  }
};

exports.getOcOrderQuantity = async (id, prefix) => {
  try {
    let quantity = 0;
    let OrdersFromId = await OcOrderProduct.findAll({
      where: {
        order_id: id,
      },
      prefix,
    });
    console.log(JSON.stringify(OrdersFromId));
    for await (let [key, value] of Object.entries(OrdersFromId)) {
      quantity += value.quantity;
    }
    return quantity;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

exports.getOcModelNameAndPairValueFromUserId = async (id, prefix) => {
  try {
    const { oc_product_id } = await User.findOne({
      attributes: ["oc_product_id"],
      where: {
        id,
      },
      prefix,
    });
    const modelName = await OCProduct.findOne({
      where: {
        product_id: oc_product_id,
      },
      prefix,
    });
    return { model: modelName.model, pairValue: modelName.pair_value };
  } catch (error) {
    console.log(error);
    return { model: "", pairValue: "" };
  }
};

exports.getOCOrderProductsFromOrderId = async (order_id, prefix) => {
  try {
    const result = [];
    const products = await OcOrderProduct.findAll({
      where: {
        order_id,
      },
      prefix,
    });
    for await (let [key, value] of Object.entries(products)) {
      result[key] = {
        order_product_id: value.order_product_id,
        order_id: value.order_id,
        product_id: value.product_id,
        name: value.name,
        model: value.model,
        quantity: value.quantity,
        price: value.price,
        total: value.total,
        tax: value.tax,
        reward: value.reward,
        pair_value: value.pair_value,
      };
    }
    return result;
  } catch (error) {
    return [];
  }
};

exports.getOcOrderTotal = async (order_id, prefix) => {
  try {
    const orderResult = [];
    const result = await OcOrderTotal.findAll({
      where: {
        order_id,
      },
      prefix,
    });
    for await (let [key, value] of Object.entries(result)) {
      orderResult[key] = {
        code: value.code,
        value: value.value,
        title: value.title,
      };
    }
    return orderResult;
  } catch (error) {
    return [];
  }
};

exports.getEcomCustomerRefId = async (id, prefix) => {
  try {
    const { ecom_customer_ref_id } = await User.findOne({
      attaributes: ["ecom_customer_ref_id"],
      where: {
        id,
      },
      prefix,
    });
    return ecom_customer_ref_id == null ? 0 : ecom_customer_ref_id;
  } catch (error) {
    return 0;
  }
};

exports.checkUnapprovedUser = async (username, password, prefix) => {
  let pendingUser = await PendingUsers.findOne({
    where: {
      username: username,
      status: {
        [Op.ne]: "active",
      },
    },
    prefix,
  });
  if (!pendingUser) {
    return false;
  }
  let pendingDetails = JSON.parse(pendingUser.data);

  const validPassword = await bcrypt.compare(password, pendingDetails.password);

  if (password === pendingDetails.password) {
    return pendingUser;
  } else if (validPassword) {
    return pendingUser;
  } else {
    return false;
  }
};

async function getPercentage(achieved, required) {
  if (!required) {
    return 0;
  }
  let calc = parseInt((achieved / required) * 100);
  let result = calc > 100 ? 100 : calc;
  return result;
}

exports.getLiveBebValue = async (prefix) => {
  try {
    let bebValue = 1;
    // console.log("==========================beb value fetch=================");
    let bebLiveValue = await Configuration.findOne({ prefix });
    // console.log(
    //   bebLiveValue.beb_to_usdt_coin_value,
    //   "=====================configuration============="
    // );

    return bebLiveValue?.beb_to_usdt_coin_value
      ? Number(bebLiveValue.beb_to_usdt_coin_value)
      : 1;
  } catch {
    console.log(
      "==============================snmdcsxkdcnskddcnmskdj============="
    );
    return 1;
  }
};

exports.getSubAccountUsernames = async (id, prefix) => {
  try {
    var childList = await User.findAll({
      attributes: ["username"],
      where: {
        parent_id: id,
      },
      prefix,
    });
    // console.log(childList);
    return childList;
  } catch (error) {
    return [];
  }
};

exports.isSubAccount = async (id, prefix) => {
  try {
    const subAccount = await User.findOne({
      where: {
        id,
      },
      attributes: ["parent_id"],
      prefix,
    });
    console.log(
      "================sub data ====================",
      JSON.stringify(subAccount),
      subAccount.parent_id
    );
    if (subAccount.parent_id == null) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

exports.getSubAccountCount = async (id, prefix) => {
  try {
    const subAccount = await User.findAll({
      where: {
        parent_id: id,
      },
      attributes: ["id"],
      prefix,
    });
    if (subAccount == null) {
      return 0;
    } else {
      return subAccount.length;
    }
  } catch (error) {
    console.log(error);
  }
};

exports.getParentId = async (id, prefix) => {
  try {
    const parent = await User.findOne({
      where: { id },
      attributes: ["parent_id"],
      prefix,
    });
    if (parent.parent_id == null) {
      return id;
    } else if (parent.parent_id != null) {
      return parent.parent_id;
    }
  } catch (error) {
    console.log(error);
  }
};

const getSponsorPackageSlab = (exports.getSponsorPackageSlab = async (
  id,
  prefix
) => {
  try {
    const pack = await User.findOne({
      where: { id },
      attributes: ["id"],
      include: [
        {
          model: Package,
          as: "package",
          attributes: ["id", "package_type"],
        },
      ],
      prefix,
    });

    if (pack?.package?.package_type !== null) {
      return pack?.package?.package_type;
    }
    return false;
  } catch (error) {
    console.log(error);
  }
});

exports.getPencdingSubAccountCount = async (id, prefix) => {
  try {
    const parent = await PendingUsers.findAll({
      where: { sponsor_id: id, updated_id: null },
      attributes: ["id", "data"],
      prefix,
    });

    if (parent !== null) {
      var count = 0;
      parent.forEach((element) => {
        if (JSON.parse(element.data)?.parent_id) {
          count++;
        }
      });
      // console.log(count, "***********************************************");
      return count;
    }
    return 0;
  } catch (error) {
    console.log(error);
  }
};

//tree link
exports.createTreeLink = async (id, username, title, prefix) => {
  try {
    var Prefix = prefix.replace("_", "");
    let stringToken = await Tokens.findOne({
      where: {
        user_id: id,
      },
      prefix,
    });

    if (stringToken.token) {
      let decoded = false;
      try {
        let decodedData = jwt.verify(stringToken.token, process.env.TOKEN_KEY);
        console.log(
          Number(
            Number(decodedData.exp) - Number(Math.floor(Date.now() / 1000))
          ),
          decodedData.exp,
          Math.floor(Date.now()),
          "*************************************"
        );
        decoded =
          decodedData.exp - Math.floor(Date.now() / 1000) > 3600 ? true : false;
      } catch (error) {
        console.log("==================error===============", error);
        decoded = false;
      }

      console.log("===========================decoded", decoded);
      if (decoded) {
        console.log(JSON.stringify(stringToken));
        let url = `${process.env.SITE_URL}/?title=${title}&prefix=${Prefix}&string=${stringToken.token}`;
        console.log();
        return url;
      }
    }
    const accessToken = jwt.sign(
      {
        username: username,
        id: id, // approveStatus:
        user_type: "user",
      },
      process.env.TOKEN_KEY,
      {
        expiresIn: "24h",
      }
    );
    let newToken = await stringToken.update(
      {
        token: accessToken,
      },
      {},
      prefix
    );
    let url = `${process.env.SITE_URL}/?title=${title}&prefix=${Prefix}&string=${newToken.token}`;
    return url;
  } catch (error) {
    console.log(error);
    return "";
  }
};

exports.getUnapprovedIdOfUserId = async (userId, prefix) => {
  try {
    let pendingId = await PendingUsers.findOne({
      attributes: ["id"],
      where: {
        updated_id: userId,
      },
      prefix,
    });
    console.log(
      "=============pending id ==================================",
      pendingId?.id
    );
    return pendingId?.id ? pendingId?.id : null;
  } catch (error) {
    console.log(error);
    return false;
  }
};

exports.convertToIpUrl = async (url) => {
  try {
    const index = url.indexOf("/api");
    const result = url.slice(index);
    let newUrl = `${process.env.MOB_IMG_URL}${result}`
    return newUrl
  } catch (error) {
    console.log(error);
    return ""
  }
};
