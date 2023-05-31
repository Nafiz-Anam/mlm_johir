const fs = require("fs");
const bcrypt = require("bcryptjs");
const { encrypt, decrypt } = require("../../middleware/web/encryption");
const { join } = require("path");
const { Op, Sequelize } = require("sequelize");
const { successMessage, errorMessage } = require("../../utils/web/response");
const CommonServices = require("../../utils/web/common");
const profileService = require("../../utils/web/profileService");
const UploadServices = require("../../utils/web/uploadServices");
const EwalletServices = require("../../utils/web/ewalletServices");
const RepurchaseServices = require("../../utils/web/repurchaseServices");
const multer = require("multer");
const Curr = require("../../utils/web/allCurrency");
const Language = require("../../utils/web/allLanguages");
const Country = require("../../utils/web/allCountries");
const States = require("../../utils/web/allStates");
const modStatus = require("../../utils/web/moduleStatus");
const passPolicy = require("../../utils/web/passwordPolicy");
const uploadFile = require("../../middleware/web/profilePicUpload");
const multipleUpload = require("../../middleware/web/uploadMultipleFile");
const PaymentGatewayServices = require("../../utils/web/paymentGatewayService");
const { mailConfig, sendMail } = require("../../utils/web/nodeMailer");
const db = require("../../models");
const { mlm_laravel } = require("../../models");
const UserDetails = db.userDetails;
const User = db.user;
const kyc = db.kycCategories;
const kycDocs = db.kycDocs;
const SubscriptionConfig = db.subscriptionConfig;
const OcCustomer = db.ocCustomer;
const OcAddress = db.ocAddress;
const ocPdt = db.ocProducts;
const config = db.configuration;
const Lang = db.languages;
const pack = db.pack;
const TransPass = db.transPassword;
const rankDetails = db.rankDetails;
const signupFields = db.signupField;
const paymentConfig = db.paymentConfig;

exports.updatePersonalDetails = async (req, res) => {
    let t = await mlm_laravel.transaction();
    const { firstName, lastName, dateOfBirth, gender } = req.body;
    var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id } = req.user;
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        const userDetails = await UserDetails.findOne({
            where: {
                user_id: id,
            },
            prefix,
        });
        const ecomStatus = moduleStatus.ecom_status;
        const data = {
            name: firstName,
            second_name: lastName,
            dob: dateOfBirth,
            gender: gender,
        };
        if (ecomStatus) {
            const customerId = await CommonServices.getEcomCustomerRefId(
                id,
                prefix
            );
            const ocCustomer = await OcCustomer.findOne({
                where: {
                    customer_id: customerId,
                },
                prefix,
            });
            const data1 = {
                first_name: firstName,
                last_name: lastName,
            };
            await ocCustomer.update(
                data1,
                {
                    transaction: t,
                },
                prefix
            );

            const ocAddress = await OcAddress.findOne({
                where: {
                    customer_id: customerId,
                },
                prefix,
            });
            const data2 = {
                first_name: firstName,
                last_name: lastName,
            };
            await ocAddress.update(
                data2,
                {
                    transaction: t,
                },
                prefix
            );
        }
        await userDetails.update(
            data,
            {
                transaction: t,
            },
            prefix
        );
        configuration = await config.findOne({
            attributes: ["profile_updation_history"],
            prefix,
        });
        //TODO History Update
        // if (configuration.profile_updation_history === 1) {
        //   let history = `Updated Personal info as First Name :${firstName},`;
        //   history += `Last Name :${lastName},`;
        //   history += `Gender:${gender},`;
        //   history += `D.O.B :${dob},`;

        //   const configHistory = await configChange.create(
        //     {
        //       done_by: id,
        //       done_by_type: "user",
        //       ip: ip,
        //       description: history,
        //       activity: "profile updation",
        //       date: Date("Y-m-d H:i:s"),
        //     },
        //     {
        //       transaction: t,
        // prefix
        //     }
        //   );
        // }
        await t.commit();
        let response = await successMessage({
            message: "personal_info_update_success",
        });
        res.json(response);
    } catch (err) {
        await t.rollback();
        return res.status(500).json({
            status: false,
            message: `Error: ${err.message}`,
        });
    }
};

exports.updateContactDetails = async (req, res) => {
    const {
        address_line1,
        address_line2,
        country,
        state,
        city,
        mobile,
        land_line,
        email,
        pin,
    } = req.body;

    var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
    let t = await mlm_laravel.transaction();

    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id } = req.user;
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        const userDetails = await UserDetails.findOne({
            where: {
                user_id: id,
            },
            prefix,
        });
        const ecomStatus = moduleStatus.ecom_status;

        const data = {
            address: address_line1,
            address2: address_line2,
            country_id: country,
            state_id: state,
            city: city,
            mobile: mobile,
            land_phone: land_line,
            email: email,
            pin: pin,
        };
        await userDetails.update(
            data,
            {
                transaction: t,
            },
            prefix
        );

        if (ecomStatus) {
            try {
                const customerId = await CommonServices.getEcomCustomerRefId(
                    id,
                    prefix
                );
                const ocCustomer = await OcCustomer.findOne({
                    where: {
                        customer_id: customerId,
                    },
                    prefix,
                });
                const data1 = {
                    email: email,
                    telephone: land_line,
                };
                await ocCustomer.update(
                    data1,
                    {
                        transaction: t,
                    },
                    prefix
                );

                const ocAddress = await OcAddress.findOne({
                    where: {
                        customer_id: customerId,
                    },
                    prefix,
                });
                const data2 = {
                    address_1: address_line1,
                    address_2: address_line2,
                    city: city,
                    postcode: pin,
                    country_id: country,
                    zone_id: state,
                };
                await ocAddress.update(
                    data2,
                    {
                        transaction: t,
                    },
                    prefix
                );
            } catch (err) {
                await t.rollback();
                return res.status(500).send({
                    status: false,
                    message: `Error: ${err.message}`,
                });
            }
        }
        let configuration = await config.findOne({
            attributes: ["profile_updation_history"],
            prefix,
        });
        // if (configuration.profile_updation_history == 1) {
        //   let history = `Updated Contact Info as Address Line 1:${addressLine},`;
        //   history += `Address Line 2 :${addressLine2},`;
        //   history += `country:${country},`;
        //   history += `state:${state},`;
        //   history += `city:${city},`;
        //   history += `email:${email},`;
        //   history += `LandLine:${landLine},`;

        //   await configChange.create(
        //     {
        //       done_by: id,
        //       done_by_type: "user",
        //       ip: ip,
        //       description: history,
        //       activity: "profile updation",
        //       date: Date("Y-m-d H:i:s"),
        //     },
        //     {
        //       transaction: t,
        // prefix
        //     }
        //   );
        // }
        await t.commit();
        let response = await successMessage({
            message: "contact_info_update_success",
        });
        res.json(response);
    } catch (err) {
        await t.rollback();
        return res.status(500).send({
            status: false,
            message: `Error: ${err.message}`,
        });
    }
};

