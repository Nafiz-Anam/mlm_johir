const db = require("../../models");
const { Op, Sequelize, QueryTypes } = require("sequelize");
const { mlm_laravel } = require("../../models");
const bcrypt = require("bcryptjs");
var _ = require("lodash");
const modStatus = require("../../utils/web/moduleStatus");
const moment = require("moment");
const dc = require("../../utils/web/constants");
const common = require("../../utils/web/common");
const { successMessage, errorMessage } = require("../../utils/web/response");
const Str = require("@supercharge/strings");
const ewalletHistory = db.ewalletHistory;
const User = db.user;
const usrBalance = db.userBalance;
const Config = db.configuration;
const TransPass = db.transPassword;
const PayoutConfig = db.payoutConfig;
// const pendingReg = db.pendingRegistration
const paymentConfig = db.paymentConfig;
const purchaseWalletHsty = db.purchaseWalletHistory;
const compensation = db.compensation;
const performance = db.performanceBonus;
const legAmount = db.legAmt;
const UserDetails = db.userDetails;
const fundTransfer = db.fundTransferDetails;
const Transactions = db.transactions;

exports.getEwalletStatementTable = async (req, res) => {
    const prefix = req.headers["api-key"];
    if (!prefix) {
        let response = await errorMessage({ code: 1001 });
        return res.json(response);
    }
    const { id } = req.user;
    const loggedUsername = req.user.username;
    var table_data = [];
    const { start, length } = req.query;
    try {
        const statement = await purchaseWalletHsty.findAll({
            attributes: [
                "user_id",
                "from_user_id",
                "purchase_wallet",
                "amount",
                "amount_type",
                "type",
                "date_added",
                "transaction_id",
                "transaction_note",
                "transaction_fee",
                "purchase_wallet",
                "createdAt",
            ],
            where: {
                [Op.or]: {
                    user_id: id,
                    [Op.and]: {
                        from_user_id: id,
                        purchase_wallet: "fund_transfer",
                    },
                },
            },
            offset: parseInt(start) ? parseInt(start) : 0,
            limit: parseInt(length) ? parseInt(length) : 10,
            include: [
                {
                    model: User,
                    attributes: ["username"],
                    as: "userWallet",
                },
                {
                    model: User,
                    attributes: ["username"],
                    as: "fundUser",
                },
            ],
            order: [["id", "ASC"]],
            prefix,
        });
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        var count = await purchaseWalletHsty.count({
            where: {
                [Op.or]: {
                    user_id: id,
                    [Op.and]: {
                        from_user_id: id,
                        purchase_wallet: "fund_transfer",
                    },
                },
            },
            prefix,
        });
        var userBalance = await mlm_laravel.query(
            `SELECT SUM(IF((f.type = 'credit' OR (f.type = 'debit' AND f.user_id = :userId) ), f.amount, 0)) as credit, SUM(IF((f.type = 'credit' OR (f.type = 'debit' AND f.user_id = :userId)), f.purchase_wallet, 0)) as pwallet, SUM(IF(((f.purchase_wallet != 'fund_transfer' AND f.type = 'debit') OR (f.purchase_wallet = 'fund_transfer' AND f.from_user_id = :userId)), f.amount, 0)) as debit, SUM(IF(f.type = 'debit', f.transaction_fee, 0)) as transaction_fee FROM (SELECT * FROM ${prefix}purchase_wallet_histories as e WHERE e.user_id = :userId OR (e.from_user_id = :userId AND e.purchase_wallet = 'fund_transfer') LIMIT :limit) as f WHERE f.amount_type != 'payout_release'`,
            {
                replacements: {
                    userId: id,
                    limit: parseInt(start) ? parseInt(start) : 0,
                },
                type: QueryTypes.SELECT,
                raw: true,
                prefix,
            }
        );
        if (userBalance[0]) {
            var balance =
                userBalance[0].credit -
                userBalance[0].debit -
                userBalance[0].transaction_fee -
                userBalance[0].pwallet;
        } else {
            var balance = 0;
        }
        if (!statement) {
            return res.status(400).send({
                message: "statement not found",
            });
        }
        let payoutFee = await PayoutConfig.findOne({
            attributes: ["fee_amount"],
            prefix,
        });
        let userCurrency = await common.getUserCurrencySymbol(id, prefix);
        Object.entries(statement).map(([key, value]) => {
            var description;
            var description1;
            if (value.pendingRegistration == null) {
                var fromUser = value?.userWallet?.username
                    ? value?.userWallet?.username
                    : "";
            }
            if (
                value.type === "debit" &&
                value.purchase_wallet != "fund_transfer"
            ) {
                balance =
                    Number(balance) -
                    Number(value.amount) -
                    Number(value.transaction_fee);
            }
            if (
                value.type === "credit" &&
                value.amount_type != "user_credit" &&
                value.purchase_wallet != "fund_transfer"
            ) {
                balance =
                    Number(balance) +
                    Number(value.amount) -
                    Number(value.purchase_wallet);
                console.log(
                    "-------",
                    balance,
                    value.amount,
                    value.purchase_wallet
                );
                // balance = balance + value.amount
            }
            if (
                value.purchase_wallet == "fund_transfer" &&
                loggedUsername == value?.fundUser?.username
            ) {
                balance =
                    Number(balance) +
                    Number(value.amount) -
                    Number(value.purchase_wallet);
            } else if (
                value.purchase_wallet == "fund_transfer" &&
                loggedUsername == value.userWallet.username
            ) {
                balance =
                    Number(balance) -
                    Number(value.amount) -
                    Number(value.transaction_fee);
            }
            var arrayCommission = [
                "referral",
                "level_commission",
                "repurchase_level_commission",
                "upgrade_level_commission",
                "xup_commission",
                "xup_repurchase_level_commission",
                "xup_upgrade_level_commission",
                "sales_commission",
            ];

            if (value.purchase_wallet == "fund_transfer") {
                if (loggedUsername == value.fundUser.username) {
                    description1 = {
                        langCode: "fund_transfer_from",
                        user: value.userWallet.username,
                    };
                    value.type = "credit";
                    // description = `Transfer from ${fromUser}`;
                } else if (loggedUsername == value.userWallet.username) {
                    // description = `Fund transfer to ${fromUser}`;
                    description1 = {
                        langCode: "fund_transfer_to",
                        user: value.fundUser.username,
                        fee: value.transaction_fee,
                        fee_type: "fundtransfer",
                        currency: userCurrency,
                    };
                    value.type = "debit";
                } else if (value.amount_type == "admin_credit") {
                    description1 = {
                        langCode: "credited_by",
                        user: fromUser,
                    };
                    // description = `Credited by ${fromUser}`;
                } else if (value.amount_type == "admin_debit") {
                    // description = `Deducted by ${fromUser}`;
                    description1 = {
                        langCode: "deducted_by",
                        user: fromUser,
                    };
                }
            } else if (value.purchase_wallet == "commission") {
                if (value.amount_type == "donation") {
                    if (value.type == "debit") {
                        description1 = {
                            langCode: "donation_debit",
                            user: fromUser,
                        };
                        // description = `Donation debit ${fromUser}`;
                    } else {
                        description1 = {
                            langCode: "donation_credit",
                            user: fromUser,
                        };
                        // description = `Donation credit ${fromUser}`;
                    }
                } else if (
                    value.amount_type == "board_commission" &&
                    moduleStatus.table_status == "yes"
                ) {
                    description1 = {
                        langCode: "table_commision",
                        user: "",
                    };
                    // description = `Table commission`;
                } else {
                    if (_.includes(arrayCommission, value.amount_type)) {
                        let slugdescription = value.amount_type.replace(
                            /-/g,
                            "_"
                        );
                        description1 = {
                            langCode: slugdescription + "_from",
                            user: fromUser,
                        };
                        // description = `${slugdescription} from ${fromUser}`;
                    } else {
                        let slugdescription = value.amount_type.replace(
                            /-/g,
                            "_"
                        );
                        description1 = {
                            langCode: slugdescription,
                            user: "",
                        };
                        // description = `${slugdescription}`;
                    }
                }
            } else if (value.purchase_wallet == "ewallet_payment") {
                if (value.amount_type == "registration") {
                    description1 = {
                        langCode: "deducted_for_registration_of",
                        user: fromUser,
                    };
                    // description = `Deducted for registration of ${fromUser}`;
                } else if (value.amount_type == "repurchase") {
                    description1 = {
                        langCode: "deducted_for_repurchase_by",
                        user: fromUser,
                    };
                    description = `Deducted for repurchase by ${fromUser}`;
                } else if (value.amount_type == "package_validity") {
                    description1 = {
                        langCode: "deducted_for_membership_renewal_of",
                        user: fromUser,
                    };
                    // description = `Deducted for membership renewal of ${fromUser}`;
                } else if (value.amount_type == "upgrade") {
                    // description = `Deducted for upgrade of ${fromUser}`;
                    description1 = {
                        langCode: "deducted_for_upgrade_of",
                        user: fromUser,
                    };
                }
            } else if (value.purchase_wallet == "payout") {
                if (value.amount_type == "payout_request") {
                    // description = `Deducted for payout request`;
                    description1 = {
                        langCode: "deducted_for_payout_request",
                        user: "",
                    };
                } else if (value.amount_type == "payout_inactive") {
                    description1 = {
                        langCode: "payout_inactive",
                        user: "",
                    };
                    // description = `Payout inactive`;
                } else if (value.amount_type == "payout_release") {
                    description1 = {
                        langCode: "payout_release_for_request",
                        user: "",
                        currency: userCurrency,
                        fee: payoutFee.fee_amount,
                        fee_type: "payout",
                    };
                    // description = `Payout released for request`;
                } else if (value.amount_type == "payout_delete") {
                    description1 = {
                        langCode: "credited_for_payout_request_delete",
                        user: "",
                    };
                    // description = `Credited for payout request delete`;
                } else if (value.amount_type == "payout_release_manual") {
                    description1 = {
                        langCode: "payout_released_by_manual",
                        user: "",
                    };
                    // description = `Payout released by manual`;
                } else if (value.amount_type == "withdrawal_cancel") {
                    description1 = {
                        langCode: "credited_for_waiting_withdrawal_cancel",
                        user: "",
                    };
                    // description = `Credited for waiting withdrawal cancel`;
                }
            } else if (value.purchase_wallet == "pin_purchase") {
                if (value.amount_type == "pin_purchase") {
                    description1 = {
                        langCode: "deducted_for_pin_purchase",
                        user: "",
                    };
                    description = `Deducted for pin purchase`;
                } else if (value.amount_type == "pin_purchase_refund") {
                    description1 = {
                        langCode: "credited_for_pin_purchase_refund",
                        user: "",
                    };
                    // description = `Credited for pin purchase refund`;
                } else if (value.amount_type == "pin_purchase_delete") {
                    description1 = {
                        langCode: "credited_for_pin_purchase_delete",
                        user: "",
                    };
                    // description = `Credited for pin purchase delete`;
                }
            } else if (value.purchase_wallet == "package_purchase") {
                if (value.amount_type == "purchase_donation") {
                    description1 = {
                        langCode: "purchase_donation_from",
                        user: fromUser,
                    };
                    // description = `Purchase donation from ${fromUser}`;
                }
            }
            table_data[key] = {
                index: parseInt(key) + 1,
                description1: description1,
                description: description,
                amount:
                    value.type == "credit"
                        ? value.amount
                        : value.amount + value.transaction_fee,
                type: value.type,
                transaction_date: new Date(
                    value.createdAt
                ).toLocaleDateString(),
                balance: balance,
            };
        });
        let data = {
            count: count,
            table_data: table_data,
        };
        let response = await successMessage({ value: data });
        return res.json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                status: false,
            },
            {
                message: `Error:${error.message}`,
            },
        ]);
    }
};

