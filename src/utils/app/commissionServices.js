const axios = require("axios");
const JSEncrypt = require("node-jsencrypt");
const FormData = require("form-data");
import fs from "fs";
import { join } from "path";
const db = require("../../models");
const Compensation = db.compensation;
const userCommission = db.userCommissionStatus;

exports.commissionCall = async (user_id, regr, action, prefix) => {
  try {
    console.log("********** Commission call started **********");
    console.log(
      `sponsor id is ${regr.sponsorId} product id is ${regr.productId} product pv is ${regr.productPV} product amount is ${regr.productAmount}`
    );
    let keyPath = join(__dirname, "../../public_key.pem");
    let data = {
      action: action,
      user_id: user_id,
      sponsor_id: regr.sponsorId ? regr.sponsorId : null,
      product_id: regr.productId ? regr.productId : null,
      product_pv: regr.productPV,
      price: regr.productAmount,
      oc_order_id: 0,
      quantity: 1,
      upline_id: regr.placementId ? regr.placementId : null,
      position: regr.position ? regr.position : null,
    };
    let statusId = await userCommission.create(
      {
        user_id: user_id,
        data: JSON.stringify(data),
        commission: "user_commission",
        status: 0,
        date: Date.now(),
      },
      { prefix }
    );
    data["status_id"] = statusId.id;
    let insertData = JSON.stringify(data);
    let secretKey = process.env.commission_prefix;
    const publicKey = fs.readFileSync(keyPath, "utf-8");
    const jsEncrypt = new JSEncrypt();
    jsEncrypt.setPublicKey(publicKey);
    var encryptData = jsEncrypt.encrypt(insertData);
    var encryptKey = jsEncrypt.encrypt(secretKey);
    let form = new FormData();
    form.append("enc_data", encryptData);
    let Prefix = prefix.replace("_", "");
    var commission = await axios.post(
      `${process.env.commission_url}run_calculation`,
      form,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          prefix: Prefix,
          SECRET_KEY: encryptKey,
        },
      }
    );
    console.log(commission);
    if (commission) {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
};