exports.updateBankDetails = async (req, res) => {
    const { bankName, branchName, accountHolder, accountNo, ifsc, pan } =
        req.body;
    var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
    let t = await mlm_laravel.transaction();
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id } = req.user;
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        const userDetails = await UserDetails.findOne({
            where: {
                user_id: id,
                [Op.and]: {
                    bank_info_required: 1,
                },
            },
            prefix,
        });

        const data = {
            account_number: accountNo,
            ifsc: ifsc,
            bank: bankName,
            nacct_holder: accountHolder,
            branch: branchName,
            pan: pan,
        };
        await userDetails.update(
            data,
            {
                transaction: t,
            },
            prefix
        );

        // if (ecomStatus) {
        //   const customerId = await CommonServices.getOcCustomerId(id,prefix)

        // }
        let configuration = await config.findOne({
            attributes: ["profile_updation_history"],
            prefix,
        });
        // if (configuration.profile_updation_history == 1) {
        //   let history = `Updated Bank Info as Account no. :${accountNo},`;
        //   history += `IFSC :${ifsc},`;
        //   history += `Bank Name :${bankName},`;
        //   history += `Account Holder :${accountHolder},`;
        //   history += `Branch Name :${branchName},`;
        //   history += `PAN :${pan},`;

        //   await configChange.create(
        //     {
        //       done_by: id,
        //       done_by_type: "user",
        //       ip: ip,
        //       description: history,
        //       activity: "profile updation",
        //       date: Date("Y-m-d H:i:s"),
        //     },
        //     {
        //       transaction: t,
        //       prefix,
        //     }
        //   );
        // }
        await t.commit();
        let response = await successMessage({
            message: "bank_info_update_success",
        });
        res.json(response);
    } catch (err) {
        await t.rollback();
        return res.status(500).send({
            status: false,
            message: `Error: ${err.message}`,
        });
    }
};

exports.updateSettingsDetails = async (req, res) => {
    const prefix = req.headers["api-key"];
    if (!prefix) {
        let response = await errorMessage({ code: 1001 });
        return res.json(response);
    }
    const { language, currency, binaryLegSettings, googleAuthStatus } =
        req.body;

    let t = await mlm_laravel.transaction();
    try {
        const userId = req.user.id;
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        let user = await User.findOne({
            where: {
                id: userId,
            },
            prefix,
        });
        if (!user) {
            let response = await errorMessage({ code: 401 });
            return res.json(response);
        }
        if (moduleStatus.lang_status) {
            let langId = await Lang.findOne({
                where: {
                    code: language,
                },
                prefix,
            });
            await user.update(
                {
                    default_lang: langId.lang_id,
                },
                {
                    transaction: t,
                },
                prefix
            );
            if (moduleStatus.ecom_status) {
                const customerId = await CommonServices.getEcomCustomerRefId(
                    userId,
                    prefix
                );
                let ocCustomer = await OcCustomer.findOne({
                    where: {
                        customer_id: customerId,
                    },
                    prefix,
                });
                if (!ocCustomer) {
                    return res.status(400).send({
                        status: false,
                        message:
                            "Oc_user not found for default language update",
                    });
                }
                await ocCustomer.update(
                    {
                        language_id: langId.lang_id,
                    },
                    {
                        transaction: t,
                    },
                    prefix
                );
            }
        }
        if (moduleStatus.multi_currency_status) {
            await user.update(
                {
                    default_currency: currency,
                },
                {
                    transaction: t,
                },
                prefix
            );
        }
        if (moduleStatus.mlm_plan == "Binary") {
            await user.update(
                {
                    binary_leg: binaryLegSettings,
                },
                {
                    transaction: t,
                },
                prefix
            );
        }
        if (moduleStatus.google_auth_status) {
            await user.update(
                {
                    google_auth_status: googleAuthStatus,
                },
                {
                    transaction: t,
                },
                prefix
            );
        }
        await t.commit();
        let response = await successMessage({
            message: "settings_details_update_success",
        });
        res.json(response);
    } catch (error) {
        console.log(error);
        await t.rollback();
        return res.status(500).json({
            status: false,
            message: `Error: ${error.message}`,
        });
    }
};

exports.updatePaymentDetails = async (req, res) => {
    var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
    const {
        paypalAccount,
        blockchainAccount,
        bitgoAccount,
        blocktrailAccount,
        paymentMethod,
        wallet,
    } = req.body;
    let t = await mlm_laravel.transaction();
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id } = req.user;

        const userDetails = await UserDetails.findOne({
            where: {
                user_id: id,
            },
            prefix,
        });

        if (wallet) {
            let encryptedWalletAddress = encrypt(wallet);
            await userDetails.update(
                {
                    bitcoin_address: encryptedWalletAddress,
                },
                {
                    transaction: t,
                },
                prefix
            );
        }
        if (paypalAccount) {
            let encryptedPaypalAccount = encrypt(paypalAccount);
            await userDetails.update(
                {
                    paypal: encryptedPaypalAccount,
                },
                {
                    transaction: t,
                },
                prefix
            );
        }
        if (blockchainAccount) {
            let encryptedBlockchainAccount = encrypt(blockchainAccount);
            await userDetails.update(
                {
                    blockchain: encryptedBlockchainAccount,
                },
                {
                    transaction: t,
                },
                prefix
            );
        }
        if (bitgoAccount) {
            let encryptedBitgoAccount = encrypt(bitgoAccount);
            await userDetails.update(
                {
                    bitgo_wallet: encryptedBitgoAccount,
                },
                {
                    transaction: t,
                },
                prefix
            );
        }
        if (blocktrailAccount) {
            let encryptedBlocktrailAccount = encrypt(blocktrailAccount);
            await userDetails.update(
                {
                    bitcoin_address: encryptedBlocktrailAccount,
                },
                {
                    transaction: t,
                },
                prefix
            );
        }
        if (paymentMethod) {
            userDetails.update(
                {
                    payout_type: paymentMethod,
                },
                {
                    transaction: t,
                },
                prefix
            );
        }

        let configuration = await config.findOne({
            attributes: ["profile_updation_history"],
            prefix,
        });
        // if (configuration.profile_updation_history == 1) {
        //   let history = `Updated Payment details as `;
        //   if (!paypalAccount) {
        //     history += `Paypal Account: NA,`;
        //   } else {
        //     history += `Paypal Account:${paypalAccount},`;
        //   }
        //   if (!blockchainAccount) {
        //     history += `Blockchain Address: NA,`;
        //   } else {
        //     history += `Blockchain Address:${blockchainAccount},`;
        //   }
        //   if (!bitgoAccount) {
        //     history += `BitGo Address: NA,`;
        //   } else {
        //     history += `BitGo Address:${bitgoAccount},`;
        //   }
        //   if (!blocktrailAccount) {
        //     history += `Blocktrail Address: NA,`;
        //   } else {
        //     history += `Blocktrail Address:${blocktrailAccount},`;
        //   }
        //   if (paymentMethod) {
        //     history += `Payment Method: ${paymentMethod},`;
        //   }
        //   await configChange.create(
        //     {
        //       done_by: id,
        //       done_by_type: "user",
        //       ip: ip,
        //       description: history,
        //       activity: "profile updation",
        //       date: Date("Y-m-d H:i:s"),
        //     },
        //     {
        //       transaction: t,
        //       prefix,
        //     }
        //   );
        //   await t.commit();
        //   let response = await successMessage({
        //     message: "payment_details_update_success",
        //   });
        //   return res.json(response);
        // } else {
        // }
        await t.commit();
        let response = await successMessage({
            message: "payment_details_update_success",
        });
        return res.json(response);
    } catch (err) {
        await t.rollback();
        return res.status(500).json({
            status: false,
            message: `Error:${err.message}`,
        });
    }
};