exports.getEwalletHistoryTable = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const userId = req.user.id;
        let [tableData, whereStatement] = [[], []];
        let { start, length, order, direction, start_date, end_date, type } =
            req.query;

        let filters = {
            order: order ? order : "updated_at",
            limit: length ? parseInt(length) : 10,
            start: start ? parseInt(start) : 0,
            direction: _.includes(["ASC", "DESC"]) ? direction : "ASC",
        };
        type = type ? type : "";
        const loggedUsername = req.user.username;
        if (userId) {
            if (type == "user_credit") {
                let condition1 = {
                    [Op.or]: {
                        to_id: userId,
                    },
                };
                whereStatement.push(condition1);
            } else if (type == "user_debit") {
                let condition1 = {
                    [Op.or]: {
                        from_user_id: userId,
                    },
                };
                whereStatement.push(condition1);
            } else {
                let condition1 = {
                    [Op.or]: {
                        to_id: userId,
                        from_user_id: userId,
                    },
                };
                whereStatement.push(condition1);
            }
        }
        if (start_date) {
            let condition2 = {
                created_at: {
                    [Op.gte]: start_date,
                },
            };
            whereStatement.push(condition2);
        }
        if (end_date) {
            let condition3 = {
                created_at: {
                    [Op.lte]: new Date(end_date).setDate(
                        new Date(end_date).getDate() + 1
                    ),
                },
            };
            whereStatement.push(condition3);
        }
        const fundTransferDetails = await fundTransfer.findAll({
            attributes: [
                "id",
                "from_user_id",
                "to_id",
                "amount",
                "amount_type",
                "trans_fee",
                "transaction_id",
                "notes",
                "created_at",
            ],
            include: [
                {
                    model: User,
                    as: "fromUser",
                    attributes: ["username"],
                },
                {
                    model: User,
                    as: "toUser",
                    attributes: ["username"],
                },
            ],
            where: whereStatement,
            order: [[filters.order, filters.direction]],
            offset: filters.start,
            limit: filters.limit,
            prefix,
        });
        const totalFundTransferDetails = await fundTransfer.findAll({
            attributes: [
                "id",
                "from_user_id",
                "to_id",
                "amount",
                "amount_type",
                "trans_fee",
                "transaction_id",
                "notes",
                "created_at",
            ],
            include: [
                {
                    model: User,
                    as: "fromUser",
                    attributes: ["username"],
                },
                {
                    model: User,
                    as: "toUser",
                    attributes: ["username"],
                },
            ],
            where: whereStatement,
            order: [[filters.order, filters.direction]],
            prefix,
        });

        const count = totalFundTransferDetails.length;
        Object.entries(fundTransferDetails).map(([key, value]) => {
            var description;
            var langDesc;
            if (loggedUsername == value.fromUser.username) {
                console.log("inside if condition");
                langDesc = {
                    langCode: "fund_transfer_to",
                    user: value.toUser.username,
                };
                description = `Fund transfer to ${value.toUser.username}`;
                value.amount_type = "user_debit";
            } else if (loggedUsername == value.toUser.username) {
                console.log("inside else condition");
                langDesc = {
                    langCode: "fund_transfer_from",
                    user: value.fromUser.username,
                };
                description = `Transfer from ${value.fromUser.username}`;
                value.amount_type = "user_credit";
            }
            tableData[key] = {
                description: description,
                description1: langDesc,
                transaction_id: value.transaction_id,
                amount: value.amount,
                transaction_fee: value.trans_fee,
                transfer_type:
                    value.amount_type == "user_debit" ? "debit" : "credit",
                type: value.amount_type == "user_debit" ? "debit" : "credit",
                date: moment(value.created_at).format("MM/DD/YYYY"),
            };
        });
        let data = {
            count: count,
            table_data: tableData,
        };
        let response = await successMessage({
            value: data,
        });
        res.json(response);
    } catch (err) {
        console.log(err);
        res.json(err.message);
    }
};

