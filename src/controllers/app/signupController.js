const db = require("../../models");
const modStatus = require("../../utils/app/moduleStatus");
const Str = require("@supercharge/strings");
const { successMessage, errorMessage } = require("../../utils/app/response");
var _ = require("lodash");
const { encrypt } = require("../../middleware/app/encryption");
const bcrypt = require("bcryptjs");
const { mlm_laravel } = require("../../models");
const common = require("../../utils/app/common");
const passPolicy = require("../../utils/app/passwordPolicy");
const termsAndCondition = require("../../utils/app/termsAndCondition");
const Country = require("../../utils/app/allCountries");
const States = require("../../utils/app/allStates");
const { Op, Sequelize, QueryTypes, json } = require("sequelize");
const RepurchaseServices = require("../../utils/app/repurchaseServices");
const PaymentGatewayServices = require("../../utils/app/paymentGatewayService");
const SignUpServices = require("../../utils/app/signupService");
const CommissionServices = require("../../utils/app/commissionServices");
const moment = require("moment");
const User = db.user;
const UserDetails = db.userDetails;
const paymentConfig = db.paymentConfig;
const signUpSettings = db.signupSettings;
const userConfig = db.usernameConfig;
const packages = db.pack;
const transPass = db.transPassword;
const pendingUser = db.pendingRegistration;
const Config = db.configuration;
const signField = db.signupField;
const Tree = db.treepath;
const ewalletDetails = db.ewalletPaymentDetails;
const ewalletHistory = db.ewalletHistory;
const spnorTree = db.sponsorTree;
const LegDetails = db.legDetails;
const usrReg = db.userRegistration;
const usrBalance = db.userBalance;
const legDetails = db.legDetails;
const siteInformation = db.siteInfo;
const letterConfig = db.letterConfig;
const BankDetails = db.bankDetails;
const Transactions = db.transactions;
const RoiOrder = db.roiOrder;
const Package = db.pack;

exports.getRegister = async (req, res) => {
  console.log("===================get register =================");
  const prefix = req.headers["api-key"];
  if (!prefix) {
    let response = await errorMessage({ code: 1001 });
    return res.json(response);
  }
  const user_id = req.user.id;
  const { username, position } = req.query;
  try {
    const settings = await signUpSettings.findOne({ prefix });
    let moduleStatus = await modStatus.getModuleStatus(prefix);
    if (settings.registration_allowed == "no") {
      let response = await errorMessage({
        code: 1057,
      });
      res.json(response);
    }
    let placementUsername = username ? username : "";
    let placementPosition = position ? position : "";

    const loggedUser = await User.findOne({
      where: {
        id: user_id,
      },
      prefix,
    });
    const loggedUserDetails = await UserDetails.findOne({
      where: {
        user_id: user_id,
      },
      prefix,
    });

    const sponsorField = [
      {
        code: "sponsorUserName",
        title: "Sponser Username",
        required: true,
        value: loggedUser.username,
        isEditable: false,
        type: "text",
        field_name: "sponsor_user_name",
      },
      {
        code: "sponsorFullName",
        title: "Sponser Fullname",
        required: false,
        value: `${loggedUserDetails.name} ${loggedUserDetails.second_name}`,
        isEditable: false,
        type: "text",
        field_name: "sponsor_full_name",
      },
    ];
    if (placementUsername) {
      const placedUser = await User.findOne({
        where: {
          username: placementUsername,
        },
        prefix,
      });
      const placedUserDetails = await UserDetails.findOne({
        where: {
          user_id: placedUser.id,
        },
        prefix,
      });
      let placementField = [
        {
          code: "placementUserName",
          title: "Placement Fullname",
          required: false,
          value: placementUsername,
          isEditable: false,
          type: "text",
          field_name: "placement_user_name",
        },
        {
          code: "placementFullName",
          title: "Placement Fullname",
          required: false,
          value: `${placedUserDetails.name} ${placedUserDetails.second_name}`,
          isEditable: false,
          type: "text",
          field_name: "sponsor_full_name",
        },
      ];
      sponsorField.push(placementField);
    }
    if (moduleStatus.mlm_plan == "Binary") {
      let positionOption = [];
      if (!_.includes(["L", "R"], placementPosition) && placementPosition) {
        let response = await errorMessage({
          code: 1033,
        });
        res.json(response);
      }
      if (placementPosition) {
        positionOption = {
          title: placementPosition == "L" ? "left_leg" : "right_leg",
          code: placementPosition == "L" ? "leftLeg" : "rightLeg",
          value: placementPosition == "L" ? "L" : "R",
        };
      } else {
        positionOption = [
          {
            title: "left_leg",
            code: "leftLeg",
            value: "L",
          },
          {
            title: "right_leg",
            code: "rightLeg",
            value: "R",
          },
        ];
      }
      placementPosition = placementPosition ? placementPosition : "L";
      let positionField = {
        code: "position",
        title: "position",
        value: placementPosition,
        type: "select",
        field_name: "position",
        required: true,
        options: positionOption,
      };
      sponsorField.push(positionField);
    }
    if (moduleStatus.product_status) {
      var sponsorPackageSlabe = await common.getSponsorPackageSlab(
        user_id,
        prefix
      );

      var whereStatement = { type: "registration", active: 1 };
      if (sponsorPackageSlabe) {
        whereStatement["package_type"] = sponsorPackageSlabe;
      } else {
        return res.json({ statue: false, message: "Invalide package Type " });
      }
      let packageOption = [];
      var products = await packages.findAll({
        attributes: ["id", "name", "product_id", "price", "image"],
        where: whereStatement,
        prefix,
      });
      Object.entries(products).map(([key, value]) => {
        packageOption[key] = {
          code: value.name,
          value: value.product_id,
          productValue: value.price,
          title: `${value.name} (${value.price})`,
        };
      });
      let packageField = {
        code: "product",
        title: "Product",
        value: "",
        type: "select",
        required: true,
        field_name: "product_id",
        options: packageOption,
      };
      sponsorField.push(packageField);
    }
    let sponsor = {
      title: {
        code: moduleStatus.product_status ? "sponsorAndPackage" : "sponsor",
        title: "Sponsor and Package Information",
      },
      fields: sponsorField,
    };

    // contact information details

    let contactField = [];
    let contactInfo;
    const signupSettings = await signField.findAll({
      where: {
        status: 1,
      },
      prefix,
    });
    const countriesList = await Country.getAllCountries(prefix);
    let selectFields = ["country", "gender", "state", "date_of_birth"];
    Object.entries(signupSettings).map(([key, value]) => {
      if (_.includes(selectFields, value.name)) {
        switch (value.name) {
          case "gender":
            let field1 = {
              title: "Gender",
              code: "gender",
              value: "",
              type: "select",
              field_name: "gender",
              required: value.required ? true : false,
              options: [
                {
                  title: "Male",
                  code: "male",
                  value: "M",
                },
                {
                  title: "Female",
                  code: "female",
                  value: "F",
                },
                {
                  title: "Other",
                  code: "other",
                  value: "O",
                },
              ],
            };
            contactField.push(field1);
            break;
          case "country":
            let field2 = {
              title: "Country",
              code: "country",
              value: "",
              type: "select",
              field_name: "country",
              required: value.required ? true : false,
              options: countriesList,
            };
            contactField.push(field2);
            break;
          case "state":
            let field3 = {
              title: "State",
              code: "state",
              field_name: "state",
              value: null,
              type: "select",
              required: value.required ? true : false,
              options: [],
            };
            contactField.push(field3);
            break;
          case "date_of_birth":
            let field4 = {
              title: "Date of Birth",
              code: "dateOfBirth",
              value: "1990-01-01",
              type: "date",
              field_name: "date_of_birth",
              required: value.required ? true : false,
              validation: {
                agelimit: settings?.age_limit,
              },
            };
            contactField.push(field4);
            break;
          default:
            break;
        }
      } else {
        let code = value.name;
        let type = "text";
        let defaultValue = "";
        switch (value.name) {
          case "first_name":
            code = "firstName";
            defaultValue = "First Name";
            break;
          case "last_name":
            code = "lastName";
            break;
          case "mobile":
            type = "number";
            defaultValue = "9999999999";
            break;
          case "email":
            defaultValue = "email@gmail.com";
            break;
          case "address_line1":
            code = "addressLine1";
            break;
          case "address_line2":
            code = "addressLine2";
            break;
          case "pin":
            code = "pin";
            break;
          default:
            break;
        }
        let Field5 = {
          code: code,
          title: value.name,
          required: value.required ? true : false,
          isEditable: true,
          type: type,
          value: defaultValue,
          field_name: value.name,
        };
        contactField.push(Field5);
      }
      contactInfo = {
        title: {
          code: "contactInformation",
          title: "Contact Information",
        },
        fields: contactField,
      };
    });
    // login information details

    let loginField = [];
    const usernameSettings = await userConfig.findOne({ prefix });
    const passwdPolicy = await passPolicy.getPasswordPolicy(prefix);
    const terms = await termsAndCondition.getTermsAndCondition(prefix);
    let length = usernameSettings.length.split(",");
    let max = parseInt(length[1]);
    let min = parseInt(length[0]);
    if (usernameSettings.type != "dynamic") {
      let logField1 = {
        code: "userName",
        title: "User Name",
        required: true,
        isEditable: true,
        type: "text",
        field_name: "user_name_entry",
        validation: {
          min_length: min,
          max_length: max,
        },
      };
      loginField.push(logField1);
    }
    let logField2 = {
      code: "password",
      title: "Password",
      required: true,
      isEditable: true,
      type: "password",
      field_name: "pswd",
      validation: passwdPolicy,
    };
    loginField.push(logField2);
    let logField3 = {
      code: "confirmPassword",
      title: "Confirm Password",
      required: true,
      isEditable: true,
      type: "password",
      field_name: "pswd",
    };
    loginField.push(logField3);
    let logField4 = {
      code: "agree_terms",
      title: "I ACCEPT TERMS AND CONDITIONS",
      required: true,
      isEditable: true,
      type: "checkbox",
      content: terms,
      field_name: "agree_terms",
      value: false,
    };
    loginField.push(logField4);

    let loginInfo = {
      title: {
        code: "loginInformation",
        title: "login_information",
      },
      fields: loginField,
    };

    // payment information details
    let paymentField = [];
    let paymentMethodStatus = false;
    let registrationFee = await Config.findOne({
      attributes: ["reg_amount"],
      prefix,
    });
    if (registrationFee.reg_amount >= 0 && moduleStatus.product_status) {
      console.log("============iside if product status =======");
      paymentMethodStatus = true;
      let paymentDetails = await paymentConfig.findAll({
        attributes: ["name", "status"],
        where: {
          registration: 1,
        },
        prefix,
      });
      console.log(paymentDetails);
      paymentDetails = paymentDetails.filter((item) => {
        return item.name != "Free Joining";
      });
      console.log(paymentDetails, "========================================");
      Object.entries(paymentDetails).map(([key, value]) => {
        let icon, code, title;
        if (value.status) {
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
            default:
              break;
          }
        }
        paymentField[key] = {
          code: code,
          value: true,
          title: title,
          icon: icon,
        };
      });
    }
    console.log("==================payment fields =========", paymentField);
    let paymentInfo = {
      title: {
        code: "paymentType",
        title: "Payment Type",
      },
      fields: paymentField,
      registrationFee: registrationFee.reg_amount,
    };
    let data = {
      sponsor: sponsor,
      contactInfo: contactInfo,
      loginInformation: loginInfo,
      paymentMethods: paymentInfo,
      PaymentMethodsStatus: paymentMethodStatus,
    };
    let response = await successMessage({
      value: data,
    });
    console.log("==============response =============", response);
    res.json(response);
  } catch (err) {
    return res.json(err.message);
  }
};