exports.getUpgradePackage = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id } = req.user;
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        if (moduleStatus.ecom_status) {
            //TODO OC
            var currentPack = await User.findOne({
                attributes: ["id"],
                where: {
                    id: id,
                },
                include: [
                    {
                        where: {
                            package_type: "registration",
                        },
                        model: ocPdt,
                        as: "oc_package",
                        attributes: [
                            "product_id",
                            "model",
                            "package_id",
                            "price",
                            "pair_value",
                        ],
                    },
                ],
                prefix,
            });
            const upgradablePackList = await ocPdt.findAll({
                attributes: ["model", "product_id", "price", "pair_value"],
                where: {
                    package_type: "registration",
                    [Op.and]: {
                        status: 1,
                        product_id: {
                            [Op.ne]: currentPack?.oc_package?.product_id,
                        },
                        price: {
                            [Op.gt]: parseFloat(currentPack?.oc_package?.price),
                        },
                    },
                },
                prefix,
            });
            var newUpgradablePackageList = [];
            for await (let [key, value] of Object.entries(upgradablePackList)) {
                newUpgradablePackageList[key] = {
                    product_id: value.product_id,
                    product_name: value.model,
                    package_id: value.product_id,
                    price: Number(value.price),
                    pair_value: value.pair_value,
                };
            }
        } else {
            var currentPack = await User.findOne({
                attributes: ["id"],
                where: {
                    id: id,
                },
                include: [
                    {
                        where: {
                            type: "registration",
                        },
                        model: pack,
                        as: "package",
                        attributes: [
                            "id",
                            "name",
                            "product_id",
                            "price",
                            "pair_value",
                        ],
                    },
                ],
                prefix,
            });
            var upgradablePackList =
                await CommonServices.getUpgradablePackageList(
                    currentPack,
                    prefix
                );

            // const upgradablePackList = await pack.findAll({
            //   attributes: [
            //     "id",
            //     "name",
            //     "product_id",
            //     "price",
            //     "pair_value",
            //     // [Sequelize.fn("min", Sequelize.col("price")), "minPrice"],
            //   ],
            //   where: {
            //     type: "registration",
            //     [Op.and]: {
            //       active: 1,
            //       product_id: {
            //         [Op.ne]: currentPack.package["product_id"],
            //       },
            //       price: {
            //         [Op.gt]: parseFloat(currentPack.package["price"]),
            //       },
            //     },
            //   },
            //   prefix,
            // });
            var newUpgradablePackageList = [];
            for await (let [key, value] of Object.entries(upgradablePackList)) {
                newUpgradablePackageList[key] = {
                    product_id: value.id,
                    product_name: value.name,
                    package_id: value.product_id,
                    price: Number(value.price),
                    pair_value: value.pair_value,
                };
            }
        }
        const currentPackageDetails = {
            product_id: currentPack?.package?.id
                ? currentPack?.package?.id
                : currentPack?.oc_package?.product_id,
            product_name: currentPack?.package?.name
                ? currentPack?.package?.name
                : currentPack?.oc_package?.model,
            price: currentPack?.package?.price
                ? Number(currentPack?.package?.price)
                : currentPack?.oc_package?.price,
            package_id: currentPack?.package?.product_id
                ? currentPack?.package?.product_id
                : currentPack?.oc_package?.product_id,
            pv: currentPack?.package?.pair_value
                ? currentPack?.package?.pair_value
                : currentPack?.oc_package?.pair_value,
        };
        res.status(200).json({
            status: true,
            data: {
                current_package_details: currentPackageDetails,
                upgrade_list: newUpgradablePackageList
                    ? newUpgradablePackageList
                    : [],
            },
        });
    } catch (err) {
        return res.status(500).json(err.message);
    }
};

exports.updatePassword = async (req, res) => {
    const prefix = req.headers["api-key"];
    if (!prefix) {
        let response = await errorMessage({ code: 1001 });
        return res.json(response);
    }
    const { id } = req.user;
    const { current_password, new_password } = req.body;

    try {
        const user = await User.findOne({
            attributes: ["id", "password"],
            where: {
                id: id,
            },
            prefix,
        });
        const checkPassword = await bcrypt.compare(
            current_password,
            user.password
        );
        if (!checkPassword) {
            let response = await errorMessage({ code: 1021 });
            return res.json(response);
        }
        const encryptedNewPassword = await bcrypt.hash(new_password, 10);
        await user.update(
            {
                password: encryptedNewPassword,
            },
            {},
            prefix
        );

        res.status(200).json({
            status: true,
            message: "Password updated successfully",
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: `Error:${err.message}`,
        });
    }
};

exports.updateTransactionPassword = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id } = req.user;
        const { current_password, new_password } = req.body;
        const trans = await TransPass.findOne({
            attributes: ["id", "password"],
            where: {
                user_id: id,
            },
            prefix,
        });
        const checkTransPassword = await bcrypt.compare(
            current_password,
            trans.password
        );
        if (!checkTransPassword) {
            let response = await errorMessage({ code: 1015 });
            return res.json(response);
        }
        const encryptedNewTransPassword = await bcrypt.hash(new_password, 10);
        await trans.update(
            {
                password: encryptedNewTransPassword,
            },
            {},
            prefix
        );
        res.status(200).json({
            status: true,
            message: "Transaction Password updated successfully",
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: `Error:${err.message}`,
        });
    }
};