exports.getPurchaseWalletTable = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const user_id = req.user.id;
        let description;
        let table_data = [];
        var { length, start, order, direction } = req.query;
        let filters = {
            order: order,
            limit: parseInt(length) ? parseInt(length) : 10,
            start: parseInt(start) ? parseInt(start) : 0,
            direction: direction,
        };
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        const ewalletDetails = await purchaseWalletHsty.findAll({
            include: [
                {
                    model: User,
                    attributes: ["username"],
                },
            ],
            where: {
                user_id,
            },
            offset: filters.start,
            limit: filters.limit,
            prefix,
        });
        if (parseInt(start)) {
            var previousBalance = await mlm_laravel.query(
                `SELECT SUM(IF(f.type = 'credit', f.purchase_wallet, 0)) as credit, SUM(IF(f.type = 'debit' AND f.amount_type != 'payout_release', f.purchase_wallet, 0)) as debit FROM (SELECT * FROM ${prefix}purchase_wallet_histories as e WHERE e.user_id = :userId ORDER BY e.id LIMIT :limit) as f`,
                {
                    replacements: {
                        userId: user_id,
                        limit: parseInt(start),
                    },
                    type: QueryTypes.SELECT,
                    raw: true,
                    prefix,
                }
            );
            var balance = previousBalance[0].credit - previousBalance[0].debit;
        } else {
            var balance = 0;
        }
        let count = await purchaseWalletHsty.count({
            include: [
                {
                    model: User,
                    attributes: [["username", "from_user"]],
                },
            ],
            where: {
                user_id,
            },
            prefix,
        });
        var arrayCommission = [
            "referal",
            "level_commission",
            "repurchase_level_commission",
            "upgrade_level_commission",
            "xup_commission",
            "xup_repurchase_level_commission",
            "xup_upgrade_level_commission",
            "matching_bonus",
            "matching_bonus_purchase",
            "matching_bonus_upgrade",
            "sales_commission",
        ];
        var lanDesc;
        Object.entries(ewalletDetails).map(([key, value]) => {
            if (value.type == "debit") {
                balance = balance - parseFloat(value.purchase_wallet);
            } else if (value.type == "credit") {
                balance = balance + parseFloat(value.purchase_wallet);
            }
            if (value.amount_type == "donation") {
                if (value.type == "debit") {
                    description = `Donation debit ${value.user.username}`;
                    lanDesc = {
                        langCode: "donation_debit",
                        user: value.user.username,
                    };
                } else {
                    description = `Donation credit ${value.user.username}`;
                    lanDesc = {
                        langCode: "donation_credit",
                        user: value.user.username,
                    };
                }
            } else if (
                value.amount_type == "board_commission" &&
                moduleStatus.table_status
            ) {
                description = `Table commission`;
                lanDesc = {
                    langCode: "table_commission",
                    user: "",
                };
            } else if (value.amount_type == "repurchase") {
                description = `Deducted for repurchase by ${value.user.username}`;
                lanDesc = {
                    langCode: "deducted _for_repurchase_by",
                    user: value.user.username,
                };
            } else if (value.amount_type == "purchase_donation") {
                lanDesc = {
                    langCode: "purchase_donation_from",
                    user: value.user.username,
                };
                description = `Purchase donation from ${value.user.username}`;
            } else if (_.includes(arrayCommission, value.amount_type)) {
                description = `${value.amount_type}_from ${value.user.username}`;
                lanDesc = {
                    langCode: `${value.amount_type}_from`,
                    user: value.user.username,
                };
            } else {
                let slugdescription = value.amount_type.replace(/-/g, "_");
                lanDesc = {
                    langCode: `${slugdescription}`,
                    user: "",
                };
                description = `${slugdescription}`;
            }

            table_data[key] = {
                description: description,
                description1: lanDesc,
                amount: value.purchase_wallet,
                type: value.type,
                debit: `${dc.defaultCurrencySymbol}${value.purchase_wallet}`,
                credit: `${dc.defaultCurrencySymbol}${value.purchase_wallet}`,
                date: moment(value.created_at).format("MM/DD/YYYY"),
                balance: balance,
            };
        });
        let data = {
            count: count,
            table_data: table_data,
        };
        let response = await successMessage({
            value: data,
        });
        res.json(response);
    } catch (err) {
        console.log(err);
        return res.status(500).json(err.message);
    }
};

