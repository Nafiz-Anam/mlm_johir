const bcrypt = require("bcryptjs");
const speakeasy = require("speakeasy");
const jwt = require("jsonwebtoken");
const db = require("../../models");
const { Op } = require("sequelize");
const { Sequelize } = require("sequelize");
const { errorMessage, successMessage } = require("../../utils/web/response");
const { mailConfig, sendMail } = require("../../utils/web/nodeMailer");
const modStatus = require("../../utils/web/moduleStatus");
const common = require("../../utils/web/common");
const { decrypt } = require("../../middleware/web/encryption");
const User = db.user;
const UserDetails = db.userDetails;
const Tokens = db.accessToken;
const demoUser = db.demoUsers;
const Currencies = db.currencies;
const SignupSettings = db.signupSettings;
const ResetPass = db.passwordReset;
const TransPassReset = db.transPassReset;
const TransPass = db.transPassword;
const Payment = db.paymentConfig;
const paymentConfigDetails = db.paymentGatewayDetails;

exports.enc = async (req, res) => {
    let encryptedPassword = await bcrypt.hash(req.body.pass, 10);
    res.send(encryptedPassword);
};

exports.getAccessToken = async (req, res) => {
    const prefix = req.headers["api-key"];
    let recaptchaStatus = false;
    let { username, password } = req.body;
    // username = username.trim();
    let currencyDetails;
    try {
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        if (process.env.DEMO_STATUS == "yes") {
            const mlmDetails = await demoUser.findOne({
                attributes: ["id", "username", "prefix"],
                where: {
                    [Op.and]: [
                        {
                            api_key: prefix,
                        },
                        {
                            account_status: {
                                [Op.ne]: "deleted",
                            },
                        },
                    ],
                },
            });
        }
        if (!username || !password) {
            let response = await errorMessage({ code: 1003 });
            return res.json(response);
        }

        const user = await User.findOne({
            attributes: ["id", "password", "username", "user_type"],
            where: {
                username: username,
                active: {
                    [Op.ne]: 0,
                },
                user_type: "user",
            },
            prefix,
        });

        if (!user) {
            let unapproveStatus = await SignupSettings.findOne({
                attributes: ["login_unapproved"],
                prefix,
            });

            if (unapproveStatus.login_unapproved) {
                let checkUser = await common.checkUnapprovedUser(
                    username,
                    password,
                    prefix
                );

                if (checkUser) {
                    const accessToken = jwt.sign(
                        {
                            username: username,
                            id: checkUser.id,
                            approveStatus: checkUser.status,
                        },
                        process.env.TOKEN_KEY,
                        {
                            expiresIn: "24h",
                        }
                    );
                    await checkUser.update(
                        {
                            user_tokens: accessToken,
                        },
                        {},
                        prefix
                    );

                    return res.json({
                        status: true,
                        data: {
                            access_token: accessToken,
                            sess_id: null,
                            unapproved: true,
                            approved: false,
                            currency: {
                                code: "USD",
                            },
                        },
                    });
                } else {
                    let response = await errorMessage({ code: 1003 });
                    return res.json(response);
                }
            }
            let response = await errorMessage({ code: 1043 });
            return res.json(response);
        }
        // password verification
        // console.log("fetched user =>", JSON.stringify(user));

        const validPassword = await bcrypt.compare(password, user.password);

        const moduleStatus = await modStatus.getModuleStatus(prefix);

        if (moduleStatus.captcha_status) {
            recaptchaStatus = true;
        }

        if (!validPassword) {
            return res.status(422).json({
                status: false,
                data: { code: 1055, captcha: recaptchaStatus },
            });
        }

        // access token generation
        const accessToken = jwt.sign(
            {
                username: user.username,
                id: user.id,
                user_type: user.user_type,
            },
            process.env.TOKEN_KEY,
            {
                expiresIn: "24h",
            }
        );
        const user_id = user["id"];
        const { default_currency } = await User.findOne({
            where: {
                id: user.id,
            },
            prefix,
        });

        if (default_currency != null) {
            currencyDetails = await Currencies.findOne({
                where: {
                    id: default_currency,
                },
                prefix,
            });
        } else {
            currencyDetails = await Currencies.findOne({
                where: {
                    default: 1,
                },
                prefix,
            });
        }

        const availableToken = await Tokens.findOne({
            where: {
                user_id,
            },
            prefix,
        });
        if (availableToken != null) {
            await availableToken.update(
                {
                    token: accessToken,
                },
                {},
                prefix
            );
        } else {
            await Tokens.create(
                {
                    user_id,
                    token: accessToken,
                    expiry: 1,
                },
                { prefix }
            );
        }

        res.json({
            status: true,
            data: {
                access_token: accessToken,
                sess_id: null,
                unapproved: false,
                approved: true,
                currency: {
                    code: currencyDetails?.code ? currencyDetails.code : "USD",
                },
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: `Error: ${error.message}`,
        });
    }
};

exports.logOutAPI = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        const token = req.headers["access-token"];
        if (!prefix || !token) {
            let response = await errorMessage({ code: 401 });
            return res.json(response);
        }
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        console.log(decoded);
        const availableToken = await Tokens.findOne({
            where: {
                user_id: decoded.id,
            },
            prefix,
        });
        await availableToken.update(
            {
                token: "",
            },
            {},
            prefix
        );

        return res.json({ status: true, data: [] });
    } catch (error) {
        return res.status(401).json({ status: false });
    }
};