exports.uploadProfilePic = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id } = req.user;
        await uploadFile(req, res, async function (err) {
            if (err != undefined) {
                if (err instanceof multer.MulterError) {
                    if (err.code == "LIMIT_FILE_SIZE") {
                        let response = await errorMessage({ code: 1018 });
                        return res.status(500).json(response);
                    }
                } else if (err) {
                    // An unknown error occurred when uploading.
                    if (
                        err.message ==
                        "Only images jpg|jpeg|png|pdf are allowed"
                    ) {
                        let response = await errorMessage({ code: 1017 });
                        return res.status(500).json(response);
                    } else {
                        let response = await errorMessage({ code: 1024 });
                        return res.status(500).json(response);
                    }
                }
            } else {
                if (req.file == undefined) {
                    let response = await errorMessage({ code: 1017 });
                    return res.json(response);
                }
                const userDetails = await UserDetails.findOne({
                    attributes: ["id", "image"],
                    where: {
                        user_id: id,
                    },
                    prefix,
                });

                // const oldImageUrl = join(
                //     __dirname,
                //     "/../../uploads/images/profilePic/",
                //     userDetails?.image ? userDetails.image : ""
                // );

                const oldImageUrl = join(
                    fileURLToPath(import.meta.url),
                    "/../../uploads/images/profilePic/",
                    userDetails?.image ? userDetails.image : ""
                );
                
                console.log("oldImageUrl", oldImageUrl);
                

                if (userDetails.image != "no_photo.jpg") {
                    if (fs.existsSync(oldImageUrl && !userDetails?.image)) {
                        fs.unlinkSync(oldImageUrl);
                    }
                }
                userDetails.update(
                    {
                        image: `${process.env.image_url}profilePic/${req.file.filename}`,
                    },
                    {},
                    prefix
                );
                res.status(200).send({
                    message:
                        "File uploaded successfully: " + req.file.originalname,
                });
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: `${err}`,
        });
    }
};