exports.getEarningExportData = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const user_id = req.user.id;
        let data = [];
        var {
            categories,
            start_date,
            end_date,
            length,
            start,
            order,
            direction,
        } = req.query;
        let filters = {
            order: order,
            limit: parseInt(length) ? parseInt(length) : null,
            start: parseInt(start) ? parseInt(start) : 0,
            direction: direction,
        };
        const userEarns = await userEarnings(
            user_id,
            categories,
            start_date,
            end_date,
            filters,
            prefix
        );
        Object.entries(userEarns).map(([key, value]) => {
            data[key] = {
                category: value.category ? value.category : "Total",
                total_amount: value.total_amount ? value.total_amount : 0,
                tax: value.tds ? value.tds : 0,
                service_charge: value.service_charge ? value.service_charge : 0,
                amount_payable: value.amount_payable ? value.amount_payable : 0,
                transaction_date: value.transaction_date
                    ? moment(value.transaction_date).format("MM/DD/YYYY")
                    : "",
            };
        });
        let response = await successMessage({ value: data });
        return res.json(response);
    } catch (err) {
        console.log(err);
        return res.json(err.message);
    }
};

exports.getUserEarningsTable = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const user_id = req.user.id;
        let [trans, enableBonus] = [[], []];
        var { start_date, end_date, length, start, order, direction } =
            req.query;
        let filters = {
            order: order ? order.split(",") : "",
            limit: parseInt(length) ? parseInt(length) : 10,
            start: parseInt(start),
            direction: direction,
        };
        let allTransaction = await userEarnings(
            user_id,
            filters.order,
            start_date,
            end_date,
            filters,
            prefix
        );
        let totalTransactions = await userEarnings(
            user_id,
            filters.order,
            start_date,
            end_date,
            "",
            prefix
        );
        let count = totalTransactions.length;
        let bonus = await getEnabledBonusCategories(prefix);
        Object.entries(bonus).map(([key, value]) => {
            enableBonus[key] = {
                key: value.replace(/[- ]/g, "_"),
                value: value,
            };
        });
        Object.entries(allTransaction).map(([key, value]) => {
            trans[key] = {
                category: value.category
                    ? value.category.replaceAll("-", "_")
                    : "Total",
                total_amount: value.total_amount ? value.total_amount : 0,
                tax: value.tds ? value.tds : 0,
                service_charge: value.service_charge ? value.service_charge : 0,
                amount_payable: value.amount_payable ? value.amount_payable : 0,
                transaction_date: value.transaction_date
                    ? moment(value.transaction_date).format("MM/DD/YYYY")
                    : "",
            };
        });
        let data = {
            count: count,
            category: enableBonus,
            table_data: trans,
        };
        let response = await successMessage({
            value: data,
        });
        res.json(response);
    } catch (err) {
        console.log(err);
        return res.status(500).json(err.message);
    }
};

