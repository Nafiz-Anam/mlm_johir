var crypto = require("crypto");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const common = require("../../utils/app/common");
const db = require("../../models");
const { encrypt } = require("../../middleware/app/encryption");
const CommonMailSettings = db.commonMailSettings;
const Company = db.companyDetails;
const mailSettings = db.mailSettings;
const ResetPass = db.passwordReset;
const TransPassReset = db.transPassReset;

exports.mailConfig = async (prefix) => {
  try {
    let settings = await mailSettings.findOne({
      prefix,
    });
    let transporter = nodemailer.createTransport({
      host: settings.smtp_host,
      port: settings.smtp_port,
      auth: {
        user: settings.smtp_username,
        pass: settings.smtp_password,
      },
      rejectUnauthorized: false,
      secureConnection: false,
      // tls: {
      //   ciphers: "SSLv3",
      // },
      logger: true,
      debug: true,
    });

    const handlebarOptions = {
      viewEngine: {
        partialsDir: __dirname + "/../../views/",
        defaultLayout: false,
      },
      viewPath: __dirname + "/../../views/",
    };
    let mail = transporter.use("compile", hbs(handlebarOptions));

    return mail;
  } catch (error) {
    console.log(error);
  }
};

exports.sendMail = async (Mail, types, username, email, mailArr, prefix) => {
  try {
    let mail = await CommonMailSettings.findOne({
      attributes: ["mail_content", "subject"],
      where: {
        mail_type: types,
      },
      prefix,
    });
    if (!mail) {
      if (types == "invite_mail") {
        var details = mailArr;
        var content = mailArr.mail_content;
      }
    } else {
      var details = mail;
    }
    let settings = await mailSettings.findOne({
      attributes: ["from_email"],
      prefix,
    });
    let company = await Company.findOne({
      attributes: ["name", "address", "logo"],
      prefix,
    });
    const user_id = await common.usernameToId(username, prefix);
    if (types == "forget_password") {
      let randomString = await createRandomToken(prefix);
      let userToken = await ResetPass.findOne({
        where: {
          user_id: user_id,
          status: 1,
        },
        prefix,
      });
      if (userToken) {
        await userToken.update(
          {
            token: randomString,
          },
          {},
          prefix
        );
      } else {
        await ResetPass.create(
          {
            user_id,
            token: randomString,
            status: 1,
          },
          { prefix }
        );
      }
      var content = mail.mail_content.replace(
        "{link}",
        `${process.env.SITE_URL}/reset_password/${randomString}`
      );
    }
    if (types == "forgot_transaction_password") {
      let randomString = await createRandomTransToken(prefix);
      let userToken = await TransPassReset.findOne({
        where: {
          user_id: user_id,
          status: 1,
        },
        prefix,
      });
      if (userToken) {
        await userToken.update(
          {
            token: randomString,
          },
          {},
          prefix
        );
      } else {
        await TransPassReset.create(
          {
            user_id,
            token: randomString,
            status: 1,
          },
          { prefix }
        );
      }
      var content = mail.mail_content.replace(
        "{{link}}",
        `${process.env.SITE_URL}/reset_tran_password/${randomString}`
      );
    }
    if (types == "payout_request") {
      let adminUsername = await common.getAdminUsername(prefix);
      var content = mail.mail_content.replace(
        "{{admin_user_name}}",
        `${adminUsername}`
      );
      content = content.replace("{{username}}", `${username}`);
      content = content.replace("{{payout_amount}}", `${mailArr.payoutAmount}`);
    }
    if (types == "registration") {
      var content = mail.mail_content.replace(
        "{{fullname}}",
        `${mailArr.firstName} ${mailArr.lastName}`
      );
      content = content.replace("{{company_name}}", `${company.name}`);
    }
    if (types == "registration_email_verification") {
      let encryptUsername = encrypt(username);
      if (process.env.DEMO_STATUS == "yes") {
        let adminUsername = await common.getAdminUsername(prefix);
        var encryptAdminUsername = encrypt(adminUsername);
        var content = mail.mail_content.replace(
          "{{company_name}}",
          `${company.name}`
        );
        content = content.replace(
          "{{full_name}}",
          `${mailArr.firstName} ${mailArr.lastName}`
        );
        content = content.replace(
          "{{link}}",
          `${process.env.SITE_URL}/confirm_email/${encryptUsername}/${encryptAdminUsername}`
        );
      } else {
        var content = mail.mail_content.replace(
          "{{company_name}}",
          `${company.name}`
        );
        content = content.replace(
          "{{full_name}}",
          `${mailArr.firstName} ${mailArr.lastName}`
        );
        content = content.replace(
          "{{link}}",
          `${process.env.SITE_URL}/confirm_email/${encryptUsername}`
        );
      }
    }

    let mailOptions = {
      from: settings.from_email,
      to: email,
      subject: `${details.subject}`,
      template: "email",
      context: {
        subject: `${details.subject}`,
        content: content,
        logo: company.logo,
        footer: company.address,
      },
    };
    let result = await Mail.sendMail(mailOptions);
    console.log("=======================", result);
    if (result) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

const createRandomToken = (exports.createRandomToken = async (prefix) => {
  try {
    var randomString = crypto.randomBytes(32).toString("hex");
    let check = await ResetPass.findOne({
      where: {
        token: randomString,
        status: 1,
      },
      prefix,
    });
    if (check) {
      await createRandomToken(prefix);
    }
    return randomString;
  } catch (error) {
    console.log(error);
  }
});

const createRandomTransToken = (exports.createRandomTransToken = async (
  prefix
) => {
  try {
    var randomString = crypto.randomBytes(32).toString("hex");
    let check = await TransPassReset.findOne({
      where: {
        token: randomString,
        status: 1,
      },
      prefix,
    });
    if (check) {
      await createRandomTransToken(prefix);
    }
    return randomString;
  } catch (error) {
    console.log(error);
  }
});