exports.kycUploads = async (req, res) => {
    const { id } = req.user;
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }

        await multipleUpload(req, res, async function (err) {
            if (err != undefined) {
                if (err instanceof multer.MulterError) {
                    if (err.code == "LIMIT_FILE_SIZE") {
                        let response = await errorMessage({ code: 1018 });
                        return res.status(500).json(response);
                    }
                } else if (err) {
                    // An unknown error occurred when uploading.
                    if (
                        err.message ==
                        "Only images jpg|jpeg|png|pdf are allowed"
                    ) {
                        let response = await errorMessage({ code: 1017 });
                        return res.status(500).json(response);
                    } else {
                        let response = await errorMessage({ code: 1024 });
                        return res.status(500).json(response);
                    }
                }
            } else {
                const data = req.files;
                const { category } = req.body;
                if (req.files.length > 0) {
                    const uploadConfig = await config.findOne({
                        attributes: ["upload_config"],
                        prefix,
                    });
                    const uploadCount = await UserDetails.findOne({
                        attributes: ["upload_count"],
                        where: {
                            user_id: id,
                        },
                        prefix,
                    });
                    if (
                        uploadCount["upload_count"] >=
                        uploadConfig["upload_config"]
                    ) {
                        return res.status(500).json({
                            status: false,
                            message: "upload limit exceeded",
                        });
                    }
                    const username = await User.findOne({
                        attributes: ["username"],
                        where: {
                            id: id,
                        },
                        prefix,
                    });

                    const uploadKycDocs = await kycDocs.findOne({
                        attributes: ["id"],
                        where: {
                            user_id: id,
                            type: category,
                            status: {
                                [Op.ne]: 0,
                            },
                        },
                        prefix,
                    });
                    if (uploadKycDocs != null) {
                        return res.json({
                            status: false,
                            error: {
                                code: 1041,
                                description: "ID Already Exists",
                            },
                        });
                    }
                    Object.entries(data).map(([key, value]) => {
                        const filename = value.filename;
                        kycDocs.create(
                            {
                                file_name: `${process.env.image_url}kyc/${filename}`,
                                status: 2,
                                type: category,
                                date: new Date(),
                                user_id: id,
                            },
                            { prefix }
                        );
                    });
                    return res.json({
                        status: true,
                        data: "",
                    });
                } else {
                    return res.send(`You must select at least 1 file.`);
                }
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send({
            message: `${err}`,
        });
    }
};

exports.getKycDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        let kycDetails = await kyc.findAll({ prefix });
        let documentResult = await kycDocs.findAll({
            include: [
                {
                    model: kyc,
                    attributes: ["category"],
                    as: "kyccat",
                },
            ],
            where: {
                user_id: userId,
            },
            prefix,
        });

        // let documents = [];
        //   for await (let [key, value] of Object.entries(kycdocuments)) {
        //     console.log("kyc result",value)
        //     documents[key] = {
        //       id: value.id,
        //       file_name: [value.file_name],
        //       status:value.status==1 ? 'approved':value.status==2 ? 'pending' : "rejected",
        //       reason: value.reason,
        //       date: value.date,
        //       category:value.kyccat.category,
        //     };
        //   }
        // let documents= kycdocuments.map((value)=>{
        //     return  {
        //       id: value.id,
        //       file_name: [value.file_name],
        //       status:value.status==1 ? 'approved':value.status==2 ? 'pending' : "rejected",
        //       reason: value.reason,
        //       date: value.date,
        //        category:value.kyccat.category,

        //     }
        //   })
        //   console.log(documents)
        let documentsData = [];
        Object.entries(documentResult).map(([key, value]) => {
            documentsData[key] = {
                id: value.id,
                file_name: [value.file_name],
                status:
                    value.status == 1
                        ? "approved"
                        : value.status == 2
                        ? "pending"
                        : "rejected",
                reason: value.reason,
                date: value.date,
                category: value.kyccat?.category,
            };
        });

        res.json({
            status: true,
            data: {
                category: kycDetails,
                id: documentsData,
            },
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send({
            message: `${err}`,
        });
    }
};

exports.getProfileView = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id } = req.user;
        let userMemberShipDetails;
        var profile = {};
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        var rank_details;
        if (moduleStatus.rank_status) {
            rank_details = await User.findOne({
                attributes: ["id"],
                where: {
                    id: id,
                },
                include: [
                    {
                        model: rankDetails,
                        as: "rank",
                    },
                ],
                prefix,
            });
        }

        const userDetails = await User.findOne({
            where: {
                id: id,
            },
            include: [
                {
                    model: UserDetails,
                    as: "details",
                },
            ],
            prefix,
        });
        console.log("userDetails =>", userDetails);

        var passwordPolicy = await passPolicy.getPasswordPolicy(prefix);
        var country = await Country.getAllCountries(prefix);
        var states = await States.getAllStates(
            userDetails.details.country_id,
            prefix
        );
        // var states = await States.getAllStates(userDetails['details']['user_detail_country'])
        if (passPolicy["enable_policy"] == 1) {
        }

        if (moduleStatus.rank_status) {
            const rank = {
                title: "rank",
                curent_rank: rank_details?.rank?.rank_name
                    ? rank_details["rank"]["rank_name"]
                    : "NA",
                rank_color: rank_details?.rank?.rank_color
                    ? rank_details?.rank?.rank_color
                    : "NA",
            };
            profile["rank"] = rank;
        }
        if (moduleStatus.product_status) {
            userMemberShipDetails =
                await CommonServices.getProductNameFromUserID(id, prefix);
        }

        //TODO product validity
        var memberShipPackageDetails = {
            title: "Membership Package : ",
            name: userMemberShipDetails,
        };
        if (moduleStatus.subscription_status) {
            let expiryvdate = await CommonServices.getProductValidityDate(
                id,
                prefix
            );
            let expiryStatus = true;
            if (expiryvdate >= new Date().toLocaleDateString()) {
                expiryStatus = false;
            }
            memberShipPackageDetails["product_validity"] = {
                title: "Membership Expiry : ",
                date: expiryvdate,
                status: expiryStatus,
                renewal_link: "",
            };
            if (moduleStatus.ecom_status) {
                let renewalLink = await CommonServices.createEcomLink(
                    id,
                    "renew",
                    prefix
                );
                memberShipPackageDetails["product_validity"] = {
                    ...memberShipPackageDetails["product_validity"],
                    renewal_link: renewalLink,
                };
            }
        }
        const upgradeStatus = await CommonServices.isEligibleUpgrade(
            id,
            prefix
        );

        console.log("upgradeStatus =>", upgradeStatus);

        if (moduleStatus.package_upgrade && upgradeStatus) {
            if (!moduleStatus.ecom_status) {
                let currentPackageDetails =
                    await CommonServices.getMembershipPackageDetails(
                        id,
                        prefix
                    );
                var upgradablePackList = [];
                if (currentPackageDetails) {
                    upgradablePackList =
                        await CommonServices.getUpgradablePackageList(
                            currentPackageDetails,
                            prefix
                        );
                }

                if (upgradablePackList && upgradablePackList.length > 0) {
                    memberShipPackageDetails["upgrade_link"] = "";
                }
            } else {
                if (moduleStatus.product_status) {
                    memberShipPackageDetails["upgrade_link"] =
                        await CommonServices.createEcomLink(
                            id,
                            "upgrade",
                            prefix
                        );
                }
            }
        }
        // const isSubaccount = await CommonServices.isSubAccount(id, prefix);
        // var createSubAccountStatus = !isSubaccount;
        const createSubAccountStatus = !(await CommonServices.isSubAccount(
            id,
            prefix
        ));
        console.log("userDetails =>", userDetails);
        console.log("userDetails.details =>", userDetails.details);
        var profile = {
            full_name: `${userDetails.details.name} ${userDetails.details.second_name}`,
            user_name: `${userDetails.username}`,
            user_photo:
                userDetails.details.image == undefined ||
                userDetails.details.image == "NULL"
                    ? ""
                    : userDetails.details.image,
            email: `${userDetails.details.email}`
                ? `${userDetails.details.email}`
                : `NULL`,
            password_policy: passwordPolicy,
            membership_package: memberShipPackageDetails,
            createSubAccount: createSubAccountStatus,
        };

        if (moduleStatus.kyc_status) {
            profile = {
                ...profile,
                kyc_status: userDetails.details.kyc_status,
            };
        }

        const sponsorDetails = await UserDetails.findOne({
            where: {
                id: userDetails.sponsor_id,
            },
            prefix,
        });

        const fatherDetails = await UserDetails.findOne({
            where: {
                id: userDetails.father_id,
            },
            prefix,
        });

        const placement = [
            {
                title: "Sponsor",
                text: "sponsor",
                head: sponsorDetails?.name,
            },
            {
                title: "Placement",
                text: "placement",
                head: fatherDetails?.name,
            },
            {
                head: userDetails.position === "L" ? "Left" : "Right",
                text: "position",
                title: "Position",
            },
        ];
        const pv = [
            {
                head: `${userDetails?.personal_pv}`,
                text: "personalPv",
                title: "Personal",
            },
            {
                head: `${userDetails?.group_pv}`,
                text: "groupPV",
                title: "Group",
            },
            {
                head: userDetails?.total_left_carry,
                text: "leftCarry",
                title: "Left carry",
            },
            {
                head: userDetails?.total_right_carry,
                text: "rightCarry",
                title: "Right carry",
            },
        ];
        const extraData = {
            placement: placement,
            pv: pv,
        };

        const signUpFields = await signupFields.findAll({
            attributes: ["name", "required"],
            where: {
                status: 1,
            },
            prefix,
        });

        // personal Details & contact Details GET function
        var personalDetailsField = [];
        var contactDetailsField = [];
        Object.entries(signUpFields).map(([key, value]) => {
            if (value.name == "first_name") {
                var firstField = {
                    title: "First name",
                    code: "firstName",
                    value: userDetails.details.name
                        ? userDetails.details.name
                        : null,
                    type: "text",
                    required: value.required,
                };
                personalDetailsField.push(firstField);
            }
            if (value.name == "last_name") {
                var lastField = {
                    title: "Last name",
                    code: "lastName",
                    value: userDetails.details.second_name
                        ? userDetails.details.second_name
                        : null,
                    type: "text",
                    required: value.required,
                };
                personalDetailsField.push(lastField);
            }
            if (value.name == "gender") {
                var genderField = {
                    title: "Gender",
                    code: "gender",
                    value: userDetails.details.gender
                        ? userDetails.details.gender
                        : null,
                    type: "select",
                    required: value.required,
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
                personalDetailsField.push(genderField);
            }
            if (value.name == "date_of_birth") {
                var dobField = {
                    title: "Date Of Birth",
                    code: "dateOfBirth",
                    value: userDetails.details.dob
                        ? userDetails.details.dob
                        : null,
                    type: "date",
                    required: value.required,
                };
                personalDetailsField.push(dobField);
            }
            if (value.name == "address_line1") {
                var addrLine1 = {
                    title: "Address Line 1",
                    code: "addressLine1",
                    value: userDetails.details.address
                        ? userDetails.details.address
                        : null,
                    type: "text",
                    required: value.required,
                    field_name: "address_line1",
                };
                contactDetailsField.push(addrLine1);
            }
            if (value.name == "address_line2") {
                var addrLine2 = {
                    title: "Address Line 2",
                    code: "addressLine2",
                    value: userDetails.details.address2
                        ? userDetails.details.address2
                        : null,
                    type: "text",
                    required: value.required,
                    field_name: "address_line2",
                };
                contactDetailsField.push(addrLine2);
            }
            if (value.name == "country") {
                var countryField = {
                    title: "Country",
                    code: "country",
                    value: userDetails.details.country_id
                        ? userDetails.details.country_id
                        : null,
                    type: "select",
                    required: value.required,
                    options: country,
                    field_name: "country",
                };
                contactDetailsField.push(countryField);
            }
            if (value.name == "state") {
                var stateField = {
                    title: "State",
                    code: "state",
                    value: userDetails.details.state_id
                        ? userDetails.details.state_id
                        : null,
                    type: "select",
                    required: value.required,
                    options: states,
                    // 'options': states,
                    field_name: "state",
                };
                contactDetailsField.push(stateField);
            }
            if (value.name == "city") {
                var cityField = {
                    title: "City",
                    code: "city",
                    value: userDetails.details.city
                        ? userDetails.details.city
                        : null,
                    type: "text",
                    required: value.required,
                    field_name: "city",
                };
                contactDetailsField.push(cityField);
            }
            if (value.name == "pin") {
                var pinField = {
                    title: "Zip Code",
                    code: "zipCode",
                    value: userDetails.details.pin
                        ? userDetails.details.pin
                        : null,
                    type: "text",
                    required: value.required,
                    field_name: "pin",
                };
                contactDetailsField.push(pinField);
            }
            if (value.name == "email") {
                var emailField = {
                    title: "Email",
                    code: "email",
                    value: userDetails.details.email
                        ? userDetails.details.email
                        : null,
                    type: "text",
                    required: value.required,
                    field_name: "email",
                };
                contactDetailsField.push(emailField);
            }
            if (value.name == "mobile") {
                var mobileField = {
                    title: "Mobile",
                    code: "mobile",
                    value: userDetails.details.mobile
                        ? userDetails.details.mobile
                        : null,
                    type: "text",
                    required: value.required,
                    field_name: "mobile",
                };
                contactDetailsField.push(mobileField);
            }
            if (value.name == "land_line") {
                var landField = {
                    title: "Landline No",
                    code: "landline",
                    value: userDetails.details.land_phone
                        ? userDetails.details.land_phone
                        : "",
                    type: "text",
                    required: value.required,
                    field_name: "land_line",
                };
                contactDetailsField.push(landField);
            }
        });
        // Bank Details Get function
        var bankDetailsField = [];
        bankDetailsField = [
            {
                title: "Bank Name",
                code: "bankName",
                value: userDetails.details?.bank
                    ? userDetails.details.bank
                    : "",
                type: "text",
                required: false,
            },
            {
                title: "Branch_name",
                code: "branchName",
                value: userDetails.details?.branch
                    ? userDetails.details.branch
                    : "",
                type: "text",
                required: false,
            },
            {
                title: "Account Holder",
                code: "accountHolder",
                value: userDetails.details?.nacct_holder
                    ? userDetails.details?.nacct_holder
                    : "",
                type: "text",
                required: false,
            },
            {
                title: "Account No",
                code: "accountNo",
                value: userDetails.details?.account_number
                    ? userDetails.details?.account_number
                    : "",
                type: "text",
                required: false,
            },
            {
                title: "IFSC",
                code: "ifsc",
                value: userDetails.details?.ifsc
                    ? userDetails.details.ifsc
                    : "",
                type: "text",
                required: false,
            },
            {
                title: "Pan",
                code: "pan",
                value: userDetails.details?.pan ? userDetails.details.pan : "",
                type: "text",
                required: false,
            },
        ];
        const paymentGatewayConfig = await paymentConfig.findAll({
            attributes: ["name", "payout_status"],
            where: {
                payout_status: 1,
                name: {
                    [Op.ne]: "Bank Transfer",
                },
            },
            prefix,
        });

        console.log(` ===== payment gateway configurations ===== `);
        console.log(
            `===== ${JSON.stringify(paymentGatewayConfig)}${JSON.stringify(
                userDetails.details.bitcoin_address
            )} `
        );
        console.log(` ===== payment gateway configurations ===== `);

        var Config = [];
        var method = [];
        Object.entries(paymentGatewayConfig).map(([key, value]) => {
            switch (value.name) {
                case "Paypal":
                    Config[key] = {
                        title: "Paypal Account",
                        code: "paypalAccount",
                        value: userDetails.details.paypal
                            ? decrypt(userDetails.details.paypal)
                            : "NA",
                        type: "text",
                        required: false,
                    };
                    break;
                // case "Bitcoin":
                //   Config[key] = {
                //     title: "Blocktrail",
                //     code: "blocktrailAccount",
                //     value: userDetails.details.bitcoin_address
                //       ? decrypt(userDetails.details.bitcoin_address)
                //       : "NA",
                //     type: "text",
                //     required: false,
                //   };
                //   break;
                case "Wallet":
                    Config[key] = {
                        title: "Wallet",
                        code: "wallet",
                        value: userDetails.details.bitcoin_address
                            ? decrypt(userDetails.details.bitcoin_address)
                            : "NA",
                        type: "text",
                        required: false,
                    };
                    break;
                case "Blockchain":
                    Config[key] = {
                        title: "Blockchain Wallet Address",
                        code: "blockchainAccount",
                        value: userDetails.details.blockchain
                            ? decrypt(userDetails.details.blockchain)
                            : "NA",
                        type: "text",
                        required: false,
                    };
                    break;
                default:
                    Config[key] = {
                        title: "Bitgo",
                        code: "bitgoAccount",
                        value: userDetails.details.bitgo_wallet
                            ? decrypt(userDetails.details.bitgo_wallet)
                            : "NA",
                        type: "text",
                        required: false,
                    };
                    break;
            }
        });
        // for (let [key, value] of Object.entries(paymentGatewayConfig)) {
        //   switch (value.name) {
        //     case "Paypal":
        //       Config[key] = {
        //         title: "Paypal Account",
        //         code: "paypalAccount",
        //         value: userDetails.details.paypal
        //           ? decrypt(userDetails.details.paypal)
        //           : "NA",
        //         type: "text",
        //         required: false,
        //       };
        //       break;
        //     // case "Bitcoin":
        //     //   Config[key] = {
        //     //     title: "Blocktrail",
        //     //     code: "blocktrailAccount",
        //     //     value: userDetails.details.bitcoin_address
        //     //       ? decrypt(userDetails.details.bitcoin_address)
        //     //       : "NA",
        //     //     type: "text",
        //     //     required: false,
        //     //   };
        //     //   break;
        //     case "Wallet":
        //       Config[key] = {
        //         title: "Wallet",
        //         code: "wallet",
        //         value: userDetails.details.bitcoin_address
        //           ? decrypt(userDetails.details.bitcoin_address)
        //           : "NA",
        //         type: "text",
        //         required: false,
        //       };
        //       break;
        //     case "Blockchain":
        //       Config[key] = {
        //         title: "Blockchain Wallet Address",
        //         code: "blockchainAccount",
        //         value: userDetails.details.blockchain
        //           ? decrypt(userDetails.details.blockchain)
        //           : "NA",
        //         type: "text",
        //         required: false,
        //       };
        //       break;
        //     default:
        //       Config[key] = {
        //         title: "Bitgo",
        //         code: "bitgoAccount",
        //         value: userDetails.details.bitgo_wallet
        //           ? decrypt(userDetails.details.bitgo_wallet)
        //           : "NA",
        //         type: "text",
        //         required: false,
        //       };
        //       break;
        //   }
        // }
        Object.entries(paymentGatewayConfig).map(([key, value]) => {
            switch (value.name) {
                case "Bitcoin":
                    method[key] = {
                        title: "Blocktrail",
                        code: value.name,
                        value: value.name,
                    };
                    break;

                default:
                    method[key] = {
                        title: value.name,
                        code: value.name,
                        value: value.name,
                    };
                    break;
            }
        });
        const payoutMethod = {
            title: "Payout Method",
            code: "paymentMethod",
            value: userDetails.details?.payout_type,
            type: "select",
            required: false,
            options: method,
        };
        // res.json(method);
        Config.push(payoutMethod);
        const personalDetails = {
            title: "Personal Details",
            code: "personalDetails",
            fields: personalDetailsField,
        };
        const contactDetails = {
            title: "Contact Details",
            code: "contactDetails",
            fields: contactDetailsField,
        };
        const bankDetails = {
            title: "Bank Details",
            code: "bankDetails",
            fields: bankDetailsField,
        };
        const paymentDetails = {
            title: "payment_gateway",
            code: "paymentDetails",
            fields: Config,
        };

        var settingsFields = [];
        if (moduleStatus.lang_status) {
            var languageFields = [];
            const langs = await Language.getAllLanguage(prefix);
            Object.entries(langs).map(([key, value]) => {
                languageFields[key] = {
                    value: `${value.code}`,
                    title: `${value.label}`,
                    code: `${value.label}`,
                    lang_id: `${value.id}`,
                };
            });
            var fields1 = {
                title: "Language",
                code: "language",
                value: "",
                type: "select",
                required: true,
                options: languageFields,
            };
            settingsFields.push(fields1);
        }
        if (moduleStatus.multi_currency_status) {
            var currencyFields = [];
            const currencies = await Curr.getAllCurrencies(prefix);
            Object.entries(currencies).map(([key, value]) => {
                currencyFields[key] = {
                    value: `${value.id}`,
                    title: `${value.symbol_left} ${value.title}`,
                    code: `${value.symbol_left} ${value.title}`,
                    currency_code: `${value.code}`,
                    precision: `${value.precision}`,
                    symbol_left: `${value.symbol_left}`,
                    currency_value: `${value.value}`,
                };
            });
            var fields2 = {
                title: "currency",
                code: "currency",
                value: userDetails.details.bitgo_wallet,
                type: "select",
                required: true,
                options: currencyFields,
            };
            settingsFields.push(fields2);
        }

        if (moduleStatus.google_auth_status) {
            var Fields3 = {
                title: "Google Auth Status",
                code: "googleAuthStatus",
                value: `${userDetails.google_auth_status}`,
                type: "select",
                required: true,
                options: [
                    {
                        title: "Enabled",
                        code: "enabled",
                        value: 1,
                    },
                    {
                        title: "Disabled",
                        code: "disabled",
                        value: 0,
                    },
                ],
            };
            settingsFields.push(Fields3);
        }
        if (moduleStatus.mlm_plan == "Binary") {
            var Field4 = {
                title: "Binary Position Lock",
                code: "binaryLegSettings",
                value: userDetails.binary_leg,
                type: "select",
                required: true,
                options: [
                    {
                        title: "None",
                        code: "none",
                        value: "any",
                    },
                    {
                        title: "Left Leg",
                        code: "leftLeg",
                        value: "left",
                    },
                    {
                        title: "Right Leg",
                        code: "rightLeg",
                        value: "right",
                    },
                    {
                        title: "Weak Leg",
                        code: "weakLeg",
                        value: "weak_leg",
                    },
                ],
            };
            settingsFields.push(Field4);
        }

        if (
            moduleStatus.lang_status ||
            moduleStatus.mlm_plan == "Binary" ||
            moduleStatus.multi_currency_status ||
            moduleStatus.google_auth_status
        ) {
            var settingsDetailsFields = {
                title: "Settings",
                code: "settingsDetails",
                fields: settingsFields,
            };
        } else {
            var settingsDetailsFields = [];
        }

        const editFields = {
            personal_details: personalDetails,
            contact_details: contactDetails,
            bank_details: bankDetails,
            payment_details: paymentDetails,
            settings_details: settingsDetailsFields,
        };

        const data = {
            profile: profile,
            extra_data: extraData,
            edit_fields: editFields,
        };
        res.json({
            status: true,
            data: data,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
};

exports.deleteProfilePic = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id } = req.user;
        const userDetails = await UserDetails.findOne({
            attributes: ["id", "image"],
            where: {
                user_id: id,
            },
            prefix,
        });

        const oldImageUrl = join(
            __dirname,
            "/../../uploads/images/profilePic/",
            userDetails.image == null ? "" : userDetails.image
        );
        if (
            userDetails.image == undefined ||
            userDetails.image == null ||
            userDetails.image == "NULL"
        ) {
            return res.status(404).json({ status: 404 });
        }
        if (userDetails.image != "no_photo.jpg") {
            if (fs.existsSync(oldImageUrl)) {
                fs.unlinkSync(oldImageUrl);
            }
        }
        userDetails.update(
            {
                image: null,
            },
            {},
            prefix
        );
        res.status(200).send({
            success: true,
            data: "",
        });
    } catch (err) {
        return res.status(500).json(err.message);
    }
};

