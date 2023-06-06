const db = require("../../models");
const { errorMessage, successMessage } = require("../../utils/web/response");
const jwt = require("jsonwebtoken");
const Common = require("../../utils/web/common");
const config = require("../../config/config");
const { mlm_laravel } = require("../../models");
const multer = require("multer");
const {
    getAllLanguage,
    getAllLanguageWithoutPrefix,
} = require("../../utils/web/allLanguages");
const {
    getAllCurrencies,
    getAllCurrenciesWithoutPrefix,
} = require("../../utils/web/allCurrency");
const {
    getAllCountries,
    getAllCountriesWithoutPrefix,
} = require("../../utils/web/allCountries");
const uploadFile = require("../../middleware/web/bankUpload");
const { bankReceiptUnpproved } = require("../../utils/web/uploadServices");
const Configuration = db.configuration;
const mlmUser = db.demoUsers;
const siteInformation = db.siteinfo;
const CompanyDetails = db.companyDetails;
const PendingUsers = db.pendingRegistration;
const UserDetails = db.userDetails;
const Payment = db.paymentConfig;
const Package = db.pack;
const Receipt = db.paymentReceipts;
const axios = require("axios");
const PendingTransaction = db.pendingTransaction;
const UserWalletbalance = db.userWalletBalance;
const PendingRegistration = db.pendingRegistration;
const WalletHistories = db.walletHistories;
const { approveRegister } = require("../../controllers/web/signupController");

exports.getApiKey = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.status(422).json(response);
        }
        if (process.env.DEMO_STATUS == "yes") {
            const adminUserName = req.query.admin_user_name;
            const key = await mlmUser.findOne({
                attributes: ["api_key", "prefix"],
                where: {
                    username: adminUserName,
                },
            });
            if (!key) {
                let response = await errorMessage({ code: 1042 });
                return res.status(422).json(response);
            }
            const api_key = `${key["prefix"]}_`;

            res.status(200).json({
                status: true,
                data: { key: api_key },
            });
        } else {
            // const { api_key } = await Configuration.findOne({
            //   attributes: ["api_key"],
            //   prefix: process.env.PREFIX,
            // });
            // if (!api_key) {
            //   res.status(400).json({
            //     status: false,
            //     message: "Key doesn't exists",
            //   });
            // }
            res.status(200).json({
                status: true,
                data: { key: process.env.PREFIX },
            });
        }
    } catch (err) {
        return res.status(500).send({
            message: `Error: ${err.message}`,
        });
    }
};

exports.checkToken = async (req, res) => {
    try {
        const token = req.body.token;
        const prefix = req.headers["api-key"];
        if (!prefix || !token) {
            let response = await errorMessage({ code: 401 });
            return res.json(response);
        }
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        // console.log("==================Decoded=====================", decoded);
        if (decoded.user_type == "user") {
            const accessTokenFromDB = await Common.getAccessToken(
                decoded.id,
                prefix
            );
            if (accessTokenFromDB != token || accessTokenFromDB == false) {
                return res.status(401).json({ status: false });
            }
            req.user = decoded;
            return res.json({ status: true, data: [] });
        } else {
            const tokenFromDB = await Common.getAccessTokenUnapproved(
                decoded.id,
                prefix
            );

            if (tokenFromDB != token || tokenFromDB == false) {
                return res.status(401).json({ status: false });
            }
            req.user = decoded;
            return res.json({ status: true, data: [] });
        }
    } catch (Err) {
        console.log(Err);
        let response = await errorMessage({ code: 1002 });
        res.status(422).json(response);
    }
};

