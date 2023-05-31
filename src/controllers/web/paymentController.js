const db = require("../../models");
const { errorMessage, successMessage } = require("../../utils/web/response");
const Payment = db.paymentConfig;
const uploadFile = require("../../middleware/web/bankUpload");
const {
  getUploadConfig,
  getUploadCount,
  storeBTReceipt,
  updateUploadCount,
} = require("../../utils/web/uploadServices");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const { mlm_laravel } = require("../../models");
const modStatus = require("../../utils/web/moduleStatus");
const Common = require("../../utils/web/common");
const RepurchaseServices = require("../../utils/web/repurchaseServices");
const EWalletServices = require("../../utils/web/ewalletServices");
const PurchaseServices = require("../../utils/web/purchaseServices");
const multer = require("multer");

exports.getPaymentMethod = async (req, res) => {
  const { type } = req.query;
  if (!type) {
    let response = await errorMessage({ code: 1004 });
    return res.json(response);
  }
  const prefix = req.headers["api-key"];
  if (!prefix) {
    let response = await errorMessage({ code: 1001 });
    return res.json(response);
  }
  try {
    let data = [];
    let availablePaymentGateways = await Payment.findAll({
      where: {
        status: 1,
        [type]: 1,
      },
      prefix,
    });
    Object.entries(availablePaymentGateways).map(([key, value]) => {
      let icon, title, code;
      switch (value.name) {
        case "Paypal":
          icon = "fa fa-paypal";
          title = "paypal_status";
          code = "paypal";
          break;
        case "Authorize.Net":
          icon = "fa fa-lock";
          title = "authorize_status";
          code = "authorize";
          break;
        case "Bitcoin":
          icon = "fa fa-btc";
          title = "bitcoin_status";
          code = "bitcoin";
          break;
        case "Blockchain":
          icon = "fa fa-asterisk";
          title = "blockchain_status";
          code = "blockchain";
          break;
        case "Bitgo":
          icon = "fa fa-btc";
          title = "bitgo_status";
          code = "bitgo";
          break;
        case "Payeer":
          icon = "fa fa-product-hunt";
          title = "payeer_status";
          code = "payeer";
          break;
        case "Sofort":
          icon = "fa fa-euro";
          title = "sofort_status";
          code = "sofort";
          break;
        case "SquareUp":
          icon = "fa fa-square";
          title = "squareup_status";
          code = "squareup";
          break;
        case "E-pin":
          icon = "fa fa-window-restore";
          title = "epin_status";
          code = "epin";
          break;
        case "E-wallet":
          icon = "fa fa-archive";
          title = "ewallet_status";
          code = "ewallet";
          break;
        case "Bank Transfer":
          icon = "fa fa-bank";
          title = "banktransfer_status";
          code = "banktransfer";
          break;
        case "Free Joining":
          icon = "fa fa-cog";
          title = "freejoin_status";
          code = "freejoin";
          break;
        case "Stripe":
          icon = "fa fa-cc-stripe";
          title = "stripe";
          code = "stripe";
          break;
        case "Wallet":
          icon = "fa fa-btc";
          title = "usdtWallet";
          code = "wallet";
          break;
        default:
          break;
      }
      data[key] = {
        code,
        value: value.status == "1" ? true : false,
        title,
        icon,
      };
    });
    if (type == "repurchase") {
      let totalArray = data.length;
      data[totalArray] = {
        code: "purchase_wallet",
        value: true,
        title: "purchase_wallet",
        icon: "fa fa-shopping-basket",
      };
    }
    return res.json({ status: true, data });
  } catch (err) {
    res.json(err.message);
  }
};

exports.uploadBankPaymentReceipt = async (req, res) => {
  t = await mlm_laravel.transaction();
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }

    await uploadFile(req, res, async function (err) {
      if (err != undefined) {
        if (err instanceof multer.MulterError) {
          if (err.code == "LIMIT_FILE_SIZE") {
            let response = await errorMessage({ code: 1018 });
            return res.status(500).json(response);
          }
        } else if (err) {
          // An unknown error occurred when uploading.
          if (err.message == "Only images jpg|jpeg|png|pdf are allowed") {
            let response = await errorMessage({ code: 1017 });
            return res.status(500).json(response);
          } else {
            let response = await errorMessage({ code: 1024 });
            return res.status(500).json(response);
          }
        }
      } else {
        const { type } = req.body;
        if (req.user) {
          var { id } = req.user;
        } else {
          var id = await Common.usernameToId(req.body.user_name, prefix);
          var username = req.body.user_name;
        }
        if (!req.file) {
          let response = await errorMessage({ code: 1032 });
          return res.json(response);
        }
        const upload_config = await getUploadConfig(prefix);
        const upload_count = await getUploadCount(id, prefix);
        if (upload_count >= upload_config) {
          let response = await errorMessage({ code: 1038 });
          return res.json(response);
        }

        let fileName = `${process.env.image_url}bank/${req.file.filename}`;
        let result = await storeBTReceipt(
          username,
          fileName,
          type,
          id,
          prefix,
          t
        );
        if (req?.user?.id) {
          var updateUploadCountResult = await updateUploadCount(id, prefix, t);
          if (result && updateUploadCountResult) {
            await t.commit();
            return res.json({
              status: true,
              data: {
                success: true,
                message: "payment_receipt_uploaded_successfully",
                file_name: `${process.env.image_url}bank/${req.file.filename}`,
              },
            });
          } else {
            await t.rollback();
            let response = await errorMessage({ code: 1024 });
            return res.json(response);
          }
        } else {
          if (result) {
            await t.commit();
            return res.json({
              status: true,
              data: {
                success: true,
                message: "payment_receipt_uploaded_successfully",
                file_name: `${process.env.image_url}bank/${req.file.filename}`,
              },
            });
          }
        }
      }
    });
  } catch (err) {
    await t.rollback();
    console.log(err);
    res.status(500).json(err.message);
  }
};