exports.changeCountry = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { country_id } = req.query;
        const result = await States.getAllStates(country_id, prefix);
        return res.json({ status: true, data: result });
    } catch (err) {
        res.status(500).json(err.message);
    }
};

exports.subscriptionDetails = async (req, res) => {
    const { id } = req.user;
    const prefix = req.headers["api-key"];
    if (!prefix) {
        let response = await errorMessage({ code: 1001 });
        return res.json(response);
    }
    try {
        let subscriptionData = await profileService.getSubscriptionDetails(
            id,
            prefix
        );
        if (!subscriptionData) {
            let response = await errorMessage({ code: 1003 });
            return res.json(response);
        }
        let validityDate;
        if (subscriptionData.product_validity == null) {
            validityDate = "NA";
        } else {
            validityDate =
                subscriptionData.product_validity.toLocaleDateString();
        }
        let data = {
            id: subscriptionData?.package?.id
                ? subscriptionData?.package?.id
                : subscriptionData?.oc_package?.product_id,
            validity: validityDate,
            price: subscriptionData?.package?.price
                ? subscriptionData?.package?.price
                : subscriptionData?.oc_package?.price,
        };
        let response = await successMessage({ value: data });
        return res.json(response);
    } catch (error) {
        console.log(error);
        return res.json(error.message);
    }
};