exports.checkUsername = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const username = req.body.userName;
    if (/\s/.test(username)) {
      let response = await errorMessage({ code: 1010 });
      return res.status(500).json(response);
    }
    username = username.trim().toLowerCase();
    let result = await User.findAll({
      where: {
        username,
      },
      prefix,
    });
    if (result.length <= 0) {
      result = await pendingUser.findAll({
        where: {
          username,
        },
        prefix,
      });
    }
    if (result.length <= 0) {
      return res.json({ status: true, data: { valid: true } });
    } else {
      let response = await errorMessage({ code: 1010 });
      return res.status(500).json(response);
    }
  } catch (err) {
    return res.json(err.message);
  }
};

exports.checkLegAvailability = async (req, res) => {
  const prefix = req.headers["api-key"];
  if (!prefix) {
    let response = await errorMessage({ code: 1001 });
    return res.json(response);
  }

  var { sponsor_leg, sponsor_user_name, placement_user_name } = req.body;

  sponsor_leg = sponsor_leg ? sponsor_leg : "";
  sponsor_user_name = sponsor_user_name ? sponsor_user_name : "";
  placement_user_name = placement_user_name ? placement_user_name : "";

  try {
    const legStatus = await checkLeg(
      sponsor_leg,
      sponsor_user_name,
      placement_user_name,
      prefix
    );
    if (legStatus) {
      var data = {
        valid: true,
      };
      let response = await successMessage({
        value: data,
      });
      res.json(response);
    } else {
      let response = await errorMessage({
        code: 1033,
      });
      res.json(response);
    }
  } catch (err) {
    res.json(err.message);
  }
};

exports.getCheckLegAvailability = async (req, res) => {
  var { placement_user_name, position } = req.query;
  // return res.json(req.query)
  const prefix = req.headers["api-key"];
  if (!prefix) {
    let response = await errorMessage({ code: 1001 });
    return res.json(response);
  }
  try {
    const placementId = await User.findOne({
      where: {
        username: placement_user_name,
      },
      prefix,
    });
    if (!placementId) {
      let response = await errorMessage({
        code: 1043,
      });
      return res.json(response);
    }
    if (!_.includes(["L", "R"], position)) {
      let response = await errorMessage({
        code: 1033,
      });
      return res.json(response);
    }
    const checkPositionUsed = await User.count({
      where: {
        father_id: placementId,
        position: position,
      },
      prefix,
    });
    if (checkPositionUsed > 0) {
      let response = await errorMessage({
        code: 1033,
      });
      return res.json(response);
    }
    let response = await successMessage({
      value: {
        valid: true,
      },
    });
    res.json(response);
  } catch (err) {
    return res.json(err.message);
  }
};

