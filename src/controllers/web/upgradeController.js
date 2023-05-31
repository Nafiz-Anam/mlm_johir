const db = require("../../models");
const RepurchaseServices = require("../../utils/web/repurchaseServices");
const Common = require("../../utils/web/common");
const { mlm_laravel } = require("../../models");
const { errorMessage } = require("../../utils/web/response");
const modStatus = require("../../utils/web/moduleStatus");
const UpgradeServices = require("../../utils/web/upgradeServices");
const UploadServices = require("../../utils/web/uploadServices");
const EWalletServices = require("../../utils/web/ewalletServices");
const PaymentGatewayServices = require("../../utils/web/paymentGatewayService");
const roiOrder = db.roiOrder;

exports.upgradePackage = async (req, res) => {
  let t = await mlm_laravel.transaction();
  try {
    let paymentResponse = false,
      paymentType,
      paymentStatus,
      upgradeResponse = false,
      paymentReceiptResult,
      pinDetails = [],
      stripeResponse;
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;
    const valuesFromBody = req.body;
    const product_id = Number(valuesFromBody.product_id);
    const moduleStatus = await modStatus.getModuleStatus(prefix);
    if (!moduleStatus.package_upgrade) {
      let response = await errorMessage({ code: 1067 });
      return res.json(response);
    }
    let packageId = await Common.getProductPackageId(
      valuesFromBody.product_id,
      "registration",
      prefix
    );
    let currentPackageId = await Common.getProductId(id, prefix);
    let currentPackageAmount = await Common.getCartProduct(
      currentPackageId,
      prefix
    );
    let newPackageAmount = await Common.getCartProduct(packageId, prefix);
    let paymentAmount = parseFloat(Number(newPackageAmount));
    //  -      parseFloat(Number(currentPackageAmount));
    const sponsorId = await Common.getSponsorId(id, prefix);
    switch (valuesFromBody.payment_method) {
      case "freejoin":
        paymentType = "free_upgrade";
        paymentResponse = true;
        paymentStatus = "confirmed";
        break;
      case "banktransfer":
        paymentReceiptResult = await UploadServices.getReceipt(
          "",
          id,
          "package_upgrade",
          prefix
        );
        paymentType = "bank_transfer";
        paymentResponse = true;
        paymentStatus = "pending";
        break;
      case "epin":
        paymentType = "epin";
        let pinCount = valuesFromBody.pin_array;
        for (let i = 0; i < pinCount; i++) {
          pinDetails[i] = {
            pin: valuesFromBody["epin" + (i + 1)],
          };
        }
        let pinArray = await RepurchaseServices.checkAllEpins(
          pinDetails,
          product_id,
          moduleStatus,
          sponsorId,
          "package_upgrade",
          id,
          prefix
        );
        if (pinArray[0].isPinOk == false) {
          let response = await errorMessage({ code: 1049 });
          return res.status(500).json(response);
        }
        let responseUpdateUsedUserEpin =
          await RepurchaseServices.UpdateUsedUserEpin(pinArray, id, prefix, t);
        if (responseUpdateUsedUserEpin) {
          //TODO insert into used epin
          // let paymentReponse = await RepurchaseServices.insertUsedPin(
          //   pinArray,
          //   id,
          //   "package_upgrade",
          //   false,
          //   "no",
          //   prefix,
          //   t
          // );
          paymentStatus = "confirmed";
          paymentResponse = true;
        } else {
          let response = await errorMessage({ code: 1044 });
          return res.status(500).json(response);
        }
        break;
      case "ewallet":
        let response;
        paymentType = "ewallet";
        let ewalletUser = valuesFromBody.user_name_ewallet;
        let ewalletTransactionPassword = valuesFromBody.tran_pass_ewallet;
        let validated = await EWalletServices.validatePayment(
          ewalletUser,
          ewalletTransactionPassword,
          product_id,
          "package_upgrade",
          id,
          prefix
        );
        console.log("======validate payment ============", validated);
        switch (validated) {
          case "passwordError":
            response = await errorMessage({ code: 1015 });
            return res.status(500).json(response);
          case "insufficientEwalletBalance":
            response = await errorMessage({ code: 1014 });
            return res.status(500).json(response);
          case "invalidTransactionDetails":
            response = await errorMessage({ code: 1039 });
            return res.status(500).json(response);
          case true:
            paymentType = "ewallet";
            let payUsingEwallet = await EWalletServices.runPayment(
              ewalletUser,
              ewalletTransactionPassword,
              product_id,
              "package_upgrade",
              "upgrade",
              prefix,
              t
            );
            console.log(
              "========================payment success================",
              payUsingEwallet
            );
            if (payUsingEwallet == false) {
              response = await errorMessage({ code: 429 });
              return res.json(response);
            }
            paymentStatus = "confirmed";
            paymentResponse = true;
            break;
          default:
            response = await errorMessage({ code: 429 });
            return res.json(response);
        }
        break;
      case "stripe":
        paymentType = "stripe";
        const description = "Package Upgrade";
        stripeResponse = await PaymentGatewayServices.stripePayment(
          valuesFromBody.stripe_token,
          paymentAmount,
          description
        );
        if (stripeResponse == false) {
          let response = await errorMessage({ code: 429 });
          return res.status(500).json(response);
        }
        isStripeOk = true;
        const insertHistory =
          await PaymentGatewayServices.insertInToStripePaymentActivity(
            id,
            stripeResponse,
            valuesFromBody.product_id,
            null,
            paymentAmount,
            "Package Upgrade",
            prefix,
            t
          );
        if (insertHistory == true) {
          paymentStatus = "confirmed";
          paymentResponse = true;
        } else {
          let response = await errorMessage({ code: 429 });
          return res.status(500).json(response);
        }
        break;
      default:
        let respo = await errorMessage({ code: 1049 });
        return res.status(500).json(respo);
    }

    if (paymentResponse && paymentStatus == "confirmed") {
      // TODO Change payment method to id in line 163 for every single payment type
      upgradeResponse = await UpgradeServices.upgradeMembershipPackage(
        id,
        currentPackageId,
        product_id,
        packageId,
        paymentAmount,
        valuesFromBody.payment_method,
        moduleStatus,
        paymentStatus,
        prefix,
        t
      );
      let packageName = await Common.getPackageNameFromPackageId(
        packageId,
        moduleStatus,
        prefix
      );
      // let roiOrder = await roiOrder.create(
      //   {
      //     package_id: packageId,
      //     user_id: id,
      //     amount: paymentAmount,
      //     date_submission: Date.now(),
      //     payment_method: valuesFromBody.payment_method,
      //     pending_status: 1,
      //     roi: 15,
      //     days: 365,
      // max_amount: paymentAmount * 3,
      // commission_amount: 0,
      //   },
      //   {
      //     transaction: t,
      //     prefix,
      //   }
      // );

      //TODO user activity history
    } else if (paymentResponse && paymentStatus == "pending") {
      let packageName = await Common.getPackageNameFromPackageId(
        product_id,
        moduleStatus,
        prefix
      );
      let paymentReceipt = paymentReceiptResult.receipt;
      upgradeResponse = await UpgradeServices.upgradeMembershipPackagePending(
        id,
        currentPackageId,
        product_id,
        packageId,
        paymentAmount,
        paymentType,
        moduleStatus,
        paymentStatus,
        paymentReceipt,
        prefix,
        t
      );
      //TODO INSERT USER ACTIVITY
    }
    if (upgradeResponse && paymentType != "bank_transfer") {
      await t.commit();
      return res.json({
        status: true,
        data: { message: "package_upgrade_success" },
      });
    } else if (upgradeResponse && paymentType == "bank_transfer") {
      await t.commit();
      return res.json({
        status: true,
        data: { message: "admin_approval_required" },
      });
    } else {
      await t.rollback();
      let response = await errorMessage({ code: 1030 });
      return res.status(422).json(response);
    }
  } catch (err) {
    console.log(err);
    await t.rollback();
    return res.status(500).json(err.message);
  }
};
