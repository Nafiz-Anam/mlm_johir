const db = require("../../models");
const modStatus = require("../../utils/web/moduleStatus");
const { errorMessage, successMessage } = require("../../utils/web/response");
const donationServices = require("../../utils/web/donationServices");
const DonationConfiguration = db.donationConfigurations;
const Common = require("../../utils/web/common");
const { mlm_laravel } = require("../../models");
const axios = require("axios");
const JSEncrypt = require('node-jsencrypt')
const FormData = require("form-data");
import fs from "fs";
import {join} from "path";

exports.receiveDonationReport = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;
    const moduleStatus = await modStatus.getModuleStatus(prefix);
    if (moduleStatus.mlm_plan != "Donation") {
      let response = await errorMessage({ code: 1057 });
      return res.status(500).json(response);
    }
    let totalPayout = await donationServices.getRecieveDonationReport(
      id,
      "",
      "",
      "",
      prefix
    );
    let count = totalPayout.length;
    return res.json({
      status: true,
      data: { data: totalPayout, total_count: count },
    });
  } catch (Err) {
    return res.status(500).json(Err.message);
  }
};

exports.sendDonationReport = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;
    const moduleStatus = await modStatus.getModuleStatus(prefix);
    if (moduleStatus.mlm_plan != "Donation") {
      let response = await errorMessage({ code: 1057 });
      return res.status(500).json(response);
    }
    let totalPayout = await donationServices.getSentDonationReport(
      id,
      "",
      "",
      prefix
    );
    let count = totalPayout.length;
    return res.json({
      status: true,
      data: { data: totalPayout, total_count: count },
    });
  } catch (Err) {
    return res.status(500).json(Err.message);
  }
};

exports.donationView = async (req, res) => {
  try {
    let nextLevel,
      nextLevelIndex,
      toUser = "",
      minAmount = 0,
      eligible,
      fontColor = "#ec564a",
      minReferalCount,
      referralCount,
      balance;
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;
    const { donation_type } = await DonationConfiguration.findOne({ prefix });
    const moduleStatus = await modStatus.getModuleStatus(prefix);
    if (donation_type == "automatic" || moduleStatus.mlm_plan != "Donation") {
      let response = await errorMessage({ code: 1057 });
      return res.json(response);
    }
    let currentLevel = await donationServices.getCurrentLevel(id, prefix);
    let rateTable = await donationServices.getDonationAmountTotal(prefix);
    if (currentLevel <= 3) {
      nextLevelIndex = rateTable[`index${currentLevel}`];
      nextLevel = rateTable[`level${currentLevel}`];
      minReferalCount = await donationServices.getReferalCount(
        nextLevelIndex,
        prefix
      );
      minAmount = await donationServices.getDonationAmount(
        nextLevelIndex,
        "",
        prefix
      );
      //getreferalcount based on sponsorid (validation modal)
      referralCount = await Common.getReferalCount(id, prefix);
      balance = await Common.getUserBalanceAmount(id, prefix);
      if (balance < minAmount) {
        let response = await errorMessage({ code: 1025 });
        return res.status(500).json(response);
      } else if (referralCount < minReferalCount) {
        let response = await errorMessage({ code: 1058 });
        return res.status(500).json(response);
      } else {
        let userList = await donationServices.getLevelUser(
          nextLevelIndex,
          id,
          prefix
        );
        toUser = await Common.idToUsername(userList["to_user"], prefix);
        if (userList["exact_user"] != "") {
          admin = true;
        }
      }
      return res.json({
        status: true,
        data: {
          current_level: currentLevel,
          to_user: toUser,
          amount: minAmount,
          next_level: nextLevel,
          top_level: false,
        },
      });
    } else {
      return res.json({ status: true, data: { top_level: true } });
    }
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

//TODO check whether user level updates through python api call or not
exports.donate = async (req, res) => {
  let t = await mlm_laravel.transaction();
  try {
    let nextLevel,
      nextLevelIndex,
      toUser,
      userList,
      payment = "Normal(send mail)";
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;
    const { to_user } = req.body;
    if (!to_user) {
      let response = await errorMessage({ code: 1051 });
      return res.json(response);
    }
    let toUserId = await Common.usernameToId(to_user, prefix);
    if (toUserId == false) {
      let response = await errorMessage({ code: 1011 });
      return res.json(response);
    }

    let currentLevel = await donationServices.getCurrentLevel(id, prefix);
    let rateTable = await donationServices.getDonationAmountTotal(prefix);
    //TODO change max level next level
    if (currentLevel <= 3) {
      nextLevelIndex = rateTable[`index${currentLevel}`];
      nextLevel = rateTable[`level${currentLevel}`];
      minReferalCount = await donationServices.getReferalCount(
        nextLevelIndex,
        prefix
      );
      minAmount = await donationServices.getDonationAmount(
        nextLevelIndex,
        "",
        prefix
      );
      //getreferalcount based on sponsorid (validation modal)
      referralCount = await Common.getReferalCount(id, prefix);
      balance = await Common.getUserBalanceAmount(id, prefix);
      if (balance < minAmount) {
        let response = await errorMessage({ code: 1025 });
        return res.status(500).json(response);
      } else if (referralCount < minReferalCount) {
        let response = await errorMessage({ code: 1058 });
        return res.status(500).json(response);
      } else {
        userList = await donationServices.getLevelUser(
          nextLevelIndex,
          id,
          prefix
        );
        toUser = await Common.idToUsername(userList["to_user"], prefix);
      }
      let transactionDetails = await Common.createUniqueTransaction(prefix, t);
      if (transactionDetails == false) {
        let response = await errorMessage({ code: 1059 });
        return res.json(response);
      } else {
        //API CALL
        let keyPath = join(
          __dirname,
          "../public_key.pem");
        let data = {
          'from_user' : id,
          'to_user' : userList["to_user"],
          'trans_amount' : minAmount,
          'payment_method' : payment,
          'level' : nextLevelIndex,
          'transaction_id' : transactionDetails,
          'exact_user' : userList["exact_user"]
        }
        let insertData = JSON.stringify(data)
        let secretKey = JSON.stringify(process.env.commission_prefix)
        const publicKey = fs.readFileSync(keyPath,'utf-8')
        const jsEncrypt = new JSEncrypt();
        jsEncrypt.setPublicKey(publicKey);
        var encryptData = jsEncrypt.encrypt(insertData)
        var encryptKey = jsEncrypt.encrypt(secretKey)
        let form = new FormData();
        form.append('enc_data',encryptData);
        var response = await axios.post(
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
        if (response == false) {
          let response = await errorMessage({ code: 1059 });
          return res.json(response);
        } else {
          await t.commit();
          return res.json({ status: true });
        }
      }
    } else {
      await t.rollback();
      let response = await errorMessage({ code: 1059 });
      return res.json(response);
    }
  } catch (error) {
    await t.rollback();
    return res.status(500).json(err.message);
  }
};
