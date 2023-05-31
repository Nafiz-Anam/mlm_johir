const db = require("../../models");
const common = require("../../utils/app/common");
const modStatus = require("../../utils/app/moduleStatus");
const replicaService = require("../../utils/app/replicaService");
const { successMessage, errorMessage } = require("../../utils/app/response");
const SiteInfo = db.siteInfo;
const UserDetails = db.userDetails;
const uploadFile = require("../../middleware/app/bankUpload");
const Common = require("../../utils/app/common");
const {
  getUploadConfig,
  getUploadCount,
  storeBTReceipt,
} = require("../../utils/app/uploadServices");
const { mlm_laravel } = require("../../models");
const multer = require("multer");

exports.home = async (req, res) => {
  let { replica_user } = req.query;
  replicaContent = {};
  const prefix = req.headers["api-key"];
  if (!prefix) {
    let response = await errorMessage({ code: 1001 });
    return res.json(response);
  }
  let replica_id = await common.usernameToId(replica_user, prefix);

  if (!replica_id) {
    let response = await errorMessage({ code: 1070 });
    return res.json(response);
  }
  let moduleStatus = await modStatus.getModuleStatus(prefix);

  let banners = await replicaService.selectBanner(replica_id, prefix);
  replicaContent = await replicaService.GetReplicaContent(
    replica_id,
    1,
    prefix
  );
  let companyName = await SiteInfo.findOne({
    attributes: ["name"],
    prefix,
  });
  let details = await UserDetails.findOne({
    attributes: ["name", "second_name", "email", "mobile"],
    where: {
      user_id: replica_id,
    },
    prefix,
  });
  let userDetails = {
    fullname: `${details?.name} ${details?.second_name}`,
    email: details?.email,
    phone: details?.mobile,
  };
  let registrationUrl = `${process.env.REPLICA_URL}/replica_register/${replica_user}`;
  if (moduleStatus.ecom_status) {
    registrationUrl = await common.createEcomLink(
      replica_id,
      "register",
      prefix
    );
  }
  let relicacontentObject = replicaContent.reduce(
    (obj, item) => Object.assign(obj, { [item.key]: item.value }),
    {}
  );

  let data = {
    title: `${companyName.name} | HOME`,
    regsitration_url: registrationUrl,
    banners: banners[0]?.image,
    content: relicacontentObject,
    user_details: userDetails,
    company_name: companyName.name,
    OPTIONAL_MODULE: true,
  };
  let response = await successMessage({
    value: data,
  });
  return res.json(response);
};

exports.loadTopBanner = async (req, res) => {
  let { replica_user } = req.query;
  const prefix = req.headers["api-key"];
  if (!prefix) {
    let response = await errorMessage({ code: 1001 });
    return res.json(response);
  }
  try {
    let replica_id = await common.usernameToId(replica_user, prefix);
    let banners = await replicaService.selectBanner(replica_id, prefix);
    let bannerList = banners[0]?.image;
    let data = {
      banner: bannerList,
    };
    let response = await successMessage({
      value: data,
    });
    return res.json(response);
  } catch (error) {
    return res.json(error.message);
  }
};

exports.policy = async (req, res) => {
  let { replica_user } = req.query;
  const prefix = req.headers["api-key"];
  if (!prefix) {
    let response = await errorMessage({ code: 1001 });
    return res.json(response);
  }
  try {
    let replica_id = await common.usernameToId(replica_user, prefix);
    let replicaContent = await replicaService.GetReplicaContent(
      replica_id,
      1,
      prefix
    );
    let companyName = await SiteInfo.findOne({
      attributes: ["name"],
      prefix,
    });
    let data = {
      title: `${companyName.name} | HOME`,
      content: replicaContent,
    };
    let response = await successMessage({
      value: data,
    });
    return res.json(response);
  } catch (error) {
    return res.json(error.message);
  }
};

exports.changeReplicaLanguage = async (req, res) => {};

exports.postContact = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }

    const moduleStatus = await modStatus.getModuleStatus(prefix);
    if (!moduleStatus.replicated_site_status) {
      let response = await errorMessage({ code: 403 });
      return res.status(422).json(response);
    }
    const resplica_id = await common.usernameToId(
      req.body["replica_user"],
      prefix
    );

    const insertContact = await replicaService.postContact(
      req.body,
      resplica_id,
      prefix
    );
    if (insertContact) {
      return res.json({
        status: true,
        code: 200,
        data: { message: "will_contact_you_shortly" },
      });
    } else {
      return res.status(422).json({
        status: false,
        code: 1030,
        data: { message: "error_occured_try_again_later" },
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(422).json({
      status: false,
      code: 1030,
      data: { message: "error_occured_try_again_later" },
    });
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

        var id = await Common.usernameToId(req.body.user_name, prefix);
        var username = req.body.user_name;

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
          null,
          prefix,
          t
        );

        if (result) {
          await t.commit();
          return res.json({
            status: true,
            data: {
              success: true,
              message: "payment_receipt_uploaded_successfully",
              file_name: req.file.filename,
            },
          });
        }
      }
    });
  } catch (err) {
    await t.rollback();
    console.log(err);
    res.status(422).json(err.message);
  }
};