exports.ewalletTile = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        let userId = req.user.id;
        let ewalletTile = [];
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        const balance = await usrBalance.findOne({
            attributes: ["balance_amount", "purchase_wallet"],
            where: {
                user_id: userId,
            },
            prefix,
        });
        const totalCommission = await legAmount.findOne({
            attributes: [
                [Sequelize.fn("SUM", Sequelize.col("amount_payable")), "sum"],
            ],
            where: {
                user_id: userId,
            },
            raw: true,
            prefix,
        });
        const total = await getEwalletOverviewTotal(
            moduleStatus,
            userId,
            prefix
        );
        // return res.json(total)
        const transFee = await getTransactionFee(prefix);
        const repurchaseStatus = moduleStatus.repurchase_status;
        const purchaseWallet = moduleStatus.purchase_wallet;
        let credit = {
            amount: total.credit,
            text: "credited",
            amountWithCurrency: total.credit,
            icon: `${process.env.SITE_URL}/uploads/logos/income-w.png`,
            bg_color: "#8777DE",
        };
        ewalletTile.push(credit);
        let debit = {
            amount: total.debit,
            text: "debited",
            amountWithCurrency: total.debit,
            icon: `${process.env.SITE_URL}/uploads/logos/Bonus-w.png`,
            bg_color: "#38A5A9",
        };
        ewalletTile.push(debit);
        let balanceArr = {
            amount: balance.balance_amount,
            text: "ewalletBalance",
            amountWithCurrency: balance.balance_amount,
            icon: `${process.env.SITE_URL}/uploads/logos/E-Wallet-w.png`,
            bg_color: "#5B9CCE",
        };
        ewalletTile.push(balanceArr);
        let purchase = {
            amount: balance.purchase_wallet,
            text: "purchaseWallet",
            amountWithCurrency: balance.purchase_wallet,
            icon: `${process.env.SITE_URL}/uploads/logos/income-w.png`,
            bg_color: "#6176C1",
        };
        ewalletTile.push(purchase);
        let totalEarned = {
            amount: totalCommission.sum,
            text: "commissionEarned",
            amountWithCurrency: totalCommission.sum,
            icon: `${process.env.SITE_URL}/uploads/logos/income-w.png`,
            bg_color: "#E0937A",
        };
        ewalletTile.push(totalEarned);
        const defaultCurrencyValue = await common.getDefaultPlanCurrencyValue(
            prefix
        );
        const defaultCurrencyCode = await common.getDefaultCurrencyCode(prefix);
        let data = {
            transactionFee: transFee,
            repurchase_status: repurchaseStatus == 0 ? "no" : "yes",
            purchase_wallet: purchaseWallet == 0 ? "no" : "yes",
            transactionFeewithCurrency: transFee,
            ewallet_tile: ewalletTile,
            balance: balanceArr.amount,
            balanceWithCurrency: balanceArr.amountWithCurrency,
            defaultcurrencyvalue: defaultCurrencyValue,
            defaultcurrencycode: defaultCurrencyCode,
        };
        let response = await successMessage({
            value: data,
        });
        res.json(response);
    } catch (err) {
        console.log(err);
        return res.json(err.message);
    }
};