exports.userRegister = async (req, res) => {
  var t = await mlm_laravel.transaction();
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const user_id = req.user.id;
    let regr = [],
      pinArray = [];
    var paymentStatus = [];
    var postArr = req.body;
    postArr.product_id = postArr?.product_id ? postArr.product_id : "product-0";
    postArr.user_name_entry = postArr["user_name_entry"].trim().toLowerCase();
    const users = await User.findOne({
      where: {
        id: user_id,
      },
      prefix,
    });
    if (!users) {
      let response = await errorMessage({
        code: 1011,
      });
      return response;
    }
    console.log("=====================level 1===========================");
    const moduleStatus = await modStatus.getModuleStatus(prefix);
    const settings = await signUpSettings.findOne({ prefix });
    // TODO Blocked user
    const sponsor = await User.findOne({
      where: {
        username: postArr.sponsor_user_name,
      },
      prefix,
    });
    if (postArr.placement_user_name) {
      var placementId = await User.findOne({
        attributes: ["id"],
        where: {
          username: postArr.placement_user_name,
        },
        prefix,
      });
    }
    if (
      !settings.registration_allowed &&
      !_.includes(["admin", "employee"], users.user_type)
    ) {
      let response = await errorMessage({
        code: 1034,
      });
      res.status(401).json(response);
    }
    const paymentDetails = await paymentConfig.findAll({
      attributes: ["name", "status"],
      where: {
        registration: 1,
      },
      prefix,
    });
    paymentStatus = paymentDetails.reduce(
      (obj, item) => ({
        ...obj,
        [item.name]: item.status ? true : false,
      }),
      {}
    );
    if (
      postArr.payment_method === "freejoin" &&
      !paymentStatus["Free Joining"]
    ) {
      let response = await errorMessage({
        code: 1035,
      });
      return res.json(response);
    }
    // console.log(
    //   postArr.product_id,
    //   "///////////////////////////////////////////"
    // );
    console.log("=====================level 1===========================");
    let ProductId = await packages.findOne({
      attributes: ["id"],
      where: {
        product_id: postArr.product_id,
      },
      prefix,
    });
    // console.log("**************************", ProductId.id);
    const usrConfig = await userConfig.findOne({ prefix });
    let activeTab = postArr.payment_method;
    regr = postArr;
    if (
      moduleStatus.mlm_plan == "Unilevel" &&
      moduleStatus.mlm_plan == "Stair_Step"
    ) {
      regr["placementUsername"] = postArr.sponsor_user_name;
    }
    const regAmount = await Config.findOne({
      attributes: ["reg_amount"],
      prefix,
    });
    regr["regAmount"] = regAmount.reg_amount;
    regr["productStatus"] = moduleStatus.product_status;
    regr["totalAmount"] = regr.reg_amount;
    regr["productId"] = ProductId?.id ? ProductId?.id : "product-1";
    // console.log(
    //   "*******************************************",
    //   ProductId?.id,
    //   "*************************"
    // );
    regr["productName"] = "";
    regr["productPV"] = "";
    regr["productAmount"] = 0;
    regr["productValidity"] = "";
    regr["joiningDate"] = moment(Date.now()).format("MMMM Do YYYY, h:mm:ss a");
    regr["activeTab"] = activeTab;
    regr["usernameType"] = usrConfig.user_name_type;
    regr["regFromTree"] = postArr.reg_from_tree ? postArr.reg_from_tree : false;
    regr["placementUsername"] = postArr.placement_user_name;
    regr["sponsorId"] = sponsor.id;
    regr["placementId"] = placementId?.id ? placementId?.id : "";
    regr["subAccount"] = postArr?.subAccount ? postArr?.subAccount : false;
    if (moduleStatus.product_status) {
      var product = await packages.findOne({
        where: {
          active: 1,
          product_id: postArr.product_id,
        },
        prefix,
      });
      regr["productName"] = product.name;
      regr["productPV"] = product.pair_value;
      regr["productAmount"] = product.price;
      regr["productValidity"] = product.validity;
      if (moduleStatus.subscription_status) {
        let currentDate = new Date();
        regr["productValidity"] = new Date(
          currentDate.setMonth(currentDate.getMonth() + regr["productValidity"])
        );
      } else {
        regr["productValidity"] = null;
      }
      regr["totalAmount"] =
        parseFloat(regr.regAmount) + parseFloat(regr.productAmount);
      regr["password"] = postArr.pswd;
    }
    // payment method checking
    let isFreejoinOk,
      isBankTransferOk,
      isEpinOk,
      isEwalletOk,
      isStripeOk,
      result,
      payment_status,
      ewalletBalance;
    console.log(
      ` ********************** module status and reg amount greater than 0 check ************************** `
    );
    if (moduleStatus.product_status && regr.regAmount >= 0) {
      let paymentType = "Free Joining";
      if (activeTab == "epin") {
        paymentType = "E-pin";
        let pinDetails = [];
        for (let i = 1; i <= postArr.pin_array; i++) {
          let pinNo = req.body["epin" + i];
          pinDetails[i - 1] = {
            pin: pinNo,
            i,
          };
        }
        pinArray = await RepurchaseServices.checkAllEpins(
          pinDetails,
          postArr.product_id,
          moduleStatus.product_status,
          sponsor.id,
          "registration",
          user_id,
          prefix
        );
        let hasNoPinValue = pinArray.some((pin) => pin["pin"] == "nopin");
        if (hasNoPinValue) {
          let response = await errorMessage({ code: 1016 });
          return res.json(response);
        }
        isEpinOk = true;
      } else if (activeTab == "ewallet") {
        paymentType = "E-wallet";
        usedAmount = regr["totalAmount"];
        var userTransPass = await transPass.findOne({
          attributes: ["password"],
          where: {
            user_id: user_id,
          },
          prefix,
        });
        var checkPassword = await bcrypt.compare(
          regr["tran_pass_ewallet"],
          userTransPass.password
        );
        if (checkPassword) {
          ewalletBalance = await usrBalance.findOne({
            attributes: ["balance_amount", "id"],
            where: { user_id: user_id },
            prefix,
          });
          if (ewalletBalance.balance_amount >= usedAmount) {
            isEwalletOk = 1;
          } else {
            let response = await errorMessage({ code: 1025 });
            return res.json(response);
          }
        } else {
          let response = await errorMessage({ code: 1015 });
          return res.json(response);
        }
      } else if (activeTab == "banktransfer") {
        paymentType = "Bank Transfer";
        isBankTransferOk = 1;
      } else if (activeTab == "freejoin") {
        paymentType = "Free Joining";
        isFreejoinOk = 1;
      } else if (activeTab == "stripe") {
        paymentType = "stripe";
        let desc = "Register new User";
        const stripePayment = await PaymentGatewayServices.stripePayment(
          req.body.stripe_token,
          regr.totalAmount,
          desc
        );
        let stripeProductId = await common.getProductIdFromPackageId(
          postArr.product_id,
          prefix
        );
        if (stripePayment.status == "succeeded") {
          const insertHistory =
            await PaymentGatewayServices.insertInToStripePaymentActivity(
              user_id,
              stripePayment,
              stripeProductId,
              null,
              regr.totalAmount,
              "Register",
              prefix,
              t
            );
          if (insertHistory == true) {
            isStripeOk = true;
          } else {
            let response = await errorMessage({ code: 1030 });
            return res.json(response);
          }
        } else {
          let response = await errorMessage({ code: 1030 });
          return res.json(response);
        }
      } else {
        let response = await errorMessage({
          code: 1036,
        });
        return res.json(response);
      }
      regr["paymentType"] = paymentType;
      regr["paymentMethod"] = paymentType;
      var pendingStatus = await paymentConfig.findOne({
        attributes: ["reg_pending_status"],
        where: {
          name: paymentType,
        },
        prefix,
      });
      var pendingSignupStatus = pendingStatus?.reg_pending_status;
      var emailVerification = await signUpSettings.findOne({
        attributes: ["email_verification"],
        prefix,
      });
      //TODO CHANGE PLACEMENT POSITION BASED ON PLAN
      if (isFreejoinOk) {
        console.log(
          "******************************************7777777*******************",
          pendingSignupStatus
        );
        result = await confirmRegister(
          regr,
          moduleStatus,
          pendingSignupStatus,
          emailVerification.email_verification,
          t,
          postArr,
          prefix,
          user_id
        );
        if (result.status) {
          payment_status = true;
        }
      } else if (isBankTransferOk) {
        result = await confirmRegister(
          regr,
          moduleStatus,
          pendingSignupStatus,
          emailVerification,
          t,
          postArr,
          prefix,
          user_id
        );
        if (result.status) {
          payment_status = true;
        }
      } else if (isStripeOk) {
        result = await confirmRegister(
          regr,
          moduleStatus,
          pendingSignupStatus,
          emailVerification,
          t,
          postArr,
          prefix,
          user_id
        );
        if (result.status) {
          payment_status = true;
        }
      } else if (isEpinOk) {
        let response = await RepurchaseServices.UpdateUsedUserEpin(
          pinArray,
          user_id,
          prefix,
          t
        );
        if (!response) {
          await t.rollback();
          let response = await errorMessage({ code: 429 });
          return res.json(response);
        }
        result = await confirmRegister(
          regr,
          moduleStatus,
          pendingSignupStatus,
          emailVerification,
          t,
          postArr,
          prefix,
          user_id
        );
        if (result.status) {
          let updatedusedepin = await RepurchaseServices.UpdateUsedEpin(
            pinArray,
            user_id,
            "",
            prefix,
            t
          );
          if (updatedusedepin) {
            payment_status = true;
          }
        } else {
          await t.rollback();
          let response = await errorMessage({ code: 429 });
          return res.json(response);
        }
      } else if (isEwalletOk) {
        let transactionId = Str.random(9);
        result = await confirmRegister(
          regr,
          moduleStatus,
          pendingSignupStatus,
          emailVerification,
          t,
          postArr,
          prefix,
          user_id
        );
        if (result.status) {
          const ewalletPayment = await insertUsedEwallet(
            user_id,
            result.user_id,
            usedAmount,
            ewalletBalance.balance_amount,
            transactionId,
            "registration",
            t,
            prefix
          );
          if (ewalletPayment) {
            let total =
              parseFloat(ewalletBalance.balance_amount) -
              parseFloat(usedAmount);
            await ewalletBalance.update(
              { balance_amount: total },
              { transaction: t }
            );
            payment_status = true;
          }
        }
      }
    } else {
      regr["by_using"] = "free joining";
      regr["paymentType"] = "free joining";
      let pendingSignupStatus = 0;
      const emailVerification = await signUpSettings.findOne({
        attributes: ["email_verification"],
        prefix,
      });
      result = await confirmRegister(
        regr,
        moduleStatus,
        pendingSignupStatus,
        emailVerification,
        t,
        prefix,
        user_id
      );
      if (result.status) {
        payment_status = true;
      }
    }
    let userActiveCheck = await common.isUserActive(regr["sponsorId"], prefix);

    if (payment_status && userActiveCheck) {
      let username = result.username;
      let transPassword =
        pendingSignupStatus || emailVerification.email_verification
          ? ""
          : result.transaction_password;

      // user activity
      let userId = result.user_id;
      let dataArr = JSON.stringify(postArr);
      var ip =
        req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
      await common.insertUserActivity(
        "New user registered",
        user_id,
        `${username} Added`,
        dataArr,
        t,
        ip,
        prefix
      );
      let data;
      await t.commit();
      if (pendingSignupStatus) {
        let data = {
          message: `registration_completed_successfully ! Username : ${username}`,
          code: `registration_completed_successfully`,
          userName: `${username}`,
        };
        let response = await successMessage({
          value: data,
        });
        return res.json(response);
      } else if (emailVerification.email_verification && !pendingSignupStatus) {
        data = {
          message: `email_verification_required ! Username : ${username}`,
          code: `email_verification_required`,
          userName: `${username}`,
        };
        let response = await successMessage({
          value: data,
        });
        return res.json(response);
      } else {
        console.log(
          "*********************** Commission started signup *************************"
        );
        // Insert Commission for user registration
        CommissionServices.commissionCall(userId, regr, "register", prefix);
        data = {
          message: `email_verification_required ! Username : ${username}`,
          code: `registration_completed_successfully`,
          transaction_password: transPassword,
          userName: `${username}`,
        };
        let response = await successMessage({
          value: data,
        });
        return res.json(response);
      }
    }
  } catch (err) {
    await t.rollback();
    console.log(err);
    return res.status(500).json(err);
  }
};