exports.subscription = async (req, res) => {
    let t = await mlm_laravel.transaction();
    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
    try {
        let purchase = {};
        const { id } = req.user;
        let response;
        let postArr = req.body;
        const prefix = req.headers["api-key"];
        if (!prefix) {
            response = await errorMessage({ code: 1001 });
            return res.json(response);
        }

        let userProductValidity = await CommonServices.getUserProductValidity(
            id,
            prefix
        );

        if (userProductValidity != null || userProductValidity != undefined) {
            let userpvalidity = new Date(userProductValidity)
                .toISOString()
                .split("T")[0];
            let currentdate = new Date().toISOString().split("T")[0];
            if (userpvalidity >= currentdate) {
                response = await errorMessage({ code: 403 });
                return res.status(422).json(response);
            }
        }
        purchase["user_id"] = id;

        let subscription = await SubscriptionConfig.findOne({ prefix });

        let moduleStatus = await modStatus.getModuleStatus(prefix);

        if (
            moduleStatus.subscription_status &&
            subscription.based_on == "amount_based"
        ) {
            purchase["total_amount"] = subscription.fixed_amount;
        } else {
            var product = await CommonServices.getProductDetails(
                postArr.product_id,
                "",
                prefix
            );
            purchase["total_amount"] = product.price;
        }
        let username = await CommonServices.idToUsername(id, prefix);
        switch (postArr.payment_method) {
            case "freejoin":
                var paymentType = "free_purchase";
                var paymentMethod = "Free Joining";
                purchase["by_using"] = "free join";
                var paymentStatus = true;
                break;
            case "banktransfer":
                var paymentType = "bank_transfer";
                purchase["by_using"] = "bank_transfer";
                var ewalletUser = postArr.user_name_ewallet;
                payment_receipt = await UploadServices.getReceipt(
                    "",
                    id,
                    "subscription_renewal",
                    prefix
                );

                var paymentStatus = true;
                break;
            case "ewallet":
                var paymentType = "ewallet";
                purchase["by_using"] = "ewallet";
                var ewalletUser = postArr.user_name_ewallet;
                var ewalletTransPass = postArr.tran_pass_ewallet;
                var product_id = postArr.product_id;
                var validated = await EwalletServices.validatePayment(
                    ewalletUser,
                    ewalletTransPass,
                    product_id,
                    "subscription_renewal",
                    id,
                    prefix
                );
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
                        let payUsingEwallet = await EwalletServices.runPayment(
                            ewalletUser,
                            ewalletTransPass,
                            product_id,
                            "subscription_renewal",
                            "package_validity",
                            prefix,
                            t
                        );
                        if (payUsingEwallet == false) {
                            response = await errorMessage({ code: 429 });
                            return res.json(response);
                        }
                        paymentStatus = true;
                        break;
                    default:
                        response = await errorMessage({ code: 429 });
                        return res.json(response);
                }
                break;
            case "epin":
                let pinDetails = [];
                paymentType = "epin";
                purchase["by_using"] = "epin";
                let pinCount = postArr.pin_array;
                for (let i = 0; i < pinCount; i++) {
                    pinDetails[i] = {
                        pin: postArr["epin" + (i + 1)],
                    };
                }
                let pinArray = await RepurchaseServices.checkAllEpins(
                    pinDetails,
                    postArr.product_id,
                    moduleStatus,
                    "",
                    "subscription_renewal",
                    id,
                    prefix
                );
                if (pinArray[0].isPinOk == false) {
                    response = await errorMessage({ code: 1049 });
                    return res.status(422).json(response);
                }
                let responseUpdateUsedUserEpin =
                    await RepurchaseServices.UpdateUsedUserEpin(
                        pinArray,
                        id,
                        prefix,
                        t
                    );
                if (responseUpdateUsedUserEpin) {
                    let updatedusedepin =
                        await RepurchaseServices.UpdateUsedEpin(
                            pinArray,
                            id,
                            "",
                            prefix,
                            t
                        );
                    if (updatedusedepin) {
                        paymentStatus = true;
                    } else {
                        response = await errorMessage({ code: 1044 });
                        return res.status(500).json(response);
                    }
                } else {
                    response = await errorMessage({ code: 1044 });
                    return res.status(500).json(response);
                }
                break;
            case "stripe":
                purchase["by_using"] = "stripe";
                const amount = await CommonServices.getProductName(
                    postArr.product_id,
                    prefix
                );
                const description = "Upgarde Validity";
                const stripePayment =
                    await PaymentGatewayServices.stripePayment(
                        postArr.token,
                        amount.price,
                        description
                    );
                if (stripePayment.status == "succeeded") {
                    const stripeTable =
                        await PaymentGatewayServices.insertInToStripePaymentActivity(
                            id,
                            stripePayment,
                            postArr.product_id,
                            null,
                            amount.price,
                            "Subscription Renewal",
                            prefix,
                            t
                        );
                    console.log(JSON.stringify(stripeTable));
                    if (stripeTable) {
                        paymentStatus = true;
                    } else {
                        response = await errorMessage({ code: 1030 });
                        return res.json(response);
                    }
                } else {
                    response = await errorMessage({ code: 1030 });
                    return res.status(422).json(response);
                }
                break;
            // TODO payment gateway
            default:
                response = await errorMessage({ code: 1030 });
                return res.status(422).json(response);
                break;
        }
        if (paymentStatus) {
            let packageupgraderesult =
                await profileService.packageValidityUpgrade(
                    postArr.product_id,
                    purchase,
                    false,
                    t,
                    prefix
                );
            if (packageupgraderesult == false) {
                let response = await errorMessage({ code: 1030 });
                return res.status(422).json(response);
            }
            // user Activity
            let dataArr = JSON.stringify(purchase);
            await CommonServices.insertUserActivity(
                "Membership reactivation",
                id,
                `Membership reactivation using ${purchase["by_using"]}`,
                dataArr,
                t,
                ip,
                prefix
            );
            await t.commit();
            // let response = await successMessage({ code: 200 });
            return res.json({ status: true, data: "" });
        }
    } catch (error) {
        console.log(error);
        await t.rollback();
        return res.status(422).json(error.message);
    }
};

exports.removeKyc = async (req, res) => {
    try {
        const user_id = req.user.id;
        let postArr = req.body;
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        await kycDocs.destroy({
            where: { id: req.body.id },
            prefix,
        });
        return res.json({
            status: true,
            data: "",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json(error.message);
    }
};

exports.forgetTransactionPassword = async (req, res) => {
    try {
        const prefix = process.env.PREFIX;
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const user_id = req.user.id;
        const username = await CommonServices.idToUsername(user_id, prefix);
        let details = await UserDetails.findOne({
            attributes: ["email"],
            where: {
                user_id,
            },
            prefix,
        });
        let userMail = await mailConfig(prefix);
        let result = await sendMail(
            userMail,
            "forgot_transaction_password",
            username,
            details.email,
            null,
            prefix
        );
        if (result) {
            let response = await successMessage({
                message:
                    "forgot transaction password reset mail sended successfully",
            });
            return res.json(response);
        }
    } catch (err) {
        console.log(err.message);
    }
};