exports.fundTransfer = async (req, res) => {
    var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
    let t = await mlm_laravel.transaction();
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const userId = req.user.id;
        let { to_user_name, pswd, transaction_note, amount } = req.body;
        if (to_user_name == req.user.username) {
            let response = await errorMessage({ code: 1072 });
            return res.status(422).json(response);
        }
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        if (moduleStatus.multi_currency_status) {
            const default_currency = await common.getUserCurrencyId(
                userId,
                prefix
            );
            if (default_currency == null) {
                let defaultCurrencyValue =
                    await common.getDefaultPlanCurrencyValue(prefix);
                amount = (
                    Number(amount) / Number(defaultCurrencyValue)
                ).toFixed(8);
            } else {
                let currencyValue = await common.getUserCurrencyValue(
                    default_currency,
                    prefix
                );
                amount = (Number(amount) / Number(currencyValue)).toFixed(8);
            }
        }
        const fromUserId = userId;
        const toUserId = await common.usernameToId(to_user_name, prefix);
        if (!toUserId) {
            return res.json({
                status: false,
                error: {
                    code: 1004,
                    description: "Incorrect Input Format / Validation Error",
                    fields: {
                        to_user_name: "This username is not available",
                        to_user_name_err: "user_exists",
                    },
                },
            });
        }
        if (amount <= 0) {
            let response = await errorMessage({ code: 406 });
            return res.json(response);
        }
        const transFee = await getTransactionFee(prefix);
        const totalRegAmount = Number(amount) + Number(transFee);
        if (totalRegAmount < 1) {
            let response = await errorMessage({ code: 406 });
            return res.status(422).json(response);
        }
        const userPass = await getUserTransPassword(fromUserId, prefix);
        const fromUserBalance = await usrBalance.findOne({
            attributes: ["id", "balance_amount"],
            where: {
                user_id: fromUserId,
            },
            prefix,
        });
        const toUserBalance = await usrBalance.findOne({
            attributes: ["id", "balance_amount"],
            where: {
                user_id: toUserId,
            },
            prefix,
        });

        if (totalRegAmount <= Number(fromUserBalance.balance_amount)) {
            const checkPass = await bcrypt.compare(pswd, userPass);
            if (checkPass) {
                const uniqueTransactionId = Str.random(9);
                const totalFromUserBal =
                    Number(fromUserBalance.balance_amount) -
                    Number(totalRegAmount);
                const totalToUserBal =
                    Number(toUserBalance.balance_amount) + Number(amount);
                await fromUserBalance.update(
                    {
                        balance_amount: totalFromUserBal,
                    },
                    {
                        transaction: t,
                    },
                    prefix
                );
                await toUserBalance.update(
                    {
                        balance_amount: totalToUserBal,
                    },
                    {
                        transaction: t,
                    },
                    prefix
                );

                const TransactionDetails = await Transactions.create(
                    {
                        transaction_id: uniqueTransactionId,
                    },
                    {
                        transaction: t,
                        prefix,
                    }
                );

                const fromUserTransfer = await fundTransfer.create(
                    {
                        from_user_id: fromUserId,
                        to_id: toUserId,
                        amount: Number(amount),
                        amount_type: "user_credit",
                        notes: transaction_note,
                        trans_fee: transFee,
                        transaction_id: TransactionDetails.id,
                    },
                    {
                        transaction: t,
                        prefix,
                    }
                );
                await purchaseWalletHsty.create(
                    {
                        user_id: toUserId,
                        from_user_id: fromUserId,
                        reference_id: fromUserTransfer.id,
                        purchase_wallet: "fund_transfer",
                        amount: Number(amount),
                        purchase_wallet: 0,
                        amount_type: "user_debit",
                        type: "debit",
                        transaction_id: TransactionDetails.id,
                        transaction_fee: transFee,
                        date_added: new Date(),
                    },
                    {
                        transaction: t,
                        prefix,
                    }
                );
                // user activity
                let data = {
                    to_user: to_user_name,
                    trans_note: transaction_note,
                    amount: amount,
                };
                let dataArr = JSON.stringify(data);
                await common.insertUserActivity(
                    "Fund Transfered",
                    fromUserId,
                    "Fund Has Be Transfered",
                    dataArr,
                    t,
                    ip,
                    prefix
                );

                await t.commit();
                let response = await successMessage({ code: 200 });
                return res.json(response);
            } else {
                await t.rollback();
                let response = await errorMessage({ code: 1015 });
                return res.json(response);
            }
        } else {
            await t.rollback();
            let response = await errorMessage({ code: 1014 });
            return res.json(response);
        }
    } catch (err) {
        console.log(err);
        await t.rollback();
        return res.json(err);
    }
};

async function getEwalletOverviewTotal(moduleStatus, userId, prefix) {
    let credit = 0;
    var debit = 0;
    let amountTypes = [];

    if (moduleStatus.pin_status) {
        amountTypes = [
            "pin_purchase",
            "pin_purchase_refund",
            "pin_purchase_delete",
        ];
    }
    amountTypes = [
        ...amountTypes,
        "admin_credit",
        "admin_debit",
        "user_credit",
        "user_debit",
        "payout_request",
        "payout_release_manual",
        "payout_delete",
        "payout_inactive",
        "withdrawal_cancel",
    ];
    let eStatus = await paymentConfig.findOne({
        attributes: ["status"],
        where: {
            name: "E-wallet",
        },
        prefix,
    });
    if (eStatus.status) {
        amountTypes = [...amountTypes, "registration"];
        if (moduleStatus.ecom_status || moduleStatus.repurchase_status) {
            amountTypes = [...amountTypes, "repurchase"];
        }
        if (moduleStatus.package_upgrade) {
            amountTypes = [...amountTypes, "upgrade"];
        }
        if (moduleStatus.subscription_status) {
            amountTypes = [...amountTypes, "package_validity"];
        }
    }
    let enableBonusList = await getEnabledBonusList(prefix);
    amountTypes = [...amountTypes, ...enableBonusList];
    let ewalletCredit = await purchaseWalletHsty.findAll({
        attributes: [
            Sequelize.literal(
                "SUM(IF(purchase_wallet = 'commission', amount, amount)) as credit"
            ),
        ],
        where: {
            amount_type: amountTypes,
            user_id: userId,
        },
        raw: true,
        prefix,
    });
    let ewalletdebit = await purchaseWalletHsty.findAll({
        attributes: [
            Sequelize.literal(
                "SUM(IF(purchase_wallet = 'commission', amount, amount)) as debit"
            ),
        ],
        where: {
            user_id: userId,
            type: "debit",
            purchase_wallet: {
                [Op.ne]: "fund_transfer",
            },
        },
        raw: true,
        prefix,
    });
    let ewalletdebit2 = await purchaseWalletHsty.findAll({
        attributes: [
            Sequelize.literal(
                "SUM(IF(purchase_wallet = 'commission', amount, amount)) as debit"
            ),
        ],
        where: {
            purchase_wallet: "fund_transfer",
            from_user_id: userId,
        },
        raw: true,
        prefix,
    });
    const transFee = await purchaseWalletHsty.findOne({
        attributes: [
            [
                Sequelize.fn("SUM", Sequelize.col("transaction_fee")),
                "transaction_fee",
            ],
        ],
        where: {
            amount_type: ["payout_request", "user_debit"],
            from_user_id: userId,
        },
        prefix,
    });
    ewalletdebit[0]["debit"] += transFee.transaction_fee;
    let result = {
        credit: ewalletCredit[0]["credit"],
        debit: ewalletdebit[0]["debit"] + ewalletdebit2[0]["debit"],
    };

    return result;
}