exports.validateUsername = async (req, res) => {
  let response = await errorMessage({ code: 405 });
  return res.json(response);
};

const insertUsedEwallet = (exports.insertUsedEwallet = async (
  user_id,
  used_user,
  amount,
  balance,
  transactionId,
  amountType,
  t,
  prefix
) => {
  try {
    let totalBalance = Number(balance) - Number(amount);
    const TransactionCreated = await Transactions.create(
      { transaction_id: transactionId },
      { transaction: t, prefix }
    );
    const details = await ewalletDetails.create(
      {
        user_id: user_id,
        used_user: used_user,
        amount: Math.round(amount, 2),
        used_for: amountType,
        transaction_id: TransactionCreated.id,
      },
      { transaction: t, prefix }
    );
    await ewalletHistory.create(
      {
        user_id: user_id,
        from_id: used_user,
        reference_id: details.id,
        ewallet_type: "ewallet_payment",
        amount: amount,
        balance: totalBalance,
        purchase_wallet: 0,
        amount_type: amountType,
        type: "debit",
        transaction_id: TransactionCreated.id,
      },
      { transaction: t, prefix }
    );
    return true;
  } catch (error) {
    console.log(error);
    await t.rollback();
    return false;
  }
});

async function confirmRegister(
  regr,
  moduleStatus,
  pendingSignupStatus,
  emailVerification,
  t,
  postArr,
  prefix,
  user_id
) {
  let msg = {};
  let regFromTree = regr["regFromTree"];
  console.log(regFromTree, "====================================", regr);
  try {
    if (pendingSignupStatus || emailVerification.email_verification) {
      if (pendingSignupStatus) {
        let result = await addPendingReg(
          regr,
          emailVerification,
          t,
          prefix,
          user_id
        );
        // TODO Send Mail
        return result;
      } else if (regr["byUsing"] != "ecom") {
        let result = await addPendingReg(
          regr,
          emailVerification,
          t,
          prefix,
          user_id
        );
        return result;
      }
    }
    // if (!_.includes(["Binary", "Matrix"], moduleStatus.mlm_plan)) {
    //   regFromTree = false;
    // }
    const placementDetails = await getPlacementAndPosition(regr, prefix);
    console.log("*****************", placementDetails);
    if (placementDetails) {
      regr["placementId"] = placementDetails.id;
      regr["position"] = placementDetails.position;
    } else {
      if (!regFromTree) {
        msg["error"] = "Unexpected error occured. Please contact Admin";
        return msg;
      }
      regr["placementId"] = regr["placement_id"];
    }

    if (regr["usernameType"] == "dynamic") {
      let dynamicUsername = await SignUpServices.getDynamicUsername(prefix);
      regr["username"] = dynamicUsername;
    } else {
      regr["username"] = regr["user_name_entry"];
    }
    const checkUsernameAval = await User.findOne({
      where: {
        username: regr.username,
      },
      prefix,
    });

    if (checkUsernameAval !== null) {
      // console.log("inside check user name *************************");
      if (regr.byUsing == "ecom") {
        msg["error"] = "Username Not Available";
      } else {
        msg["error"] = "Username Not Available";
      }
      return msg;
    }
    const checkLegAval = await User.findOne({
      where: {
        father_id: regr.placementId,
        position: regr.position,
      },
      prefix,
    });

    if (checkLegAval !== null) {
      if (regr.byUsing == "ecom") {
        msg["error"] = "Leg Not Available";
      } else {
        msg["error"] = "User already registered";
      }
      return msg;
    }
    if (moduleStatus.product_status) {
      const checkPdtTotal = await packages.findAll({
        where: {
          active: 1,
          type: "registration",
          product_id: regr.productId,
        },
        prefix,
      });
      const checkPdt = checkPdtTotal.length;
      if (checkPdt) {
        if (regr.byUsing == "ecom") {
          msg["error"] = "Product Not Available";
        } else {
          msg["error"] = "Product Not Available";
        }
      }
    }
    if (regr.regFromTree) {
      const checkSponsorPlacement = await isPlacementUnderSponsor(regr, prefix);
      if (!checkSponsorPlacement) {
        msg["error"] = "Invalid placement";
        return msg;
      }
    }
    let statusFlag = true;
    try {
      console.log("====== register function call");
      var reg_status = await registerUser(
        regr,
        moduleStatus,
        t,
        postArr,
        prefix
      );
    } catch (err) {
      console.log(err);
      await t.rollback();
      statusFlag = false;
      // await confirmRegister(regr, moduleStatus, pendingSignupStatus.status, emailVerification)
    }
    if (statusFlag == false) {
      msg["status"] = false;
    }
    if (reg_status) {
      var user_id = (regr["userId"] = reg_status["user_id"]);
      regr["tran_password"] = reg_status["transaction_password"];

      msg["username"] = postArr["user_name_entry"];
      msg["password"] = postArr["pswd"];
      msg["user_id"] = user_id;
      msg["transaction_password"] = reg_status["transactionPassword"];
      msg["status"] = true;
    }
    await storeTreepathInfo(user_id, regr, t, prefix);
    await SignUpServices.addBySpecificPlan(user_id, regr.sponsorId, t, prefix);
    return msg;
  } catch (err) {
    console.log(err);
  }
}

