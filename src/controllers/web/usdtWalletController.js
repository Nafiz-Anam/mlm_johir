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
// const { default: userBalance } = require("../../models/rest/userBalance");
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
const WalletHistories = db.walletHistories;
const UserWalletBalance = db.userWalletBalance;

exports.usdtWalletTiles = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        let userId = req.user.id;
        let ewalletTile = [];
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        // balance fetching
        const balance = await usrBalance.findOne({
            attributes: ["balance_amount", "purchase_wallet"],
            where: {
                user_id: userId,
            },
            prefix,
        });

        const coinBalance = await UserWalletBalance.findOne({
            attributes: ["balance"],
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
        const transFee = await getTransactionFee(prefix);
        const repurchaseStatus = moduleStatus.repurchase_status;
        const purchaseWallet = moduleStatus.purchase_wallet;

        let balanceArr = {
            amount: coinBalance?.balance ? Number(coinBalance?.balance) : 0,
            text: "usdtWalletBalence",
            amountWithCurrency: coinBalance?.balance
                ? Number(coinBalance?.balance)
                : 0,
            icon: `${process.env.SITE_URL}/uploads/logos/E-Wallet-w.png`,
            bg_color: "#5B9CCE",
            currency: "$",
        };
        ewalletTile.push(balanceArr);

        const bebLiveValue = await common.getLiveBebValue(prefix);
        let purchaseWalletValue = balance.purchase_wallet / bebLiveValue;
        let purchase = {
            amount: purchaseWalletValue ? Number(purchaseWalletValue) : 0,
            text: "purchaseWallet",
            amountWithCurrency: purchaseWalletValue ? purchaseWalletValue : 0,
            icon: `${process.env.SITE_URL}/uploads/logos/income-w.png`,
            bg_color: "#6176C1",
            currency: "BEB",
        };
        ewalletTile.push(purchase);

        let totalEarned = {
            amount: totalCommission?.sum ? Number(totalCommission?.sum) : 0,
            text: "commissionEarned",
            amountWithCurrency: totalCommission?.sum
                ? Number(totalCommission?.sum)
                : 0,
            icon: `${process.env.SITE_URL}/uploads/logos/income-w.png`,
            bg_color: "#E0937A",
            currency: "$",
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
            balance: Number(balanceArr.amount),
            purchaseWallet_balance: Number(purchase.amount),
            balanceWithCurrency: balanceArr.amountWithCurrency,
            defaultcurrencyvalue: defaultCurrencyValue,
            defaultcurrencycode: defaultCurrencyCode,
        };
        let response = await successMessage({
            value: data,
        });
        res.json(response);
    } catch (error) {
        console.log(error);
        let response = await errorMessage({ code: 403 });
        return res.status(422).json(response);
    }
};

exports.getPurchaseWalletTable = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        if (req?.query?.username) {
            req.user.id = await common.usernameToId(req.query.username, prefix);
        }
        const originUserId = await common.usernameToId(
            req.user.username,
            prefix
        );

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
        const bebLiveValue = await common.getLiveBebValue(prefix);
        balance = balance * bebLiveValue;

        Object.entries(ewalletDetails).map(([key, value]) => {
            let bebValueOfAmount = value.amount / bebLiveValue;
            if (value.type == "debit") {
                balance = balance - parseFloat(bebValueOfAmount);
            } else if (value.type == "credit") {
                balance = balance + parseFloat(bebValueOfAmount);
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
            } else if (value.amount_type == "recruit_level_bonus") {
                (description = `referal commission (${value.user.username})`),
                    (lanDesc = {
                        langCode: "referal_commission",
                        user: value.user.username,
                    });
            } else if (value.amount_type == "roi_level_commission") {
                (description = `ROI level Commission (${value.user.username})`),
                    (lanDesc = {
                        langCode: "roi_level_commission",
                        user: value.user.username,
                    });
            } else if (value.amount_type == "daily_investment") {
                (description = "Daily roi"),
                    (lanDesc = {
                        langCode: "daily_roi_commission",
                    });
            } else if (value.amount_type == "cash_back") {
                (description = "Instant cashback"),
                    (lanDesc = {
                        langCode: "instant_cashback",
                    });
            } else if (value.amount_type == "level_commission") {
                (description = "Level commission"),
                    (lanDesc = {
                        langCode: "level_commission",
                    });
            } else if (value.amount_type == "self_transfer") {
                (description = "BEB to USDT wallet"),
                    (lanDesc = {
                        langCode: "self_transfer",
                    });
            } else if (value.amount_type == "self_transfer_to_beb") {
                (description = "USDT to BEB wallet"),
                    (lanDesc = {
                        langCode: "self_transfer",
                    });
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

            // table_data[key] = {
            //   description: description,
            //   description1: lanDesc,
            //   amount: value.purchase_wallet / bebLiveValue,
            //   type: value.type,
            //   debit: `${dc.defaultCurrencySymbol}${value.purchase_wallet/bebLiveValue}`,
            //   credit: `${dc.defaultCurrencySymbol}${value.purchase_wallet/beb}`,
            //   date: moment(value.created_at).format("MM/DD/YYYY"),
            //   balance: balance,
            // };
            table_data[key] = {
                description: description,
                description1: lanDesc,
                amount: value.purchase_wallet / bebLiveValue,
                type: value.type,
                debit: `BEB ${value.purchase_wallet / bebLiveValue}`,
                credit: `BEB ${value.purchase_wallet / bebLiveValue}`,
                date: moment(value.created_at).format("MM/DD/YYYY"),
                balance: balance,
            };
        });
        var parAccountStatus = !(await common.isSubAccount(
            originUserId,
            prefix
        ));
        var subUserNames = [];
        var subAccountCount = await common.getSubAccountCount(
            originUserId,
            prefix
        );
        parAccountStatus =
            parAccountStatus && subAccountCount > 0 ? true : false;
        if (parAccountStatus) {
            let isSubaccount = await common.isSubAccount(user_id, prefix);
            var subaccounts;
            if (!isSubaccount) {
                subaccounts = await common.getSubAccountUsernames(
                    user_id,
                    prefix
                );
            } else {
                let parentId = await common.getParentId(user_id, prefix);
                subaccounts = await common.getSubAccountUsernames(
                    parentId,
                    prefix
                );
            }

            Object.entries(subaccounts).map(([key, value]) => {
                subUserNames[key] = {
                    value: value.username,
                };
            });
        }
        let data = {
            count: count,
            table_data: table_data,
            subAccounts: subUserNames,
            parAccountStatus,
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