async function getEnabledBonusList(prefix) {
    let list = [];
    let level_commission_status = 0;
    let xup_commission_status = 0;
    const moduleStatus = await modStatus.getModuleStatus(prefix);
    const config = await compensation.findOne({ prefix });

    if (
        _.includes(["Matrix", "Unilevel", "Donation"], moduleStatus.mlm_plan) ||
        moduleStatus.sponsor_commission_status
    ) {
        level_commission_status = 1;
    }
    if (moduleStatus.xup_status && level_commission_status) {
        xup_commission_status = 1;
        level_commission_status = 0;
    }
    if (moduleStatus.referral_status) {
        list.push("referral");
    }
    if (moduleStatus.rank_status) {
        list.push("rank_bonus");
    }
    if (level_commission_status) {
        list.push("level_commission");
        if (moduleStatus.repurchase_status && moduleStatus.ecom_status) {
            list.push("repurchase_level_commission");
        }
        if (moduleStatus.package_upgrade) {
            list.push("upgrade_level_commission");
        }
    }
    if (xup_commission_status) {
        list.push("xup_commission");
        if (moduleStatus.repurchase_status && moduleStatus.ecom_status) {
            list.push("xup_repurchase_level_commission");
        }
        if (moduleStatus.package_upgrade) {
            list.push("xup_upgrade_level_commission");
        }
    }
    if (moduleStatus.mlm_plan == "Binary") {
        list.push("leg");
        if (moduleStatus.repurchase_status && moduleStatus.ecom_status) {
            list.push("repurchase_leg");
        }
        if (moduleStatus.package_upgrade) {
            list.push("upgrade_leg");
        }
    }
    if (moduleStatus.mlm_plan == "Stair_Step") {
        list.push("stair_step", "override_bonus");
    }
    if (moduleStatus.mlm_plan == "Board") {
        list.push("board_commission");
    }
    if (moduleStatus.roi_status && moduleStatus.hyip_status) {
        list.push("daily_investment");
    }
    if (moduleStatus.mlm_plan == "Donation") {
        list.push("donation", "purchase_donation");
    }
    if (config.matching_bonus) {
        list.push("matching_bonus");
        if (moduleStatus.repurchase_status && moduleStatus.ecom_status) {
            list.push("matching_bonus_purchase");
        }
        if (moduleStatus.package_upgrade) {
            list.push("matching_bonus_upgrade");
        }
    }
    if (config.pool_bonus) {
        list.push("pool_bonus");
    }
    if (config.fast_start_bonus) {
        list.push("fast_start_bonus");
    }
    if (config.performance_bonus) {
        const performanceDetails = await performance.findAll({
            attributes: ["name", "slug"],
            prefix,
        });
        Object.entries(performanceDetails).map(([key, value]) => {
            list.push(value.name.replace(/ /g, "_"));
        });
    }
    return list;
}

async function userEarnings(
    user_id,
    categories,
    fromDate,
    toDate,
    filters,
    prefix
) {
    let [whereStatement, list, enableBonus] = [[], [], []];
    let bonusList = await getEnabledBonusList(prefix);
    Object.entries(bonusList).map(([key, value]) => {
        enableBonus.push(value.replaceAll(" ", "_"));
    });
    if (user_id) {
        let condition1 = {
            user_id: user_id,
        };
        whereStatement.push(condition1);
    }
    if (fromDate) {
        fromDate = moment(fromDate).format("YYYY-MM-DD 00:00:00");
        let condition2 = {
            date_of_submission: {
                [Op.gte]: fromDate,
            },
        };
        whereStatement.push(condition2);
    }
    if (toDate) {
        toDate = moment(toDate).format("YYYY-MM-DD 23:59:59");

        let condition3 = {
            date_of_submission: {
                [Op.lte]: toDate,
            },
        };
        whereStatement.push(condition3);
    }
    if (categories) {
        if (_.includes(categories, ["donation"])) {
            list.push("donation", "purchase_donation");
        }
        if (_.includes(categories, ["level_commission"])) {
            list.push(
                _.intersection(
                    [
                        "level_commission",
                        "repurchase_level_commission",
                        "upgrade_level_commission",
                    ],
                    enableBonus
                )
            );
        }
        if (_.includes(categories, ["xup_commission"])) {
            list.push(
                _.intersection(
                    [
                        "xup_commission",
                        "xup_repurchase_level_commission",
                        "xup_upgrade_level_commission",
                    ],
                    enableBonus
                )
            );
        }
        if (_.includes(categories, ["leg"])) {
            list.push(
                _.intersection(
                    ["leg", "repurchase_leg", "upgrade_leg"],
                    enableBonus
                )
            );
        }
        if (_.includes(categories, ["matching_bonus"])) {
            list.push(
                _.intersection(
                    [
                        "matching_bonus",
                        "matching_bonus_purchase",
                        "matching_bonus_upgrade",
                    ],
                    enableBonus
                )
            );
        }
        if (_.difference(categories, enableBonus)) {
            list.push(categories);
        }
        let condition4 = {
            amount_type: list,
        };
        whereStatement.push(condition4);
    }
    const earnings = await legAmount.findAll({
        attributes: [
            Sequelize.literal(
                "CASE WHEN amount_type = 'purchase_donation' THEN 'donation' WHEN amount_type = 'repurchase_leg' THEN 'leg' WHEN amount_type = 'upgrade_leg' THEN 'leg' WHEN amount_type = 'matching_bonus_purchase' THEN 'matching_bonus' WHEN amount_type = 'matching_bonus_upgrade' THEN 'matching_bonus' ELSE amount_type END AS category"
            ),
            "total_amount",
            "amount_payable",
            "tds",
            "service_charge",
            ["date_of_submission", "transaction_date"],
        ],
        raw: true,
        include: [
            {
                model: UserDetails,
                attributes: ["name", "second_name"],
                include: [
                    {
                        model: User,
                        attributes: ["username"],
                    },
                ],
            },
        ],
        where: whereStatement,
        offset: filters.start,
        limit: filters.limit,
        prefix,
    });

    return earnings;
}