async function addPendingReg(regr, emailVerification, t, prefix, user_id) {
  if (regr.usernameType == "dynamic") {
    // TODO
  }
  let moduleStatus = await modStatus.getModuleStatus(prefix);
  const paymentmethodId = await paymentConfig.findOne({
    attributes: ["id"],
    where: {
      name: regr.paymentMethod,
    },
    prefix,
  });
  let ProductId = await packages.findOne({
    attributes: ["id"],
    where: {
      product_id: regr.product_id,
    },
    prefix,
  });
  regr["product_id"] = ProductId.id;
  let slug;
  if (regr["payment_method"] == "freejoin") {
    slug = "free-joining";
  } else if (regr["payment_method"] == "purchase_wallet") {
    slug = "purchase-wallet";
  } else if (regr["payment_method"] == "ewallet") {
    slug = "e-wallet";
  } else if (regr["payment_method"] == "banktransfer") {
    slug = "bank-transfer";
  } else if (regr["payment_method"] == "epin") {
    slug = "E-pin";
  } else if (regr["payment_method"] == "stripe") {
    slug = "Stripe";
  }

  let paymentId = await common.getPaymentMethodId(slug, prefix);
  let newResponse = {
    sponsor_id: regr["sponsorId"],
    sponsorName: regr["sponsor_full_name"],
    username: regr["user_name_entry"],
    password: regr["pswd"],
    password_confirmation: regr["pswd"],
    terms: "yes",
    payment_method: paymentId,
    regFromTree: regr["reg_from_tree"] ? "1" : "0",
    date_of_birth: regr["date_of_birth"],
    position: regr["position"],
    sponsorFullname: regr["sponsor_full_name"],
    placement_username: regr["placement_user_name"]
      ? regr["placement_user_name"]
      : await common.idToUsername(user_id, prefix),
    placement_fullname: regr["sponsor_full_name"],
    product_id: regr["product_id"],
    first_name: regr["first_name"],
    gender: regr["gender"],
    email: regr["email"],
    mobile: regr["mobile"],
    totalAmount: regr["totalAmount"],
    epin: regr["payment_method"] == "epin" ? regr["epin"] : null,
    tranusername: null,
    tranPassword: null,
    mlm_plan: moduleStatus.mlm_plan,
    username_type: "static",
    age_limit: "18",
    default_country: null,
    reg_amount: regr["regAmount"],
    product_amount: regr["productAmount"],
    product_pv: regr["productPV"],
    date_of_joining: new Date().toISOString().split("T")[0],
  };
  if (regr["reg_from_tree"]) {
    newResponse = {
      ...newResponse,
      ["placement_id"]: regr["placementId"],
    };
  }
  if (regr["subAccount"]) {
    newResponse = {
      ...newResponse,
      ["subAccount"]: regr["subAccount"],
      ["parent_id"]: regr["sponsorId"],
    };
  }
  let insertData = await pendingUser.create(
    {
      username: regr.user_name_entry,
      package_id: ProductId.id,
      sponsor_id: regr.sponsorId,
      payment_method: paymentmethodId.id,
      status: "pending",
      data: JSON.stringify(newResponse),
      date_added: Date.now("Y-m-d H:i:s"),
      email_verification_status: emailVerification.email_verfication
        ? "yes"
        : "no",
    },
    {
      transaction: t,
      prefix,
    }
  );
  return insertData;
}

async function isPlacementUnderSponsor(regr, prefix) {
  let flag = false;
  try {
    if (regr.sponsorId == regr.placementId) {
      flag = true;
      return flag;
    }
    var userId = regr.placementId;
    const adminId = await common.getAdminId(prefix);
    while (userId != adminId) {
      const fatherId = await User.findOne({
        attributes: ["father_id"],
        where: {
          id: userId,
        },
        prefix,
      });
      if (fatherId.father_id == regr.sponsorId) {
        flag = true;
        return flag;
      }
      userId = fatherId.father_id;
    }
    return flag;
  } catch (error) {
    console.log(error.message);
  }
}