exports.getAppInfo = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }

        let languages = [],
            currencies = [],
            companyDetailsResult = [];

        languages = await getAllLanguage(prefix);
        currencies = await getAllCurrencies(prefix);
        companyDetailsResult = await CompanyDetails.findOne({ prefix });

        let defaultLanguage = languages.find((o) => o.default === true);

        const company_info = {
            id: companyDetailsResult?.id ? companyDetailsResult?.id : 1,
            company_name: companyDetailsResult?.name
                ? companyDetailsResult?.name
                : "",
            logo: companyDetailsResult?.logo ? companyDetailsResult?.logo : "",
            email: companyDetailsResult?.email
                ? companyDetailsResult?.email
                : "",
            phone: companyDetailsResult?.phone
                ? companyDetailsResult?.phone
                : "",
            favicon: companyDetailsResult?.favicon
                ? companyDetailsResult?.favicon
                : "",
            company_address: companyDetailsResult?.address
                ? companyDetailsResult?.address
                : "",
            default_lang: defaultLanguage.id ? defaultLanguage?.id : "",
            fb_link: companyDetailsResult?.fb_link
                ? companyDetailsResult?.fb_link
                : "",
            twitter_link: companyDetailsResult?.twitter_link
                ? companyDetailsResult?.twitter_link
                : "",
            inst_link: companyDetailsResult?.inst_link
                ? companyDetailsResult?.inst_link
                : "",
            gplus_link: companyDetailsResult?.gplus_link
                ? companyDetailsResult?.gplus_link
                : "",
            fb_count: companyDetailsResult?.fb_count
                ? companyDetailsResult?.fb_count
                : 0,
            twitter_count: 0,
            inst_count: companyDetailsResult?.inst_count
                ? companyDetailsResult?.inst_count
                : 0,
            gplus_count: companyDetailsResult?.gplus_count
                ? companyDetailsResult?.gplus_count
                : 0,
            login_logo: companyDetailsResult?.login_logo
                ? companyDetailsResult?.login_logo
                : " ",
            logo_shrink: companyDetailsResult?.logo_shrink
                ? companyDetailsResult?.logo_shrink
                : "",
            navbar_dark_logo: companyDetailsResult?.dark_nav_icon
                ? companyDetailsResult?.dark_nav_icon
                : "",
            navbar_logo: companyDetailsResult?.light_nav_icon
                ? companyDetailsResult?.light_nav_icon
                : "",
        };

        return res.json({
            status: true,
            data: {
                lang_status: true,
                currency_status: true,
                languages,
                currencies,
                company_info,
            },
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json(err.message);
    }
};

exports.getCountries = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        let countries = [];
        if (prefix == process.env.default_api_key) {
            countries = await getAllCountriesWithoutPrefix();
        } else {
            countries = await getAllCountries(prefix);
        }
        return res.json({
            status: true,
            data: {
                country: countries,
            },
        });
    } catch (err) {
        console.log(err);
        return res
            .status(422)
            .json({ status: false, error: { details: err.message } });
    }
};

exports.addNewDemoVisitor = async (req, res) => {
    try {
        return res.json({
            status: true,
            data: { message: "otp_sent", visitor_id: 1 },
        });
    } catch (error) {
        return res.status(422).json({ status: false });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { demo_otp, visitor_id } = req.body;
        if (demo_otp != "1055") {
            res.status(422).json({
                status: false,
                error: { code: 1069, description: "OTP verification failed" },
            });
        } else {
            return res.json({
                status: true,
                data: { message: "otp_verified_successfully" },
            });
        }
    } catch (error) {
        return res.status(422).json({
            status: false,
            error: { code: 1068, description: "OTP expired" },
        });
    }
};