async function getEnabledBonusCategories(prefix) {
    let categories = [];

    var bonusList = await getEnabledBonusList(prefix);
    bonusList = _.difference(bonusList, [
        "purchase_donation",
        "repurchase_level_commission",
        "upgrade_level_commission",
        "xup_repurchase_level_commission",
        "xup_upgrade_level_commission",
        "repurchase_leg",
        "upgrade_leg",
        "matching_bonus_purchase",
        "matching_bonus_upgrade",
    ]);

    categories = _.merge(bonusList, categories);
    return categories;
}

async function getTransactionFee(prefix) {
    const fee = await Config.findOne({
        attributes: ["trans_fee"],
        prefix,
    });
    return fee.trans_fee;
}

async function getUserTransPassword(userId, prefix) {
    const pass = await TransPass.findOne({
        attributes: ["password"],
        where: {
            user_id: userId,
        },
        prefix,
    });
    return pass.password;
}

exports.bebwalletToUsdtWalletFundTrasnfer = async (req, res) => {
    let t = await mlm_laravel.transaction();

    try {
        var ip =
            req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id } = req.user;
        let { pswd, transaction_note, amount } = req.body;
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        if (moduleStatus.multi_currency_status) {
            const default_currency = await common.getUserCurrencyId(
                userId,
                prefix
            );
            if (default_currency == null) {
                let defaultCurrencyValue =
                    await common.getDefaultPlanCurrencyValue(prefix);
                amount = (
                    Number(amount) / Number(defaultCurrencyValue)
                ).toFixed(8);
            } else {
                let currencyValue = await common.getUserCurrencyValue(
                    default_currency,
                    prefix
                );
                amount = (Number(amount) / Number(currencyValue)).toFixed(8);
            }
        }
        if (Number(amount) <= 0) {
            let response = await errorMessage({ code: 406 });
            return res.json(response);
        }
        const transFee = await getTransactionFee(prefix);
        const totalRegAmount = Number(amount) + Number(transFee);
        if (totalRegAmount < 1) {
            let response = await errorMessage({ code: 406 });
            return res.status(422).json(response);
        }
        const userPass = await getUserTransPassword(id, prefix);
        console.log(userPass);
        const cashWalletBalanceDetails = await usrBalance.findOne({
            attributes: ["id", "balance_amount", "purchase_wallet"],
            where: {
                user_id: id,
            },
            prefix,
        });
        if (
            totalRegAmount <= Number(cashWalletBalanceDetails.purchase_wallet)
        ) {
            const checkPass = await bcrypt.compare(pswd, userPass);
            if (checkPass) {
                const uniqueTransactionId = Str.random(9);
                const remainingCashWalletBalance =
                    Number(cashWalletBalanceDetails.purchase_wallet) -
                    Number(totalRegAmount);

                const latestProductWallet =
                    Number(cashWalletBalanceDetails.balance_amount) +
                    Number(amount);

                await cashWalletBalanceDetails.update(
                    {
                        balance_amount: latestProductWallet,
                        purchase_wallet: remainingCashWalletBalance,
                    },
                    {
                        transaction: t,
                    },
                    prefix
                );

                const TransactionDetails = await Transactions.create(
                    {
                        transaction_id: uniqueTransactionId,
                    },
                    {
                        transaction: t,
                        prefix,
                    }
                );
                const fund_transfer_details = await fundTransfer.create(
                    {
                        from_user_id: id,
                        to_id: id,
                        amount,
                        amount_type: "self_transfer",
                        trans_fee: transFee,
                    },
                    { transaction: t, prefix }
                );
                const cash_wallet_history = await purchaseWalletHistory.create(
                    {
                        user_id: id,
                        from_user_id: id,
                        purchase_wallet: "fund_transfer",
                        amount,
                        balance: remainingCashWalletBalance,
                        amount_type: "self_transfer",
                        type: "debit",
                        transaction_fee: transFee,
                    },
                    { transaction: t, prefix }
                );
                const product_wallet_history = await purchaseWalletHsty.create(
                    {
                        user_id: id,
                        from_user_id: id,
                        purchase_wallet: "fund_transfer",
                        amount,
                        balance: latestProductWallet,
                        amount_type: "self_transfer",
                        type: "credit",
                        transaction_fee: transFee,
                        reference_id: fund_transfer_details.dataValues.id,
                    },
                    { transaction: t, prefix }
                );

                let data = {
                    user: id,
                    trans_note: transaction_note,
                    amount: amount,
                };
                let dataArr = JSON.stringify(data);
                await common.insertUserActivity(
                    "Fund Transfered",
                    id,
                    "Fund Has Be Transfered",
                    dataArr,
                    t,
                    ip,
                    prefix
                );

                await t.commit();
                //add to ewallet history ( product wallet history)

                let response = await successMessage({ code: 200 });
                return res.json(response);
                //send success response
            } else {
                await t.rollback();
                let response = await errorMessage({ code: 1015 });
                return res.json(response);
            }
        } else {
            await t.rollback();
            let response = await errorMessage({ code: 1071 });
            return res.json(response);
        }
    } catch (error) {
        await t.rollback();
        console.log(error);
        let response = await errorMessage({ code: 406 });
        return res.json(response);
    }
};
async function getUserTransPassword(userId, prefix) {
    const pass = await TransPass.findOne({
        attributes: ["password"],
        where: {
            user_id: userId,
        },
        prefix,
    });
    return pass.password;
}