async function registerUser(regr, moduleStatus, t, postArr, prefix) {
  let response = [];
  let flag = false;
  let purchaseAddrFlag = true;
  const user = await addFtDetails(regr, moduleStatus, t, prefix);
  try {
    if (user) {
      response["user_id"] = user.id;
      // TODO custom details
      console.log("===== add user details");
      const usrDetails = await addUserDetails(
        regr,
        user.id,
        t,
        postArr,
        prefix
      );
      console.log("===== addd user details result");
      console.log(usrDetails);
      if (usrDetails) {
        console.log("===== insert into user details");
        const amtFlag = await usrBalance.create(
          {
            balance_amount: 0,
            purchase_wallet: 0,
            user_id: user.id,
          },
          {
            transaction: t,
            prefix,
          }
        );
        if (amtFlag) {
          var transactionPass = "12345678";
          response["transactionPassword"] = transactionPass;
          var securePass = await bcrypt.hash(transactionPass, 10);
          const transFlag = await transPass.create(
            {
              user_id: user.id,
              password: securePass,
            },
            {
              transaction: t,
              prefix,
            }
          );
          if (transFlag) {
            const usrRegFlag = await addUserRegDetails(
              regr,
              user.id,
              t,
              postArr,
              prefix
            );
            console.log("user reg flag =====");
            console.log(usrRegFlag);
            if (usrRegFlag) {
              if (moduleStatus.repurchase_status) {
                purchaseAddrFlag = true;
              }
              if (purchaseAddrFlag) {
                flag = true;
              }
            }
          }
        }
      }

      if (moduleStatus.roi_status) {
        let paymentMethodType;
        console.log(regr["payment_method"], "regr payment method");
        // let paymentType = await common.getPaymentMethodSlug(
        //   regr["payment_method"],
        //   prefix
        // );
        switch (regr["payment_method"]) {
          // switch (paymentType) {
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
          case "bank-transfer":
            paymentMethodType = "bank-transfer";
            break;
          case 4:
            paymentMethodType = "bank-transfer";
            break;
          case "ewallet":
            paymentMethodType = "e-wallet";
            break;
        }
        console.log("paymentMethodType", paymentMethodType);
        let paymentId = await common.getPaymentGatewayId(
          "bank-transfer",
          prefix
        );
        let productDetails = await common.getProductDetails(
          regr["product_id"],
          1,
          prefix
        );
        let roi = productDetails.roi;
        let days = productDetails.days;
        let packAmount = productDetails.price;
        await RoiOrder.create(
          {
            user_id: response["user_id"],
            package_id: productDetails.id,
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
      // const package = await packages.findOne({
      //   product_id: regr["productId"],
      //   prefix,
      // });
      // // console.log(package, regr["productId"]);
      // const roi = await RoiOrder.create(
      //   {
      //     user_id: user.id,
      //     package_id: regr["productId"],
      //     amount: package.price,
      //     pending_status: 1,
      //     roi: package.price * 3,
      //     days: 30,
      //   },
      //   {
      //     transaction: t,
      //     prefix,
      //   }
      // );
    }
    response["status"] = flag;
    return response;
  } catch (error) {
    await t.rollback();
    console.log(error);
  }
}

async function addFtDetails(regr, moduleStatus, t, prefix) {
  try {
    let legPosition = regr["position"];
    if (moduleStatus.mlm_plan == "Binary") {
      legPosition = regr["position"] == "R" ? 2 : 1;
    }
    let customer_id = regr["customerId"] ? regr["customerId"] : "0";
    const fatherLevel = await User.findOne({
      attributes: ["user_level"],
      where: {
        id: regr.placementId,
      },
      prefix,
    });
    const sponsorLevel = await User.findOne({
      attributes: ["sponsor_level"],
      where: {
        id: regr.sponsorId,
      },
      prefix,
    });
    var encryptedPassword;
    var userArr;
    if (regr.subAccount) {
      encryptedPassword = regr.password;
      userArr = await User.create(
        {
          oc_customer_ref_id: customer_id,
          user_type: "user",
          username: regr["username"],
          password: encryptedPassword,
          active: 1,
          position: regr["position"],
          leg_position: legPosition,
          father_id: regr["placementId"],
          sponsor_id: regr["sponsorId"],
          product_id: regr["productId"],
          date_of_joining: new Date(),
          user_level: fatherLevel.user_level + 1,
          sponsor_level: sponsorLevel.sponsor_level + 1,
          register_by_using: regr["by_using"],
          product_validity: regr["productValidity"],
          parent_id: regr["sponsorId"],
        },
        {
          transaction: t,
          prefix,
        }
      );
    } else {
      encryptedPassword = await bcrypt.hash(regr.password, 10);

      userArr = await User.create(
        {
          oc_customer_ref_id: customer_id,
          user_type: "user",
          username: regr["username"],
          password: encryptedPassword,
          active: 1,
          position: regr["position"],
          leg_position: legPosition,
          father_id: regr["placementId"],
          sponsor_id: regr["sponsorId"],
          product_id: regr["productId"],
          date_of_joining: new Date(),
          user_level: fatherLevel.user_level + 1,
          sponsor_level: sponsorLevel.sponsor_level + 1,
          register_by_using: regr["by_using"],
          product_validity: regr["productValidity"],
        },
        {
          transaction: t,
          prefix,
        }
      );
    }
    return userArr;
  } catch (error) {
    await t.rollback();
    console.log(error);
  }
}

async function addUserDetails(regr, userId, t, postArr, prefix) {
  try {
    const moduleStatus = await modStatus.getModuleStatus(prefix);
    let fromEcom = false;
    let bitcoinEncrypted;
    if (regr.bitcoinAddress) {
      bitcoinEncrypted = encrypt(regr.bitcoinAddress);
    } else {
      bitcoinEncrypted = "";
    }
    let bankInfo = await signUpSettings.findOne({
      attributes: ["bank_info_required"],
      prefix,
    });
    console.log("payment type goes here =====>");
    console.log(regr.paymentType);
    console.log("payment type goes here =====>");
    const paymentId = await paymentConfig.findOne({
      attributes: ["id", "name", "status"],
      where: {
        name: "Wallet",
      },
      prefix,
    });
    let data = await UserDetails.create(
      {
        user_id: userId,
        sponsor_id: regr["sponsorId"],
        name: postArr["first_name"] ? postArr["first_name"] : "",
        second_name: postArr["last_name"] ? postArr["last_name"] : "",
        dob: regr["date_of_birth"] ? regr["date_of_birth"] : null,
        email: postArr["email"],
        mobile: postArr["mobile"],
        bitcoin_address: bitcoinEncrypted,
        join_date: new Date(),
        bank_info_required: bankInfo.bank_info_required,
        pin: postArr["pin"] ? postArr["pin"] : "NA",
        country_id: postArr["country"] ? postArr["country"] : null,
        state: postArr["state"] ? postArr["state"] : null,
        payout_type: paymentId.id,
        gender: postArr["gender"] ? postArr["gender"] : null,
      },
      {
        transaction: t,
        prefix,
      }
    );

    if (moduleStatus.ecom_status) {
      fromEcom = true;
    }
    // TODO ECOM Conditions fields
    return data;
  } catch (error) {
    await t.rollback();
    console.log(error.message);
  }
}

async function addUserRegDetails(regr, userId, t, postArr, prefix) {
  if (!regr["regAmount"]) {
    regr["regAmount"] = 0;
  }
  if (!regr["totalAmount"]) {
    regr["totalAmount"] = 0;
  }
  try {
    const paymentId = await paymentConfig.findOne({
      attributes: ["id", "name", "status"],
      where: {
        name: regr.paymentType,
      },
      prefix,
    });
    const insertData = await usrReg.create(
      {
        user_id: userId,
        username: postArr["user_name_entry"],
        sponsor_id: regr["sponsor_id"],
        placement_id: regr["placement_id"],
        position: regr["position"],
        name: postArr["first_name"] ? postArr["first_name"] : "",
        second_name: postArr["last_name"] ? postArr["last_name"] : null,
        country_id: postArr["country"] ? postArr["country"] : null,
        email: regr["email"],
        mobile: regr["mobile"],
        product_id: regr["productId"],
        product_name: regr["productName"],
        product_pv: regr["productPv"],
        product_amount: regr["productAmount"],
        reg_amount: regr["regAmount"],
        total_amount: regr["totalAmount"],
        reg_date: regr["joining_date"],
        payment_method: paymentId.id,
      },
      {
        transaction: t,
        prefix,
      }
    );
    return insertData;
  } catch (error) {
    await t.rollback();
    console.log(error.message);
  }
}

async function getPlacementAndPosition(regr, prefix) {
  try {
    const moduleStatus = await modStatus.getModuleStatus(prefix);
    console.log(`===== get placement and position`);
    if (moduleStatus.mlm_plan == "Unilevel") {
      let placementArray = [];
      let Details = await User.findAll({
        where: {
          father_id: regr.sponsorId,
        },
        prefix,
      });
      let position = Details.length + 1;
      placementArray["id"] = regr.sponsorId;
      placementArray["position"] = position;
      return placementArray;
    }
    if (moduleStatus.mlm_plan == "Binary") {
      if (regr.regFromTree) {
        return null;
      }
      let placementIdLevel = await User.findOne({
        attributes: ["user_level"],
        where: {
          id: regr.sponsorId,
        },
        prefix,
      });
      if (!placementIdLevel) {
        placementIdLevel = 0;
      }
      let targetPosition = regr.position == "R" ? 2 : 1;
      const getPosition = await mlm_laravel.query(
        `SELECT ft.username, ft.id,GROUP_CONCAT(DISTINCT fta.leg_position SEPARATOR '') as positionString FROM ${prefix}treepaths as tp JOIN ${prefix}users as ft ON ft.id = tp.descendant JOIN ${prefix}treepaths as tpa ON tpa.descendant = tp.descendant JOIN ${prefix}users as fta ON fta.id = tpa.ancestor LEFT JOIN ${prefix}users as ftl ON (ft.id = ftl.father_id AND ftl.leg_position = :pos) WHERE tp.ancestor = :id AND ftl.username IS NULL AND fta.user_level > :level GROUP BY tp.descendant HAVING positionString = :pos`,
        {
          replacements: {
            id: regr.sponsorId,
            pos: targetPosition,
            level: placementIdLevel.user_level,
          },
          type: QueryTypes.SELECT,
        }
      );
      if (getPosition && getPosition.length > 0) {
        let result = {
          id: getPosition[0].id,
          position: regr.position,
        };
        return result;
      }
      let result = {
        id: regr.sponsorId,
        position: regr.position,
      };
      return result;
    }
    if (moduleStatus.mlm_plan == "Matrix") {
      // console.log("***********regr******", JSON.stringify(regr));

      console.log(" ===== inside plan matrix");
      console.log(regr.regFromTree);
      if (regr.regFromTree == 1) {
        console.log("reg from tree ====");
        return null;
      }
      let widthCeiling = await SignUpServices.getWidthCieling(prefix);
      console.log("===== width ceiling");
      let sponsorArray = await SignUpServices.checkPosition(
        regr.sponsorId,
        widthCeiling,
        prefix
      );
      console.log(`===== sponsor array details`);
      console.log(sponsorArray);
      // console.log(
      //   "*********************sponsor array*******",
      //   JSON.stringify(sponsorArray)
      // );
      return sponsorArray;
    }
    if (
      moduleStatus.mlm_plan == "Stair_Step" ||
      moduleStatus.mlm_plan == "Donation"
    ) {
      // if (regr.regFromTree) {
      //   return null;
      // }
      let placementArray = [];
      let Details = await User.findAll({
        where: {
          father_id: regr.sponsorId,
        },
        prefix,
      });
      let position = Details.length + 1;
      placementArray["id"] = regr.sponsorId;
      placementArray["position"] = position;
      return placementArray;
    }
  } catch (error) {
    console.log(error);
  }
}

async function storeTreepathInfo(userId, regr, t, prefix) {
  let result;
  var treepathRows = [];
  try {
    console.log(
      ` ********************* store tree path info **********************`
    );
    if (!userId) {
      return false;
    }
    console.log("===============================", regr.placementId);
    const treepathAncestor = await Tree.findAll({
      attributes: ["ancestor"],
      where: {
        descendant: regr.placementId,
      },
      prefix,
    });
    treepathRows["ancestor"] = userId;
    treepathRows["descendant"] = userId;
    Object.entries(treepathAncestor).map(async ([key, value]) => {
      if (!value.ancestor) {
        return false;
      }
      result = await Tree.create(
        {
          ancestor: value.ancestor,
          descendant: userId,
        },
        {
          transaction: t,
          prefix,
        }
      );
    });
    await Tree.create(
      {
        ancestor: userId,
        descendant: userId,
      },
      {
        transaction: t,
        prefix,
      }
    );

    const sponsorTreeAncestor = await spnorTree.findAll({
      attributes: ["ancestor"],
      where: { descendant: regr.sponsorId },
      prefix,
    });
    let sponsorTreepathRows = [];
    sponsorTreepathRows["ancestor"] = userId;
    sponsorTreepathRows["descendant"] = userId;
    Object.entries(sponsorTreeAncestor).map(async ([key, value]) => {
      if (!value.ancestor) {
        return false;
      }
      result = await spnorTree.create(
        {
          ancestor: value.ancestor,
          descendant: userId,
        },
        {
          transaction: t,
          prefix,
        }
      );
    });
    await spnorTree.create(
      {
        ancestor: userId,
        descendant: userId,
      },
      {
        transaction: t,
        prefix,
      }
    );
    return result;
  } catch (error) {
    await t.rollback();
    console.log(error.message);
  }
}

async function checkLeg(
  sponsorLeg,
  sponsorUserName,
  placementUserName,
  prefix
) {
  const adminId = await common.getAdminId(prefix);
  const sponsor = await User.findOne({
    attributes: ["id"],
    where: {
      username: sponsorUserName,
    },
    prefix,
  });
  if (!sponsor) {
    return false;
  }
  const legLock = await signUpSettings.findOne({
    attributes: ["binary_leg"],
    prefix,
  });

  if (legLock.binary_leg != "any") {
    if (sponsor.user_type == "admin") {
      if (legLock.binary_leg != sponsorLeg) {
        return false;
      }
    } else {
      let legs = await getUserLeftRightNode(adminId, prefix);
      let adminLegId = legs[`${legLock.binary_leg}`];
      const checkAncestor = await Tree.count({
        where: {
          ancestor: adminLegId,
          descendant: sponsor.id,
        },
        prefix,
      });
      if (checkAncestor < 0) {
        return false;
      }
    }
    return true;
  }

  // placement user
  let userLockLeg = await getUserBinaryLeg(sponsor.id, prefix);
  if (userLockLeg == "any") {
    return true;
  }
  if (sponsorUserName == placementUserName || !placementUserName) {
    if (userLockLeg != sponsorLeg) {
      return false;
    }
  } else {
    const placementUser = await User.findOne({
      attributes: ["id"],
      where: {
        username: placementUserName,
      },
      prefix,
    });
    let legs = await getUserLeftRightNode(sponsor.id, prefix);
    let sponsorLegId = legs[`${userLockLeg.binary_leg}`];
    const checkAncestor = await Tree.count({
      where: {
        ancestor: sponsorLegId,
        descendant: placementUser.id,
      },
      prefix,
    });
    if (checkAncestor) {
      return false;
    }
  }
  return true;
}

async function getUserLeftRightNode(id, prefix) {
  let data = [];
  let node = await User.findAll({
    attributes: ["id", "position"],
    where: {
      father_id: id,
    },
    prefix,
  });
  Object.entries(node).map(([key, value]) => {
    if (value.position == "L") {
      data["L"] = value.id;
    }
    if (value.position == "R") {
      data["R"] = value.id;
    }
  });
  return data;
}

async function getUserBinaryLeg(id, prefix) {
  const userBinaryLeg = await User.findOne({
    where: {
      id: id,
    },
    prefix,
  });
  let result = userBinaryLeg.binary_leg;
  if (userBinaryLeg.binary_leg == "weak_leg") {
    const totalleg = await LegDetails.findOne({
      attributes: [
        ["total_left_count", "left"],
        ["total_right_count", "right"],
      ],
      where: {
        id: id,
      },
      prefix,
    });
    if (totalleg.left > totalleg.right) {
      result = "R";
    } else if (totalleg.left < totalleg.right) {
      result = "L";
    } else {
      result = "any";
    }
  }
  return result;
}
const getUserRegistrationDetailsForPreview = async (
  userId,
  userName,
  prefix
) => {
  let infinteUserReg;
  if (userId) {
    infinteUserReg = await User.findOne({
      attributes: [
        "username",
        "sponsor_id",
        "product_id",
        "date_of_joining",
        "father_id",
      ],
      where: {
        id: userId,
      },
      include: [
        {
          model: UserDetails,
          as: "details",
          attributes: [
            "mobile",
            "email",
            "join_date",
            "address",
            "address2",
            "name",
            "second_name",
          ],
        },
      ],
      prefix,
    });
  } else {
    infinteUserReg = await pendingUser.findAll({
      attributes: ["data"],
      where: {
        username: userName,
        status: "pending",
      },
      prefix,
    });
    // $this->db->select('data');
    // $this->db->where('user_name', $user_name);
    // $this->db->where('status', 'pending');
    // $query = $this->db->get('pending_registration');
    // $details = json_decode($query->row_array()['data'], true);
    // $details['user_name'] = $details['user_name_entry'];
    // $details['reg_date'] = $details['joining_date'];
    // $details['last_name'] = $details['last_name'] ?? null;
  }

  return infinteUserReg;
};
const getRegAmount = async (prefix) => {
  return (registrationAmount = await Config.findOne({
    attributes: ["reg_amount"],
    prefix,
  }));
};
const getSiteinformation = async (prefix) => {
  return await siteInformation.findOne({ prefix });
};
exports.getRegisterPreview = async (req, res) => {
  const prefix = req.headers["api-key"];
  if (!prefix) {
    let response = await errorMessage({ code: 1001 });
    return res.json(response);
  }
  const { username } = req.query;

  const moduleStatus = await modStatus.getModuleStatus(prefix);
  const userId = await common.usernameToId(username, prefix);
  try {
    let userInfo = [];
    let firstName, lastName;
    if (username) {
      //checkpendingreg
      const checkPendingReg = await pendingUser.findOne({
        attributes: ["status"],
        where: {
          username: username,
        },
        prefix,
      });
      //checkEmailverificationstatus
      checkEmailver = await signUpSettings.findOne({
        attributes: ["email_verification"],
        prefix,
      });

      if (checkEmailver.email_verification && !checkPendingReg) {
        let response = await errorMessage({ code: 1037 });
        return res.json(response);
      }
      if (!userId && !checkPendingReg) {
        let response = await errorMessage({ code: 1011 });
        return res.json(response);
      }
      userInfo.push({ code: "userName", title: "User_Name", value: username });
      productStatus = moduleStatus.product_status;
      referalStatus = moduleStatus.referral_status;
      if (checkPendingReg && checkPendingReg?.status == "pending") {
        let data = await getUserRegistrationDetailsForPreview(
          "",
          username,
          prefix
        );
        var userRegDetails = JSON.parse(data[0].data);
        firstName = userRegDetails.first_name;
        lastName = userRegDetails?.last_name ? userRegDetails.last_name : "";
        userInfo.push({
          code: "fullName",
          title: "fullname",
          value: firstName + " " + lastName,
        });
        const productId = common.getProductName(
          userRegDetails.product_id,
          prefix
        );
        var getLangid = await User.findOne({
          attributes: ["default_lang"],
          where: { id: userId },
          prefix,
        });
      } else {
        userRegDetails = await getUserRegistrationDetailsForPreview(
          userId,
          "",
          prefix
        );
        //TODO ECOM --    //TODO ECOM --- Completed need to check
        productName = await common.getProductName(
          userRegDetails.product_id,
          prefix
        );
        const fatherId = userRegDetails.father_id;
        firstName = userRegDetails.details.name;
        lastName = userRegDetails.details.second_name;
        userInfo.push({
          code: "fullName",
          title: "fullname",
          value: firstName + " " + lastName,
        });
      }
      placementUserName = await common.idToUsername(
        userRegDetails.father_id,
        prefix
      );
      var sponserName = await common.idToUsername(
        userRegDetails.sponsor_id
          ? userRegDetails.sponsor_id
          : userRegDetails.sponsorId,
        prefix
      );
      userInfo.push({ code: "sponsor", title: "sponsor", value: sponserName });

      var regAmount = await getRegAmount(prefix);
      userInfo.push({
        code: "registrationAmount",
        title: "registration_amount",
        value: "$" + regAmount.reg_amount,
        amount: regAmount.reg_amount,
      });
      totalAmount = regAmount.reg_amount;

      if (productStatus) {
        productDetails = await common.getProduct(
          userRegDetails.product_id,
          prefix
        );

        userInfo.push({
          code: "package",
          title: "package",
          value: productDetails.name
            ? productDetails.name
            : productDetails.model,
        });
        userInfo.push({
          code: "packageAmount",
          title: "package_amount",
          value: "$" + productDetails.price,
          amount: productDetails.price,
        });
        if (totalAmount > 0) {
          totalAmount = totalAmount + productDetails.price;
        } else {
          totalAmount = productDetails.price;
        }
      }
      userInfo.push({
        code: "totalAmount",
        title: "total_amount",
        value: "$" + totalAmount,
        amount: totalAmount,
      });
      siteInfo = await getSiteinformation(prefix);

      let language_id = 1;
      letterconfig = await letterConfig.findOne({
        attributes: ["content"],
        where: {
          language_id: language_id,
        },
        prefix,
      });
      // $lang_id = $this->LANG_ID;
      // $letter_arr = $this->configuration_model->getLetterSetting($lang_id);
      data = {
        user_info: userInfo,
        letter: {
          content: letterconfig.content,
          date: moment(new Date()).format("MMM DD ,YYYY"),
          companyName: siteInfo.name ? siteInfo.name : "",
          companyAddress: siteInfo.address ? siteInfo.address : "",
          logo: siteInfo?.logo ? siteInfo?.logo : "",
        },
      };
      return res.json({
        status: true,
        data,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.getBankAccountDetails = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { account_info } = await BankDetails.findOne({
      attributes: ["account_info"],
      prefix,
    });
    return res.json({ status: true, data: { account_info } });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

exports.postSubAccountCreation = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const id = req?.user?.id ? req?.user?.id : req.user_id;

    return res.json({ true: true });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ Message: error.message });
  }
};

exports.getuserDetails = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const id = req?.user?.id;
    const userDetails = await User.findOne({
      where: { id: id },
      attributes: ["username", "password"],
      include: [
        {
          model: UserDetails,
          as: "details",
        },
      ],
      prefix,
    });
    // const childsCound = await User.findAll({
    //   where: {
    //     parent_id: id,
    //   },
    //   prefix,
    // });
    // const childPendingCount = await common.getPencdingSubAccountCount(
    //   id,
    //   prefix
    // );

    // var count = childsCound.length + childPendingCount;
    // count = count + 1;
    let userNameEntry = await createSubAccountUserName(id, prefix, 1);
    if (!userNameEntry) {
      let response = await errorMessage({ code: 1004 });
      return res.status(400).json({ status: false, error: response });
    }
    console.log(
      "==========================subAccount username=========================",
      userNameEntry
    );
    let result = {
      address_line1: userDetails.details.address,
      address_line2: userDetails.details.address2,
      agree_terms: true,
      city: userDetails.details.city,
      country: userDetails.details.country_id,
      date_of_birth: userDetails.details.dob,
      email: userDetails.details.email,
      first_name: userDetails.details.name,
      gender: userDetails.details.gender,
      last_name: userDetails.details.second_name,
      mobile: userDetails.details.mobile,
      payment_method: "banktransfer",
      pin: userDetails.details.pin,
      product_id: "product-1",
      pswd: userDetails.password,
      sponsor_full_name:
        userDetails.details.name + userDetails.details.second_name,
      sponsor_user_name: userDetails.username,
      state: userDetails.details.state_id,
      user_name_entry: userNameEntry,
      subAccount: true,
    };

    return res.json({ status: true, data: result });
  } catch (error) {
    console.log(error);
    let response = await errorMessage({ code: 1004 });
    return res.status(400).json({ status: false, error: response });
  }
};

exports.getUserPackageDetails = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const id = req?.user?.id;
    const currentUserPackageSlab = await common.getSponsorPackageSlab(
      id,
      prefix
    );
    if (currentUserPackageSlab) {
      const packageList = await packages.findAll({
        attributes: ["pair_price", "price", "product_id", "name"],
        where: {
          package_type: currentUserPackageSlab,
        },
        prefix,
      });
      var result = [];
      packageList.forEach((element) => {
        var data = {
          name: `${element.name}  ( $ ${element.price})`,
          product_id: element.product_id,
          pair_price: element.pair_price,
        };
        result.push(data);
      });
      // console.log(JSON.stringify(packageList), "***********************");
      let response = await successMessage({ value: result });
      return res.json(response);
    }
  } catch (error) {
    console.log(error);
    let response = await errorMessage({ code: 1004 });
    return res.status(400).json({ status: false, error: response });
  }
};