exports.getUnapprovedDashboard = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.status(422).json(response);
        }

        let unapprovedUser = req.user;
        let adminBankDetails = await UserDetails.findOne({
            attributes: ["bank", "branch", "ifsc", "account_number"],
            where: {
                user_id: 1,
            },
            prefix,
        });
        let userPendingDetails = await PendingUsers.findOne({
            where: {
                username: unapprovedUser.username,
            },
            prefix,
        });
        let parseData = JSON.parse(userPendingDetails.data);
        let package = await Package.findOne({
            attributes: ["name", "price", "pair_value"],
            where: {
                id: parseData.product_id,
            },
            prefix,
        });
        let packageDetails = {
            name: package.name,
            price: package.price,
            pv: package.pair_value,
        };
        let paymentMethod = await Payment.findOne({
            attributes: ["name"],
            where: {
                id: parseData.payment_method,
            },
            prefix,
        });
        const receipts = await Receipt.findOne({
            attributes: ["receipt"],
            where: {
                pending_registrations_id: unapprovedUser.id,
            },
            prefix,
        });

        const walletData = await UserWalletbalance.findOne({
            where: {
                unapproved_user_id: userPendingDetails.id,
            },
            prefix,
        });
        let data = {
            username: parseData.username,
            name: parseData.first_name,
            email: parseData.email,
            bank_details: adminBankDetails,
            package_details: packageDetails,
            status: unapprovedUser.approveStatus,
            payment_method:
                paymentMethod.name == "Bank Transfer"
                    ? "Wallet Transfer"
                    : paymentMethod.name,
            receipt_url: receipts?.receipt,
            regstrationAmount: parseData.totalAmount,
            walletAddress: walletData?.wallet_address
                ? walletData?.wallet_address
                : "",
            balance: walletData?.balance ? Number(walletData?.balance) : 0,
            enrollButton: walletData?.balance
                ? Number(walletData?.balance) >= Number(parseData.totalAmount)
                    ? true
                    : false
                : false,
        };
        let result = await successMessage({ value: data });
        return res.json(result);
    } catch (error) {
        console.log(error);
        let response = await errorMessage({ code: 403 });
        return res.json(response);
    }
};

exports.unapprovedLogOut = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        const token = req.headers["access-token"];
        if (!prefix || !token) {
            let response = await errorMessage({ code: 401 });
            return res.json(response);
        }
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        const availableToken = await PendingUsers.findOne({
            where: {
                id: decoded.id,
            },
            prefix,
        });
        await availableToken.update(
            {
                user_tokens: "",
            },
            {},
            prefix
        );
        return res.json({ status: true, data: [] });
    } catch (error) {
        return res.status(401).json({ status: false });
    }
};

exports.uploadReceipt = async (req, res) => {
    t = await mlm_laravel.transaction();
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        await uploadFile(req, res, async function (err) {
            if (err != undefined) {
                console.log(err);
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
                const { type } = req.body;
                var id = req.user.id;
                var username = req.body.user_name;

                if (!req.file) {
                    let response = await errorMessage({ code: 1032 });
                    return res.json(response);
                }
                // return res.json(id)
                let fileName = `${process.env.image_url}bank/${req.file.filename}`;
                let result = await bankReceiptUnpproved(
                    username,
                    fileName,
                    type,
                    id,
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

exports.postGenerateWalletAddress = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const user_id = req.user.id;

        let checkWalletAddressCreatedOrNot = await UserWalletbalance.findOne({
            where: {
                unapproved_user_id: user_id,
            },
            prefix,
        });

        if (checkWalletAddressCreatedOrNot) {
            let response = await errorMessage({ code: 1074 });
            return res.status(422).json(response);
        }

        const walletAddress = await axios.get(
            `${process.env.blockchainWalletIp}/api/generate_address`,
            {
                headers: {
                    "x-auth-token": `${process.env.blockChainAccessKey}`,
                },
            }
        );
        if (walletAddress.data.status) {
            const walletBalance = await UserWalletbalance.create(
                {
                    unapproved_user_id: user_id,
                    user_id: null,
                    wallet_address: walletAddress.data.address,
                    balance: 0,
                    private_key: walletAddress.data.private_key,
                },
                { prefix }
            );

            const pendingTransaction = await PendingTransaction.create(
                {
                    unapproved_user_id: user_id,
                    user_id: null,
                    wallet_address: walletAddress.data.address,
                    status: "initiated",
                    date: Date.now(),
                    transaction_id: null,
                    previous_timestamp: 0,
                    token: "usdt",
                },
                { prefix }
            );

            if (pendingTransaction && walletBalance) {
                let response = await successMessage({ value: true });
                return res.status(200).json(response);
            } else {
                let response = await errorMessage({ code: 1030 });
                return res.status(422).json(response);
            }
        } else {
            let response = await errorMessage({ code: 1030 });
            return res.status(422).json(response);
        }
    } catch (error) {
        console.log(error);
        let reponse = await errorMessage({ code: 403 });
        return res.status(422).json(reponse);
    }
};

exports.getPaymentStatus = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id } = req.user;
        const pendTransaction = await PendingTransaction.findOne({
            where: {
                status: "initiated",
                unapproved_user_id: id,
            },
            prefix,
        });
        if (pendTransaction) {
            let response = await errorMessage({ code: 1073 });
            return res.status(422).json(response);
        }
        const lastPendTransaction = await PendingTransaction.findOne({
            where: {
                unapproved_user_id: id,
            },
            order: [["id", "DESC"]],
            prefix,
        });
        const newPendingTransaction = await PendingTransaction.create(
            {
                unapproved_user_id: id,
                user_id: null,
                wallet_address: lastPendTransaction.wallet_address,
                status: "initiated",
                date: Date.now(),
                transaction_id: null,
                previous_timestamp: lastPendTransaction.previous_timestamp,
                token: "usdt",
            },
            { prefix }
        );
        if (newPendingTransaction) {
            let response = await successMessage({
                message: "Operation successfully completed please wait ..",
            });
            return res.status(200).json(response);
        }
        let response = await errorMessage({ code: 1030 });
        return res.status(422).json(response);
    } catch (error) {
        console.log(error);
        let response = await errorMessage({ code: 403 });
        return res.status(422).json(response);
    }
};