exports.checkEpinValidity = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }

    if (req.user) {
      var { id } = req.user;
    } else {
      var id = await Common.usernameToId(req.body.user_name, prefix);
    }

    let pinDetails = req.body.pin_array;
    let paymentType = req.body.payment_type;
    let flag = false,
      pinArray;
    const moduleStatus = await modStatus.getModuleStatus(prefix);
    const sponsorId = await Common.getSponsorId(id, prefix);
    let sponsorUserName = await Common.idToUsername(sponsorId, prefix);
    if (sponsorUserName != null) {
      let userActiveOrNot = await Common.isUserAvailable(
        sponsorUserName,
        prefix
      );
      if (userActiveOrNot) {
        flag = true;
      }
    }
    if (flag) {
      if (paymentType == "repurchase") {
        let totalPurchaseAmount = await Common.totalCartAmount(id, prefix);
        pinArray = await RepurchaseServices.validateAllEpins(
          pinDetails,
          totalPurchaseAmount,
          id,
          prefix
        );
      } else {
        let productIdFromBody = req.body.product_id;
        pinArray = await RepurchaseServices.checkAllEpins(
          pinDetails,
          productIdFromBody,
          moduleStatus.product_status,
          sponsorId,
          paymentType,
          id,
          prefix
        );
      }
      return res.json({ status: true, data: pinArray });
    } else {
      let response = await errorMessage({ code: 403 });
      return res.json(response);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(err.message);
  }
};

exports.checkEwalletBalance = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { user_name, product_id, payment_type } = req.body;
    if (req.user) {
      var { id, username } = req.user;
    } else {
      var id = await Common.usernameToId(user_name);
    }

    if (req.user) {
      if (username != user_name) {
        return res.json({
          status: false,
          error: { code: 1039, description: "Invalid Transaction Details" },
        });
      }
    }
    const ewalletPassword = req.body.ewallet;
    const ewalletUserId = await Common.usernameToId(user_name, prefix);
    if (ewalletUserId == false) {
      return res.json({
        status: false,
        error: { code: 1039, description: "Invalid Transaction Details" },
      });
    }
    let validateEwalletPassword = await EWalletServices.checkEwalletPassword(
      ewalletUserId,
      ewalletPassword,
      prefix
    );
    if (!validateEwalletPassword) {
      let response = await errorMessage({ code: 1003 });
      return res.json(response);
    }

    let userBalanceAmount = await EWalletServices.getBalanceAmountWallet(
      ewalletUserId,
      prefix
    );
    if (userBalanceAmount > 0) {
      let totalAmount = await EWalletServices.getTotalPaymentAmount(
        payment_type,
        product_id,
        prefix,
        id
      );
      if (totalAmount == false) {
        let response = await errorMessage({ code: 1014 });
        return res.status(500).json(response);
      }
      let response = await successMessage({ code: 200 });
      return res.json(response);
    } else {
      let response = await errorMessage({ code: 1014 });
      return res.status(500).json(response);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(err.message);
  }
};

exports.checkPurchaseWalletBalance = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id, username } = req.user;
    const { user_name, ewallet, amount } = req.body;
    if (user_name != username) {
      let response = await errorMessage({ code: 1039 });
      return res.json(response);
    }
    const validatePurchaseWalletPassword =
      await EWalletServices.checkEwalletPassword(id, ewallet, prefix);
    if (validatePurchaseWalletPassword == false) {
      let response = await errorMessage({ code: 1039 });
      return res.json(response);
    }
    let userBalanceAmount = await PurchaseServices.getPurchaseWalletAmount(
      id,
      prefix
    );
    if (userBalanceAmount > 0) {
      if (userBalanceAmount >= amount) {
        let response = await successMessage({ code: 204 });
        return res.json(response);
      } else {
        let response = await errorMessage({ code: 1025 });
        return res.json(response);
      }
    } else {
      let response = await errorMessage({ code: 1025 });
      return res.json(response);
    }
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