const approveRegister = (exports.approveRegister = async (
  pendingId,
  prefix
) => {
  try {
    t = await mlm_laravel.transaction();

    const pendingData = await pendingUser.findOne({
      where: { id: pendingId },
      prefix,
    });
    const updatePendinData = await pendingData.update(
      {
        status: "processing",
      },
      { transaction: t },
      prefix
    );
    if (!pendingData) {
      console.log(
        "*************** fetck pending User Data Failed! ****************************"
      );
      return false;
    }
    let regr = JSON.parse(pendingData.data);
    let placementId = await common.usernameToId(
      regr.placement_username,
      prefix
    );
    regr["placement_id"] = regr?.placement_id
      ? regr?.placement_id
      : placementId
      ? placementId
      : 0;
    regr["sponsorId"] = regr.sponsor_id;
    regr["user_name_entry"] = regr.username;
    regr["productId"] = regr.product_id;
    regr["placementId"] = regr.placement_id;
    regr["paymentType"] = await common.getPaymentMethodName(
      regr.payment_method,
      prefix
    );
    regr["productPV"] = regr.product_pv;

    let postArr = {
      first_name: regr?.first_name ? regr?.first_name : "",
      last_name: regr?.last_name ? regr?.last_name : "",
      date_of_birth: regr?.date_of_birth ? regr?.date_of_birth : "",
      email: regr?.email ? regr?.email : "",
      mobile: regr?.mobile ? regr?.mobile : "",
      pin: regr?.pin ? regr?.pin : "",
      country: regr?.country ? regr?.country : "",
      state: regr?.state ? regr?.state : "",
      user_name_entry: regr?.username ? regr?.username : "",
      gender: regr?.gender ? regr?.gender : "",
    };
    console.log(regr, postArr);
    const moduleStatus = await modStatus.getModuleStatus(prefix);
    let approved_id = await confirmRegister(
      regr,
      moduleStatus,
      0,
      0,
      t,
      postArr,
      prefix,
      null
    );
    console.log(
      "==================Approved Details=========",
      approved_id,
      approved_id.status
    );
    if (approved_id.status) {
      console.log("****************** if ***********************");
      const updatePendinData = await pendingData.update(
        {
          updated_id: approved_id["user_id"],
          status: "active",
        },
        { transaction: t },
        prefix
      );
      await t.commit();
      CommissionServices.commissionCall(
        approved_id["user_id"],
        regr,
        "register",
        prefix
      );
      return true;
    } else {
      console.log("*****************************else***********************");
      const updatePendinData = await pendingData.update(
        {
          status: "failed",
        },
        { transaction: t },
        prefix
      );
      await t.commit();
      return false;
    }
    console.log(regr, "*******************Regr data*************");
  } catch (error) {
    console.log(error);
    await t.rollback();
    return false;
  }
});

const createSubAccountUserName = async (id, prefix, ct) => {
  try {
    console.log(
      "=================================================looop======",
      ct
    );
    const userDetails = await User.findOne({
      where: { id: id },
      attributes: ["username", "password"],
      include: [
        {
          model: UserDetails,
          as: "details",
        },
      ],
      prefix,
    });
    const childsCound = await User.findAll({
      where: {
        parent_id: id,
      },
      prefix,
    });
    const childPendingCount = await common.getPencdingSubAccountCount(
      id,
      prefix
    );

    var count = childsCound.length + childPendingCount;
    count = count + ct;
    let newuserName = userDetails.username + "_" + count.toString();
    let check = await userNameAvailability(newuserName, prefix);
    if (!check) {
      newuserName = await createSubAccountUserName(id, prefix, ++ct);
    } else if (check == 2) {
      return false;
    }
    return newuserName;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const userNameAvailability = async (username, prefix) => {
  try {
    if (/\s/.test(username)) {
      return false;
    }
    let result = await User.findAll({
      where: {
        username,
      },
      prefix,
    });
    if (result.length <= 0) {
      result = await pendingUser.findAll({
        where: {
          username,
        },
        prefix,
      });
    }
    if (result.length <= 0) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return 2;
  }
};