exports.EnrollNow = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id } = req.user;
        const updateEnroll = await approveRegister(id, prefix);
        console.log("======================approve status===", updateEnroll);
        if (updateEnroll) {
            const updatedId = await PendingRegistration.findOne({
                where: { id },
                prefix,
            });
            const pendingTransactionData = await PendingTransaction.findAll({
                where: { unapproved_user_id: id },
                prefix,
            });
            const walletAddressData = await UserWalletbalance.findOne({
                where: {
                    unapproved_user_id: id,
                },
                prefix,
            });
            const walletAddressDetails = await WalletHistories.findOne({
                where: {
                    unapproved_user_id: id,
                },
                prefix,
            });
            const pendingData = await PendingUsers.findOne({
                where: { id },
                prefix,
            });
            let regr = JSON.parse(pendingData.data);
            let registrationAmount = Number(regr.totalAmount);

            if (pendingTransactionData && walletAddressData) {
                for (let [key, value] of Object.entries(
                    pendingTransactionData
                )) {
                    let singleResult = await PendingTransaction.findOne({
                        where: {
                            id: value.id,
                        },
                        prefix,
                    });
                    const updatesingleResult = await singleResult.update(
                        {
                            user_id: updatedId.updated_id,
                        },
                        {},
                        prefix
                    );
                }

                let latestBalance = walletAddressData?.balance
                    ? Number(
                          Number(walletAddressData?.balance) -
                              Number(registrationAmount)
                      )
                    : 0;

                const UpdatewalletAddressData = await walletAddressData.update(
                    {
                        user_id: updatedId.updated_id,
                        balance: latestBalance,
                    },
                    {},
                    prefix
                );

                if (walletAddressDetails) {
                    const updateWalletAddressDetails =
                        await walletAddressDetails.update(
                            {
                                user_id: updatedId.updated_id,
                            },
                            {},
                            prefix
                        );
                }

                let newWalletHistoryData = {
                    status: true,
                    data: {
                        type: "registration",
                    },
                };

                let newWalletHistoryEntry = await WalletHistories.create(
                    {
                        user_id: updatedId.updated_id,
                        from_id: updatedId.updated_id,
                        amount: registrationAmount,
                        balance: latestBalance,
                        amount_type: "register",
                        type: "debit",
                        date_added: Date.now(),
                        transaction_id:
                            "registertransaction" +
                            Math.floor(Math.random() * 10000),
                        wallet_address: walletAddressData.wallet_address,
                        response: JSON.stringify(newWalletHistoryData),
                        transaction_fee: 0,
                    },
                    { prefix }
                );
                let response = await successMessage({
                    value: updatedId.updated_id,
                });
                return res.status(200).json(response);
            }
        } else {
            let response = await errorMessage({ code: 1075 });
            return res.status(422).json(response);
        }
    } catch (error) {
        console.log(error);
        let response = await errorMessage({ code: 403 });
        return res.status(422).json(response);
    }
};