exports.validateString = async (req, res) => {
    try {
        const prefix = req.headers["prefix"];
        const string = req.headers["token"];
        if (!prefix || !string) {
            let response = await errorMessage({ code: 401 });
            return res.json(response);
        }
        const ModuleStatus = await modStatus.getModuleStatus(prefix);
        if (!ModuleStatus.ecom_status) {
            return res.status(401).json({ status: false });
        }
        const stringExistOrNot = await common.checkString(string, prefix);
        console.log(
            "============stringExistOrNot===============",
            stringExistOrNot
        );
        if (stringExistOrNot === false || !stringExistOrNot.status) {
            return res.status(401).json({ status: false });
        }
        const userDetails = await User.findOne({
            where: {
                id: stringExistOrNot.user_id,
                active: {
                    [Op.ne]: 0,
                },
            },
            prefix,
        });

        if (!userDetails) {
            return res.status(401).json({ status: false });
        }
        const accessToken = jwt.sign(
            {
                username: userDetails.username,
                id: userDetails.id,
            },
            process.env.TOKEN_KEY,
            {
                expiresIn: "24h",
            }
        );
        const availableToken = await Tokens.findOne({
            where: {
                user_id: userDetails.id,
            },
            prefix,
        });

        if (availableToken != null) {
            await availableToken.update(
                {
                    token: accessToken,
                },
                {},
                prefix
            );
        } else {
            await Tokens.create(
                {
                    user_id,
                    token: accessToken,
                    expiry: 1,
                },
                { prefix }
            );
        }
        let updateString = await common.updateCheckString(string, prefix);

        if (!updateString) {
            return res.status(401).json({ status: false });
        }
        return res.json({
            status: true,
            data: {
                access_token: accessToken,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(401).json({ status: false });
    }
};

exports.getVerifyQRCode = async (req, res) => {
    try {
        const { otp, auth_key, username, email } = req.body;
        const api_key = req.headers["api-key"];
        if (!api_key) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        if (process.env.DEMO_STATUS == "yes") {
            const mlmDetails = await demoUser.findOne({
                attributes: ["id", "username", "prefix"],
                where: {
                    [Op.and]: [
                        {
                            api_key: api_key,
                        },
                        {
                            account_status: {
                                [Op.ne]: "deleted",
                            },
                        },
                    ],
                },
            });

            var prefix = `${mlmDetails.prefix}_`;
        } else {
            var prefix = process.env.PREFIX;
        }
        var verified = speakeasy.totp.verify({
            secret: auth_key,
            encoding: "base32",
            token: otp,
        });

        if (verified) {
            const user = await User.findOne({
                where: {
                    username: username,
                    active: {
                        [Op.ne]: 0,
                    },
                    user_type: "user",
                },
                prefix,
            });

            await user.update(
                {
                    goc_key: auth_key,
                },
                {},
                prefix
            );

            var accessToken = jwt.sign(
                {
                    username: user.username,
                    id: user.id,
                    user_type: user.user_type,
                },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "24h",
                }
            );
            const user_id = user["id"];
            const availableToken = await Tokens.findOne({
                where: {
                    user_id,
                },
                prefix,
            });

            if (availableToken != null) {
                await availableToken.update(
                    {
                        token: accessToken,
                    },
                    {},
                    prefix
                );
            } else {
                await Tokens.create(
                    {
                        user_id,
                        token: accessToken,
                        expiry: 1,
                    },
                    { prefix }
                );
            }

            let data = {
                status: verified,
                access_token: accessToken ? accessToken : "",
            };
            let result = await successMessage({ value: data });
            return res.json(result);
        } else {
            let response = await errorMessage({ code: 1064 });
            return res.status(401).json(response);
        }
    } catch (error) {
        console.log(error.message);
        let result = {
            status: false,
        };
        return res.status(401).json(result);
    }
};

exports.resetGoogleOtp = async (req, res) => {
    const { username, email } = req.body;
    const api_key = req.headers["api-key"];
    if (!api_key) {
        let response = await errorMessage({ code: 1001 });
        return res.json(response);
    }
    if (process.env.DEMO_STATUS == "yes") {
        const mlmDetails = await demoUser.findOne({
            attributes: ["id", "username", "prefix"],
            where: {
                [Op.and]: [
                    {
                        api_key: api_key,
                    },
                    {
                        account_status: {
                            [Op.ne]: "deleted",
                        },
                    },
                ],
            },
        });
        var prefix = `${mlmDetails.prefix}_`;
    } else {
        var prefix = process.env.PREFIX;
    }
    const user = await User.findOne({
        where: {
            username: username,
        },
        prefix,
    });
    await user.update(
        {
            goc_key: "",
        },
        {},
        prefix
    );
    let result = {
        status: true,
    };
    return res.json(result);
};

exports.forgetPassword = async (req, res) => {
    try {
        const api_key = req.headers["api-key"];
        if (!api_key) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        if (process.env.DEMO_STATUS == "yes") {
            const mlmDetails = await demoUser.findOne({
                attributes: ["id", "username", "prefix"],
                where: {
                    [Op.and]: [
                        {
                            api_key: api_key,
                        },
                        {
                            account_status: {
                                [Op.ne]: "deleted",
                            },
                        },
                    ],
                },
            });
            var prefix = `${mlmDetails.prefix}_`;
        } else {
            var prefix = process.env.PREFIX;
        }
        const { username, email } = req.body;
        const userId = await common.usernameToId(username, prefix);
        console.log("userId => ", userId);

        if (userId) {
            const emailId = await common.getEmailId(userId, prefix);
            console.log(
                "=========================email ====",
                emailId,
                "---------------sende",
                email
            );
            if (emailId.trim().toLowerCase() != email.trim().toLowerCase()) {
                console.log("=================invalid mail=================");
                let response = await errorMessage({ code: 1022 });
                return res.status(422).json(response);
            }
        } else {
            let response = await errorMessage({ code: 1011 });
            return res.status(422).json(response);
        }
        let userMail = await mailConfig(prefix);
        let result = await sendMail(
            userMail,
            "forget_password",
            username,
            email,
            null,
            prefix
        );
        if (result) {
            let response = await successMessage({
                message: "forgot password mail send successfully",
            });
            return res.json(response);
        } else {
            let response = await errorMessage({ code: 1048 });
            return res.status(500).json(response);
        }
    } catch (error) {
        console.log(error.message);
    }
};

exports.validUser = async (req, res) => {
    try {
        const api_key = req.headers["api-key"];
        if (!api_key) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        if (process.env.DEMO_STATUS == "yes") {
            const mlmDetails = await demoUser.findOne({
                attributes: ["id", "username", "prefix"],
                where: {
                    [Op.and]: [
                        {
                            api_key: api_key,
                        },
                        {
                            account_status: {
                                [Op.ne]: "deleted",
                            },
                        },
                    ],
                },
            });
            var prefix = `${mlmDetails.prefix}_`;
        } else {
            var prefix = process.env.PREFIX;
        }
        const { user_name } = req.body;
        if (!user_name) {
            let response = await errorMessage({ code: 1070 });
            return res.status(401).json(response);
        }
        let user = await User.findOne({
            where: {
                username: user_name,
            },
            prefix,
        });
        if (user) {
            let response = await successMessage({ message: "UsernameExist" });
            return res.json(response);
        } else {
            let response = await errorMessage({ code: 1070 });
            return res.status(401).json(response);
        }
    } catch (error) {
        console.log(error.message);
    }
};

exports.validEmail = async (req, res) => {
    try {
        const api_key = req.headers["api-key"];
        if (!api_key) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        if (process.env.DEMO_STATUS == "yes") {
            const mlmDetails = await demoUser.findOne({
                attributes: ["id", "username", "prefix"],
                where: {
                    [Op.and]: [
                        {
                            api_key: api_key,
                        },
                        {
                            account_status: {
                                [Op.ne]: "deleted",
                            },
                        },
                    ],
                },
            });

            var prefix = `${mlmDetails.prefix}_`;
        } else {
            var prefix = process.env.PREFIX;
        }
        const { user_name, e_mail } = req.body;
        if (!e_mail) {
            let response = await errorMessage({ code: 1048 });
            return res.status(401).json(response);
        }
        let user_id = await common.usernameToId(user_name, prefix);
        let userEmail = await UserDetails.findOne({
            attributes: ["email"],
            where: {
                user_id: user_id,
            },
            prefix,
        });

        if (
            e_mail.trim().toLowerCase() == userEmail?.email.trim().toLowerCase()
        ) {
            let response = await successMessage({ code: 200 });
            return res.json(response);
        } else {
            let response = await errorMessage({ code: 1048 });
            return res.status(401).json(response);
        }
    } catch (error) {
        console.log(error);
    }
};

exports.validForgetKey = async (req, res) => {
    try {
        const api_key = req.headers["api-key"];
        if (!api_key) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        if (process.env.DEMO_STATUS == "yes") {
            const mlmDetails = await demoUser.findOne({
                attributes: ["id", "username", "prefix"],
                where: {
                    [Op.and]: [
                        {
                            api_key: api_key,
                        },
                        {
                            account_status: {
                                [Op.ne]: "deleted",
                            },
                        },
                    ],
                },
            });

            var prefix = `${mlmDetails.prefix}_`;
        } else {
            var prefix = process.env.PREFIX;
        }
        const { resetkey } = req.query;
        console.log(resetkey);

        if (resetkey) {
            const Token = await ResetPass.findOne({
                where: {
                    token: resetkey,
                    status: 1,
                },
                prefix,
            });
            if (!Token) {
                let response = await errorMessage({ code: 1076 });
                return res.status(422).json(response);
            }
            await Token.update(
                {
                    status: 0,
                },
                {},
                prefix
            );

            let data = {
                user_id: Token.user_id,
            };
            let response = await successMessage({ value: data });
            return res.json(response);
        } else {
            let response = await errorMessage({ code: 1076 });
            return res.status(422).json(response);
        }
    } catch (error) {
        console.log(error.message);
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const api_key = req.headers["api-key"];
        if (!api_key) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        if (process.env.DEMO_STATUS == "yes") {
            const mlmDetails = await demoUser.findOne({
                attributes: ["id", "username", "prefix"],
                where: {
                    [Op.and]: [
                        {
                            api_key: api_key,
                        },
                        {
                            account_status: {
                                [Op.ne]: "deleted",
                            },
                        },
                    ],
                },
            });

            var prefix = `${mlmDetails.prefix}_`;
        } else {
            var prefix = process.env.PREFIX;
        }
        const { pass, confirm_pass, user_id } = req.body;
        if (pass != confirm_pass) {
            let response = await errorMessage({ code: 1003 });
            return res.status(422).json(response);
        }
        let encryptedPassword = await bcrypt.hash(pass, 10);
        if (user_id) {
            let user = await User.findOne({
                where: {
                    id: user_id,
                },
                prefix,
            });
            await user.update(
                {
                    password: encryptedPassword,
                },
                {},
                prefix
            );

            let response = await successMessage({
                message: "Password reset successfully",
            });
            return res.json(response);
        } else {
            let response = await errorMessage({ code: 1051 });
            return res.status(422).json(response);
        }
    } catch (error) {
        console.log(error.message);
        let response = await errorMessage({ code: 1030 });
        return res.status(422).json(response);
    }
};

exports.validTransForgetKey = async (req, res) => {
    try {
        const api_key = req.headers["api-key"];
        if (!api_key) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        if (process.env.DEMO_STATUS == "yes") {
            const mlmDetails = await demoUser.findOne({
                attributes: ["id", "username", "prefix"],
                where: {
                    [Op.and]: [
                        {
                            api_key: api_key,
                        },
                        {
                            account_status: {
                                [Op.ne]: "deleted",
                            },
                        },
                    ],
                },
            });

            var prefix = `${mlmDetails.prefix}_`;
        } else {
            var prefix = process.env.PREFIX;
        }
        const { resetkey } = req.query;
        if (resetkey) {
            const Token = await TransPassReset.findOne({
                where: {
                    token: resetkey,
                    status: 1,
                },
                prefix,
            });

            if (!Token) {
                let response = await errorMessage({ code: 1076 });
                return res.status(422).json(response);
            }
            await Token.update(
                {
                    status: 0,
                },
                {},
                prefix
            );

            let data = {
                user_id: Token.user_id,
            };
            let response = await successMessage({ value: data });
            return res.json(response);
        } else {
            let response = await errorMessage({ code: 1076 });
            return res.status(422).json(response);
        }
    } catch (error) {
        console.log(error.message);
    }
};

exports.resetTransPassword = async (req, res) => {
    try {
        const api_key = req.headers["api-key"];
        if (!api_key) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        if (process.env.DEMO_STATUS == "yes") {
            const mlmDetails = await demoUser.findOne({
                attributes: ["id", "username", "prefix"],
                where: {
                    [Op.and]: [
                        {
                            api_key: api_key,
                        },
                        {
                            account_status: {
                                [Op.ne]: "deleted",
                            },
                        },
                    ],
                },
            });

            var prefix = `${mlmDetails.prefix}_`;
        } else {
            var prefix = process.env.PREFIX;
        }
        const { pass, confirm_pass, user_id } = req.body;
        if (pass != confirm_pass) {
            let response = await errorMessage({ code: 1003 });
            return res.status(422).json(response);
        }
        let encryptedPassword = await bcrypt.hash(pass, 10);
        if (user_id) {
            let userTransPass = await TransPass.findOne({
                where: {
                    id: user_id,
                },
                prefix,
            });
            await userTransPass.update(
                {
                    password: encryptedPassword,
                },
                {},
                prefix
            );

            let response = await successMessage({
                message: "Transaction Password reset successfully",
            });
            return res.json(response);
        } else {
            let response = await errorMessage({ code: 1051 });
            return res.status(422).json(response);
        }
    } catch (error) {
        console.log(error.message);
        let response = await errorMessage({ code: 1030 });
        return res.status(422).json(response);
    }
};

exports.validateTreeString = async (req, res) => {
    try {
        const string = req.headers["token"];
        const api_key = req.headers["api-key"];
        if (!api_key) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        if (process.env.DEMO_STATUS == "yes") {
            const mlmDetails = await demoUser.findOne({
                attributes: ["id", "username", "prefix"],
                where: {
                    [Op.and]: [
                        {
                            api_key: api_key,
                        },
                        {
                            account_status: {
                                [Op.ne]: "deleted",
                            },
                        },
                    ],
                },
            });

            var prefix = `${mlmDetails.prefix}_`;
        } else {
            var prefix = process.env.PREFIX;
        }
        // const ModuleStatus = await modStatus.getModuleStatus(prefix);
        // if (!ModuleStatus.ecom_status || !ModuleStatus.ecom_status_demo) {
        //   return res.status(401).json({ status: false });
        // }
        const stringExistOrNot = await common.checkTreeString(string, prefix);
        if (stringExistOrNot === false || !stringExistOrNot.status) {
            // return res.status(401).json({ status: false });
            return res.status(401).json({ status: false });
        }
        const userDetails = await User.findOne({
            where: {
                id: stringExistOrNot.user_id,
                active: {
                    [Op.ne]: 0,
                },
            },
            prefix,
        });

        if (!userDetails) {
            return res.status(401).json({ status: false });
        }
        const accessToken = jwt.sign(
            {
                username: userDetails.username,
                id: userDetails.id,
            },
            process.env.TOKEN_KEY,
            {
                expiresIn: "24h",
            }
        );
        const availableToken = await Tokens.findOne({
            where: {
                user_id: userDetails.id,
            },
            prefix,
        });
        if (availableToken != null) {
            await availableToken.update(
                {
                    token: accessToken,
                },
                {},
                prefix
            );
        } else {
            await Tokens.create(
                {
                    user_id: stringExistOrNot.user_id,
                    token: accessToken,
                    expiry: 1,
                },
                { prefix }
            );
        }
        let updateString = await common.updateCheckTreeString(string, prefix);
        if (!updateString) {
            return res.status(401).json({ status: false });
        }
        return res.json({
            status: true,
            data: {
                access_token: accessToken,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(401).json({ status: false });
    }
};

exports.emailVerification = async (req, res) => {
    try {
        let encryptUsername = req.query.username;
        let encryptAdminUsername = req.query.adminUsername;
        let decodeUsername = decrypt(encryptUsername);
        let decodeAdminUsername = decrypt(encryptAdminUsername);
        const api_key = req.headers["api-key"];
        if (!api_key) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        if (process.env.DEMO_STATUS == "yes") {
            const mlmDetails = await demoUser.findOne({
                attributes: ["id", "username", "prefix"],
                where: {
                    [Op.and]: [
                        {
                            username: decodeAdminUsername,
                        },
                        {
                            account_status: {
                                [Op.ne]: "deleted",
                            },
                        },
                    ],
                },
            });
            var prefix = `${mlmDetails.prefix}_`;
        } else {
            var prefix = process.env.PREFIX;
        }
        let userCheck = await User.findOne({
            where: {
                username: decodeUsername,
            },
            prefix,
        });
        if (!userCheck) {
            let response = await errorMessage({ code: 1043 });
            return res.json(response);
        }
        await userCheck.update(
            {
                email_verified: 1,
            },
            {},
            prefix
        );

        let response = await successMessage({
            message: "Email Verification Completed Successfully",
        });
        return res.json(response);
    } catch (error) {
        console.log(error);
        let response = await errorMessage({ code: 1078 });
        return res.status(500).json(response);
    }
};

exports.getPaymentGatewayKey = async (req, res) => {
    try {
        const api_key = req.headers["api-key"];
        if (!api_key) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        if (process.env.DEMO_STATUS == "yes") {
            const mlmDetails = await demoUser.findOne({
                attributes: ["id", "username", "prefix"],
                where: {
                    [Op.and]: [
                        {
                            api_key: api_key,
                        },
                        {
                            account_status: {
                                [Op.ne]: "deleted",
                            },
                        },
                    ],
                },
            });

            var prefix = `${mlmDetails.prefix}_`;
        } else {
            var prefix = process.env.PREFIX;
        }
        const { payment_method } = req.body;

        let gateway = await Payment.findOne({
            attributes: ["id"],
            where: {
                name: payment_method,
                status: 1,
            },
            prefix,
        });
        if (gateway) {
            let Key = await paymentConfigDetails.findOne({
                attributes: ["public_key"],
                where: {
                    payment_gateway_id: gateway.id,
                },
                prefix,
            });

            let data = {
                public_key: Key.public_key,
            };
            let response = await successMessage({ value: data });
            return res.json(response);
        } else {
            let response = await errorMessage({ code: 1036 });
            return res.status(401).json(response);
        }
    } catch (err) {
        console.log(err);
    }
};
