const db = require("../../models");
const Curr = require("../../utils/web/allCurrency");
const Lang = require("../../utils/web/allLanguages");
const userId = require("../../utils/web/getLoggedUserId");
const { join } = require("path");
const fs = require("fs");
const moment = require("moment");
const { Op, Sequelize } = require("sequelize");
const modStatus = require("../../utils/web/moduleStatus");
const HomeService = require("../../utils/web/homeService");
const dc = require("../../utils/web/constants");
const common = require("../../utils/web/common");
const { successMessage } = require("../../utils/web/response");
const siteInformation = db.siteInfo;
const Menus = db.menus;
const MenuPermissions = db.menuPermissions;
const Status = db.moduleStatus;
const User = db.user;
const pack = db.pack;
const rankConfig = db.rankConfig;
const userDashItems = db.userDashboardItems;
const UserDetails = db.userDetails;
const rankDetails = db.rankDetails;
const Rank = db.ranks;
const Mailbox = db.mailBoxes;
const CompanyDetails = db.companyDetails;
const Configuration = db.configuration;
const MailServices = require("../../utils/web/mailServices");
const EWalletServices = require("../../utils/web/ewalletServices");
const PurchaseServices = require("../../utils/web/purchaseServices");
const StringValidator = db.stringValidator;
var crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Tokens = db.accessToken;

const { liveValueUpdates } = require("../../utils/web/liveValueServices");

exports.getAppLayout = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id, username } = req.user;
        let menuList = [],
            Languages,
            Currencies;
        const ModuleStatus = await Status.findOne({ prefix });

        if (ModuleStatus["lang_status"]) {
            Languages = await Lang.getAllLanguage(prefix);
        }
        if (ModuleStatus["multi_currency_status"]) {
            Currencies = await Curr.getAllCurrencies(prefix);
        }

        const userLangDetails = await User.findOne({
            where: { id },
            prefix,
        });

        const userDetails = await UserDetails.findOne({
            where: {
                id,
            },
            prefix,
        });

        const menu = await Menus.findAll({
            attributes: ["id", "title", "slug", "user_icon", "order"],
            include: [
                {
                    model: MenuPermissions,
                    where: {
                        user_permission: 1,
                    },
                },
                {
                    model: Menus,
                    as: "submenu",
                    include: [
                        {
                            model: MenuPermissions,
                            where: {
                                user_permission: 1,
                            },
                        },
                    ],
                    where: {
                        admin_only: 0,
                    },
                    required: false,
                },
            ],
            where: {
                react: 1,
                admin_only: 0,
            },
            order: [
                ["order"],
                [{ model: Menus, as: "submenu" }, "child_order"],
            ],
            prefix,
        });

        console.log(
            `************************************ menu ***********************************`
        );
        for await (let [key, value] of Object.entries(menu)) {
            let subMenuList = [];
            let subMenuTitle;
            let subMenuUrl;
            let menuTitle;
            let route, url;
            if (value.submenu.length > 0) {
                for await (let [i, submenu] of Object.entries(value.submenu)) {
                    switch (submenu.title) {
                        case "Genealogy Tree":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "genealogyTree",
                                icon: null,
                                to: "/genealogyTree",
                            };
                            break;
                        case "Sponsor Tree":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "sponsorTree",
                                icon: null,
                                to: "/sponsorTree",
                            };
                            break;
                        case "Tree View":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "treeView",
                                icon: null,
                                to: "/treeView",
                            };
                            break;
                        case "Downline Members":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "downlineMembers",
                                icon: null,
                                to: "/downlineMembers",
                            };
                            break;
                        case "Referral Members":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "referralMembers",
                                icon: null,
                                to: "/referralMembers",
                            };
                            break;
                        case "Recieved Donation":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "recievedDonation",
                                icon: null,
                                to: "/recievedDonation",
                            };
                            break;
                        case "Send Donation":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "sendDonation",
                                icon: null,
                                to: "/sendDonation",
                            };
                            break;
                        case "Missed Donation":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "missedDonation",
                                icon: null,
                                to: "/missedDonation",
                            };
                            break;
                        case "Promotion Status":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "promotion_status",
                                icon: null,
                                to: "/promotion_status",
                            };
                            break;
                        case "Leads":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "leads",
                                icon: null,
                                to: "/leads",
                            };
                            break;
                        case "Add Lead":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "addLead",
                                icon: null,
                                to: "/addLead",
                            };
                            break;
                        case "View Lead":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "viewLead",
                                icon: null,
                                to: "/viewLead",
                            };
                            break;
                        case "Graph":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "graph",
                                icon: null,
                                to: "/graph",
                            };
                            break;
                        case "Faqs":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "faq",
                                icon: null,
                                to: "/faq",
                            };
                            break;
                        case "Replica Site":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "replica_configuration",
                                icon: null,
                                to: "/replica_configuration",
                            };
                            break;
                        case "Promotional Tools":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "promotion_status",
                                icon: null,
                                to: "/promotion_status",
                            };
                            break;
                        case "Download Materials":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "downloadDocument",
                                icon: null,
                                to: "/downloadDocument",
                            };
                            break;
                        case "Dashboard":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "crmDashboard",
                                icon: null,
                                to: "/crmDashboard",
                            };
                            break;
                        case "News":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "news",
                                icon: null,
                                to: "/news",
                            };
                            break;
                        case "Step View":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "stepView",
                                icon: null,
                                to: "/stepView",
                            };
                            break;
                        case "Setup Party":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "setupParty",
                                icon: null,
                                to: "/createParty",
                            };
                            break;
                        case "Host Management":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "hostManager",
                                icon: null,
                                to: "/host_manager",
                            };
                            break;
                        case "Guest Management":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "guestManager",
                                icon: null,
                                to: "/guest_manager",
                            };
                            break;
                        case "Order History":
                            subMenuList[i] = {
                                id: submenu.id,
                                title: "orderHistory",
                                icon: null,
                                to: "/orderHistory",
                            };
                            break;
                        default:
                            subMenuList[i] = {
                                id: submenu.id,
                                title: submenu.title,
                                icon: null,
                                to: submenu.slug,
                            };
                            break;
                    }
                }
            }
            if (value.title != "Dashboard") {
                switch (value.title) {
                    case "Networks":
                        menuTitle = "network";
                        break;
                    case "Register":
                        menuTitle = "register";
                        route = "/register";
                        url = ModuleStatus.ecom_status ? true : false;
                        break;
                    case "Donation":
                        menuTitle = "donation";
                        break;
                    case "E Wallet":
                        menuTitle = "ewallet";
                        route = "/usdt_wallet";
                        break;
                    case "Payout":
                        menuTitle = "payout";
                        route = "/payout";
                        break;
                    case "E-pin":
                        menuTitle = "epin";
                        route = "/epin";
                        break;
                    case "Shopping":
                        menuTitle = "shopping";
                        route = "/shopping";
                        break;
                    case "Mail Box":
                        menuTitle = "mailbox";
                        route = "/mailbox";
                        break;
                    case "Tools":
                        menuTitle = "tools";
                        break;
                    case "Support Center":
                        menuTitle = "support";
                        route = "/support";
                        break;
                    case "CRM":
                        menuTitle = "crm";
                        break;
                    case "Parties":
                        menuTitle = "party";
                        break;
                    case "Order Details":
                        menuTitle = "orderDetails";
                        break;
                    case "Store":
                        menuTitle = "ecomStore";
                        url = ModuleStatus.ecom_status ? true : false;
                        break;
                    case "USDT Wallet":
                        menuTitle = "usdtWallet";
                        route = "";
                        break;
                    case "BEB Wallet":
                        menuTitle = "bebWallet";
                        route = "";
                        break;
                    default:
                        break;
                }
                menuList[key] = {
                    id: value["id"],
                    title: menuTitle,
                    icon: value["user_icon"],
                    to: value["submenu"].length > 0 ? null : route,
                    url: url,
                    subMenuList: value["submenu"].length > 0 ? subMenuList : [],
                    // 'sub_menu': (value['subMenuList'].length > 0) ? value['subMenuList'].push(['to',1]) : [],
                };
            }
        }
        const companyDetailsResult = await CompanyDetails.findOne({ prefix });

        let defaultLanguage;
        if (ModuleStatus.lang_status) {
            if (userLangDetails.default_lang) {
                let objIndex = Languages.findIndex(
                    (obj) => obj.default === true
                );
                Languages[objIndex].default = false;
                let userDefaultLang = Languages.findIndex(
                    (obj) => obj.id === userLangDetails.default_lang
                );
                Languages[userDefaultLang].default = true;
            } else {
                defaultLanguage = Languages.find((o) => o.default === true);
            }
        }

        const company_info = {
            id: companyDetailsResult.id,
            company_name: companyDetailsResult.name,
            logo: companyDetailsResult.logo,
            email: companyDetailsResult.email ? companyDetailsResult.email : "",
            phone: companyDetailsResult.phone ? companyDetailsResult.phone : "",
            favicon: companyDetailsResult.favicon
                ? companyDetailsResult.favicon
                : "",
            company_address: companyDetailsResult.address
                ? companyDetailsResult.address
                : "",
            default_lang: defaultLanguage?.id ? defaultLanguage?.id : "",
            fb_link: companyDetailsResult.fb_link
                ? companyDetailsResult.fb_link
                : "",
            twitter_link: companyDetailsResult.twitter_link
                ? companyDetailsResult.twitter_link
                : "",
            inst_link: companyDetailsResult.inst_link
                ? companyDetailsResult.inst_link
                : "",
            gplus_link: companyDetailsResult.gplus_link
                ? companyDetailsResult.gplus_link
                : "",
            fb_count: companyDetailsResult.fb_count
                ? companyDetailsResult.fb_count
                : 0,
            twitter_count: 0,
            inst_count: companyDetailsResult.inst_count
                ? companyDetailsResult.inst_count
                : 0,
            gplus_count: companyDetailsResult.gplus_count
                ? companyDetailsResult.gplus_count
                : 0,
            login_logo: companyDetailsResult.login_logo,
            logo_shrink: companyDetailsResult.logo_shrink,
        };
        const oldImageUrl = join(
            __dirname,
            "../uploads/images/profilePic/",
            userDetails?.image == null ? "" : userDetails.image
        );
        if (userDetails?.image == null) {
            var profilePic = "";
        } else {
            var profilePic = userDetails.image;
        }
        const { width_ceiling } = await Configuration.findOne({ prefix });

        const data = {
            lang_status: ModuleStatus.lang_status ? true : false,
            languages: Languages,
            currency_status: ModuleStatus.multi_currency_status ? true : false,
            currencies: Currencies,
            menu_list: menuList.filter((el) => {
                return el !== null && typeof el !== "undefined";
            }),
            user_name: username,
            company_info,
            user_Image: profilePic,
            mlm_plan: ModuleStatus.mlm_plan,
            width: width_ceiling ? width_ceiling : 0,
            company_name: companyDetailsResult.name,
        };
        res.json({
            status: true,
            data,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: `Error: ${error.message}`,
        });
    }
};

exports.getDashboard = async (req, res) => {
    var datas = {};
    const prefix = req.headers["api-key"];
    if (!prefix) {
        let response = await errorMessage({ code: 1001 });
        return res.json(response);
    }
    const user_id = req.user.id;

    let { range } = req.query;
    let fromDate, toDate;
    var date = new Date();
    switch (range) {
        case "monthly_payout":
            fromDate = new Date(date.getFullYear(), date.getMonth(), 1);
            toDate = new Date(
                date.getFullYear(),
                date.getMonth() + 1,
                0
            ).setHours(23, 59, 59);
            break;
        case "yearly_payout":
            fromDate = new Date(date.getFullYear(), 0, 1);
            toDate = new Date(date.getFullYear(), 11, 31).setHours(23, 59, 59);
            break;
        case "weekly_payout": // current date of week
            var currentWeekDay = date.getDay();
            var lessDays = currentWeekDay == 0 ? 6 : currentWeekDay - 1;
            fromDate = new Date(new Date(dt).setDate(dt.getDate() - lessDays));
            toDate = new Date(
                new Date(fromDate).setDate(fromDate.getDate() + 6)
            ).setHours(23, 59, 59);
            break;
        default:
            fromDate = "";
            toDate = "";
            break;
    }
    const moduleStatus = await Status.findOne({ prefix });

    if (moduleStatus.rank_status) {
        var rnkConfig = await rankConfig.findAll({ prefix });
        var rankConfiguration = rnkConfig.reduce(
            (obj, item) => ({
                ...obj,
                [item.slug]: item.status,
            }),
            {}
        );
    }
    const dashboardItems = await userDashItems.findAll({ prefix });

    let dashboard = dashboardItems.reduce(
        (obj, item) => ({
            ...obj,
            [item.slug]: item.status,
        }),
        {}
    );

    let tilesArr = [];
    if (dashboard["e-wallet"]) {
        // var ewallet = await HomeService.getGrandTotalEwallet(user_id, prefix);
        var ewallet = await HomeService.getWalletBalance(user_id, prefix);

        if (ewallet == null) {
            ewallet = 0;
        }
        tiles = {
            amount: ewallet,
            withcurrency: `${dc.defaultCurrencySymbol}${ewallet}`,
            text: "ewallet",
            title: "E-Wallet",
            to: "/ewallet",
            filter: false,
        };
        tilesArr.push(tiles);
    }

    if (dashboard["commission-earned"]) {
        var commission = await HomeService.getCommissionDetails(
            user_id,
            fromDate,
            toDate,
            prefix
        );
        if (commission == null) {
            commission = 0;
        }
        tiles = {
            amount: commission,
            withcurrency: `${dc.defaultCurrencySymbol}${commission}`,
            text: "commision",
            title: "Commision Earned",
            to: "/ewallet",
            filter: true,
        };
        tilesArr.push(tiles);
    }
    if (dashboard["payout-released"]) {
        var payoutReleased = await HomeService.getPayoutDetails(
            user_id,
            fromDate,
            toDate,
            prefix
        );
        if (payoutReleased == null) {
            payoutReleased = 0;
        }
        tiles = {
            amount: payoutReleased,
            withcurrency: `${dc.defaultCurrencySymbol}${payoutReleased}`,
            text: "payoutRelease",
            title: "Payout Released",
            to: "/payout",
            filter: true,
        };
        tilesArr.push(tiles);
    }
    if (dashboard["payout-pending"]) {
        var payoutPending = await HomeService.getRequestPendingAmount(
            user_id,
            prefix
        );
        if (payoutPending == null) {
            payoutPending = 0;
        }
        tiles = {
            amount: payoutPending,
            withcurrency: `${dc.defaultCurrencySymbol}${payoutPending}`,
            text: "payoutPending",
            title: "Payout Pending",
            to: "/payout",
            filter: false,
        };
        tilesArr.push(tiles);
    }
    datas["tiles"] = tilesArr;
    if (moduleStatus.rank_status) {
        var rank_details = await User.findOne({
            attributes: ["id"],
            where: {
                id: user_id,
            },
            include: [
                {
                    model: rankDetails,
                    as: "rank",
                    include: [
                        {
                            model: Rank,
                            as: "details",
                        },
                    ],
                },
            ],
            prefix,
        });
    }

    const userDetails = await User.findOne({
        where: {
            id: user_id,
        },
        include: [
            {
                model: UserDetails,
                as: "details",
            },
            {
                model: pack,
                as: "package",
            },
        ],
        prefix,
    });
    const placementDetails = await User.findOne({
        attributes: ["username"],
        include: [
            {
                model: User,
                as: "U2",
                attributes: ["username"],
            },
        ],
        where: {
            id: user_id,
        },
        prefix,
    });

    // profile
    const oldImageUrl = join(
        __dirname,
        "../uploads/images/profilePic/",
        userDetails.details.image == null ? "" : userDetails.details.image
    );
    if (userDetails.details.image == null) {
        var profilePic = "";
    } else {
        var profilePic = userDetails.details.image;
    }
    console.log("profilePic => ", profilePic);
    datas["profile"] = {
        user_photo: profilePic,
    };
    if (
        moduleStatus.product_status &&
        dashboard["profile-membership-replica-lcp"]
    ) {
        if (moduleStatus.ecom_status) {
            // TODO ECOM
            var membership = await common.getProductNameFromUserID(
                user_id,
                prefix
            );
        } else {
            var membership = userDetails.package.name;
        }
        var package = {
            title: "Current Package",
            name: membership,
        };
        if (moduleStatus.package_upgrade) {
            // TODO
        }
    }
    if (
        moduleStatus.product_status &&
        dashboard["profile-membership-replica-lcp"] &&
        moduleStatus.subscription_status
    ) {
        // TODO
    }
    // return res.json(!rankConfiguration['joiner-package'])
    if (
        moduleStatus.rank_status &&
        rankConfiguration["joiner-package"] != 1 &&
        dashboard["profile-membership-replica-lcp"]
    ) {
        var rank = {
            title: "Rank",
            curent_rank: rank_details?.rank?.details?.name
                ? rank_details.rank.details.name
                : "NA",
            color: rank_details?.rank?.details?.color
                ? rank_details.rank.details.color
                : "#ccc",
        };
    }
    datas["profile"] = {
        rank: rank,
    };
    const admin = await common.getAdminUsername(prefix);
    const user = await common.idToUsername(user_id, prefix);
    const sponsor = await common.idToUsername(userDetails.sponsor_id, prefix);
    if (
        moduleStatus.replicated_site_status &&
        dashboard["profile-membership-replica-lcp"]
    ) {
        if (process.env.DEMO_STATUS == "yes") {
            if (moduleStatus.ecom_status) {
                var replicaLink = await common.createEcomLink(
                    user_id,
                    "register",
                    prefix
                );
            } else {
                var replicaLink = `${process.env.REPLICA_URL}/replica/${user}/${admin}`;
            }
        } else {
            if (moduleStatus.ecom_status) {
                var replicaLink = await common.createEcomLink(
                    user_id,
                    "register",
                    prefix
                );
            } else {
                var replicaLink = `${process.env.REPLICA_URL}/replica/${user}/${admin}`;
            }
        }
        var replica = [
            {
                icon: "fa fa-files-o",
                link: replicaLink,
            },
            {
                icon: "fa fa-facebook",
                link: `https://www.facebook.com/sharer/sharer.php?u=${replicaLink}`,
            },
            {
                icon: "fa fa-twitter",
                link: `https://twitter.com/share?url=${replicaLink}`,
            },
            {
                icon: "fa fa-linkedin",
                link: `http://www.linkedin.com/shareArticle?url=${replicaLink}`,
            },
        ];
        datas["profile"] = {
            lead_capture: leadCapture,
        };
    }
    if (
        moduleStatus.lead_capture_status &&
        dashboard["profile-membership-replica-lcp"]
    ) {
        if (process.env.DEMO_STATUS == "yes") {
            var leadLink = `${process.env.REPLICA_URL}/lcp/${user}/${admin}`;
        } else {
            var leadLink = `${process.env.SITE_URL}/lcp/${user}/${admin}`;
        }
        var leadCapture = [
            {
                icon: "fa fa-files-o",
                link: leadLink,
            },
            {
                icon: "fa fa-facebook",
                link: `https://www.facebook.com/sharer/sharer.php?u=${leadLink}`,
            },
            {
                icon: "fa fa-twitter",
                link: `https://twitter.com/share?url=${leadLink}`,
            },
            {
                icon: "fa fa-linkedin",
                link: `http://www.linkedin.com/shareArticle?url=${leadLink}`,
            },
        ];
        datas["profile"] = profile;
    }
    if (dashboard["profile-membership-replica-lcp"]) {
        var profile = {
            full_name1: `${userDetails.details.name} ${userDetails.details.second_name}`,
            user_name: `${userDetails.username}`,
            user_photo: profilePic,
            placement: `${placementDetails.U2.username}`,
            membership_package: package,
            rank: rank,
            replica_title: "Replica Link",
            replica: replica,
            lead_capture_title: "Lead Capture",
            lead_capture: leadCapture,
        };
        datas["profile"] = profile;
    }
    let sponsorDetails = {
        head: sponsor,
        text: "sponsorName",
        title: "sponsor_name",
    };
    datas["sponser_details"] = [sponsorDetails];
    var extraData = [];
    if (dashboard["sponsor-pv-carry"]) {
        var extra1 = [
            {
                head: userDetails.personal_pv,
                text: "personalPv",
                title: "Personal PV",
            },
            {
                head: userDetails.group_pv,
                text: "groupPV",
                title: "Group PV",
            },
        ];
        extraData.push(...extra1);
        datas["extra_data"] = extraData;
    }
    if (moduleStatus.mlm_plan == "Binary") {
        var extra2 = [
            {
                head: userDetails.total_left_carry,
                text: "leftCarry",
                title: "Left Carry",
            },
            {
                head: userDetails.total_right_carry,
                text: "rightCarry",
                title: "Right Carry",
            },
        ];
        extraData.push(...extra2);
        datas["extra_data"] = extraData;
    }
    if (dashboard["new-members"]) {
        const lastestJoinee = await HomeService.getLatestJoinees(
            user_id,
            prefix
        );
        var joineeArr = [];
        lastestJoinee.map((value, key) => {
            value.details.image = value.details.image;
            joineeArr[key] = {
                id: value.id,
                user_name: value.username,
                active: value.active,
                date_of_joining: moment(value.date_of_joining).format(
                    "MMMM Do YYYY"
                ),
                user_full_name: `${value.details.name} ${value.details.second_name}`,
                product_amount: value.userRegistration.product_amount,
                profile_pic: value.details.image,
            };
            datas["new_members"] = joineeArr;
        });
    }
    if (dashboard["rank"] && moduleStatus.rank_status) {
        // current rank
        let crank = await HomeService.currentRankName(user_id, prefix);
        let nrank = "";
        if (crank != "") {
            var currentRank = await HomeService.getCurrentRankData(
                user_id,
                prefix
            );
            nrank = await HomeService.getNextRankName(crank.id, prefix);
            datas["rank"] = {
                current: {
                    criteria: currentRank,
                    name: crank.name,
                },
            };
        } else {
            nrank = await HomeService.getNextRankName("", prefix);
        }
        let nextRank;
        if (nrank != "" || nrank != false) {
            nextRank = await HomeService.getNextRankData(
                nrank?.id,
                user_id,
                prefix
            );
            datas["rank"] = {
                ...datas.rank,
                next: {
                    criteria: nextRank,
                    name: nrank.name,
                },
            };
        }
    }

    if (dashboard["earnings-expenses"]) {
        if (dashboard["earnings"]) {
            const earning = await HomeService.getAllIncomeOrExpense(
                user_id,
                "credit",
                prefix
            );
            var income = [];
            earning.map((value, key) => {
                var type = value.amount_type;
                if (type == "rank_bonus") {
                    type = "rankcommission";
                } else if (type == "level_commission") {
                    type = "levelCommission";
                } else if (type == "leg") {
                    type = "binaryCommission";
                } else if (type == "referral") {
                    type = "referralCommission";
                }
                income[key] = {
                    amount: value?.amount,
                    amount_type: value?.amount_type,
                    user_id: value?.user_id,
                    title: type,
                };
            });
            datas["earnings_nd_expenses"] = {
                ...datas["earnings_nd_expenses"],
                incomes: income ? income : [],
            };
        }
        if (dashboard["expenses"]) {
            var expenseArr = [];
            const expenses = await HomeService.getAllIncomeOrExpense(
                user_id,
                "debit",
                prefix
            );
            expenses.map((value, key) => {
                expenseArr[key] = {
                    amount: value?.amount,
                    amount_type: value?.amount_type,
                    user_id: value?.user_id,
                };
            });
            datas["earnings_nd_expenses"] = {
                ...datas["earnings_nd_expenses"],
                expenses: expenseArr ? expenseArr : [],
            };
        }
        if (dashboard["payout-status"]) {
            var payoutStatus = {
                requested: await HomeService.getRequestPendingAmount(
                    user_id,
                    prefix
                ),
                approved: await HomeService.getUserTotalPayouts(
                    user_id,
                    "approved",
                    prefix
                ),
                paid: await HomeService.getUserTotalPayouts(
                    user_id,
                    "paid",
                    prefix
                ),
                rejected: await HomeService.getUserTotalPayouts(
                    user_id,
                    "rejected",
                    prefix
                ),
            };
            datas["earnings_nd_expenses"] = {
                ...datas["earnings_nd_expenses"],
                payout_statuses: payoutStatus ? payoutStatus : [],
            };
        }
    }
    if (dashboard["team-perfomance"]) {
        if (dashboard["top-earners"]) {
            var topEarners = await HomeService.getTopEarners(user_id, prefix);
            topEarners.map((value, key) => {
                value.profile_picture = value.profile_picture;
            });
            datas["team_perfomance"] = {
                ...datas["team_perfomance"],
                top_earners: topEarners ? topEarners : [],
            };
        }
        if (dashboard["top-recruiters"]) {
            var topRecruites = await HomeService.getTopRecruters(
                user_id,
                prefix
            );
            topRecruites.map((value, key) => {
                value.profile_picture = value.profile_picture;
            });
            datas["team_perfomance"] = {
                ...datas["team_perfomance"],
                top_recruiters: topRecruites ? topRecruites : [],
            };
        }
        if (moduleStatus.rank_status) {
            if (dashboard["rank-overview"]) {
                var rankData = await HomeService.getRankData(user_id, prefix);
                datas["team_perfomance"] = {
                    ...datas["team_perfomance"],
                    rank_overview: rankData,
                };
            }
        }
        if (moduleStatus.product_status) {
            if (dashboard["package-overview"]) {
                var packageData = await HomeService.getPackageProgressData(
                    user_id,
                    prefix
                );
                datas["team_perfomance"] = {
                    ...datas["team_perfomance"],
                    package_overview: packageData,
                };
            }
        }
    }
    if (dashboard["joinings-graph"]) {
        let chartsData = [];
        let chartMode = "month";
        let graphData = await HomeService.getJoiningLineChartData(
            user_id,
            chartMode,
            moduleStatus,
            prefix
        );
        if (moduleStatus.mlm_plan == "Binary") {
            Object.entries(graphData.labels).map(([key, value]) => {
                chartsData[key] = [
                    value,
                    graphData["leftArr"][key],
                    graphData["rightArr"][key],
                ];
            });
            var joiningGraphData = {
                chart: chartsData,
                label: ["left_join", "right_join"],
                code: ["leftJoinings", "rightJoinings"],
                color: ["#7265ba", "#189ec8"],
                background: [
                    "rgba(149, 139, 204,0.3)",
                    "rgba(71, 172, 222,0.3)",
                ],
            };
        } else {
            Object.entries(graphData.labels).map(([key, value]) => {
                chartsData[key] = [value, graphData["joinArray"][key]];
            });
            var joiningGraphData = {
                chart: chartsData,
                label: ["joinings"],
                code: ["joinings"],
                color: ["#7265ba"],
                background: ["rgba(149, 139, 204,0.3)"],
            };
        }
        datas["joining_graph_data_new"] = joiningGraphData;
    }

    let response = await successMessage({ value: datas });
    return res.json(response);
};

exports.getDashboard1 = async (req, res) => {
    var datas = {};
    const prefix = req.headers["api-key"];
    if (!prefix) {
        let response = await errorMessage({ code: 1001 });
        return res.json(response);
    }
    const user_id = req.user.id;

    let { range } = req.query;
    let fromDate, toDate;
    var date = new Date();
    switch (range) {
        case "monthly_payout":
            fromDate = new Date(date.getFullYear(), date.getMonth(), 1);
            toDate = new Date(
                date.getFullYear(),
                date.getMonth() + 1,
                0
            ).setHours(23, 59, 59);
            break;
        case "yearly_payout":
            fromDate = new Date(date.getFullYear(), 0, 1);
            toDate = new Date(date.getFullYear(), 11, 31).setHours(23, 59, 59);
            break;
        case "weekly_payout": // current date of week
            var currentWeekDay = date.getDay();
            var lessDays = currentWeekDay == 0 ? 6 : currentWeekDay - 1;
            fromDate = new Date(new Date(dt).setDate(dt.getDate() - lessDays));
            toDate = new Date(
                new Date(fromDate).setDate(fromDate.getDate() + 6)
            ).setHours(23, 59, 59);
            break;
        default:
            fromDate = "";
            toDate = "";
            break;
    }
    const moduleStatus = await Status.findOne({ prefix });
    if (moduleStatus.rank_status) {
        var rnkConfig = await rankConfig.findAll({ prefix });
        var rankConfiguration = rnkConfig.reduce(
            (obj, item) => ({
                ...obj,
                [item.slug]: item.status,
            }),
            {}
        );
    }
    const dashboardItems = await userDashItems.findAll({ prefix });
    let dashboard = dashboardItems.reduce(
        (obj, item) => ({
            ...obj,
            [item.slug]: item.status,
        }),
        {}
    );

    let tilesArr = [];
    if (dashboard["e-wallet"]) {
        var ewallet = await HomeService.getGrandTotalEwallet(user_id, prefix);
        if (ewallet == null) {
            ewallet = 0;
        }
        tiles = {
            amount: ewallet,
            withcurrency: `${dc.defaultCurrencySymbol}${ewallet}`,
            text: "ewallet",
            title: "E-Wallet",
            to: "/usdt_wallet",
            filter: false,
        };
        tilesArr.push(tiles);
    }

    if (dashboard["commission-earned"]) {
        var commission = await HomeService.getCommissionDetails(
            user_id,
            fromDate,
            toDate,
            prefix
        );
        if (commission == null) {
            commission = 0;
        }
        tiles = {
            amount: commission,
            withcurrency: `${dc.defaultCurrencySymbol}${commission}`,
            text: "commision",
            title: "Commision Earned",
            to: "/usdt_wallet",
            filter: true,
        };
        tilesArr.push(tiles);
    }
    if (dashboard["payout-released"]) {
        var payoutReleased = await HomeService.getPayoutDetails(
            user_id,
            fromDate,
            toDate,
            prefix
        );
        if (payoutReleased == null) {
            payoutReleased = 0;
        }
        tiles = {
            amount: payoutReleased,
            withcurrency: `${dc.defaultCurrencySymbol}${payoutReleased}`,
            text: "payoutRelease",
            title: "Payout Released",
            to: "/payout",
            filter: true,
        };
        tilesArr.push(tiles);
    }
    if (dashboard["payout-pending"]) {
        var payoutPending = await HomeService.getRequestPendingAmount(
            user_id,
            prefix
        );
        if (payoutPending == null) {
            payoutPending = 0;
        }
        tiles = {
            amount: payoutPending,
            withcurrency: `${dc.defaultCurrencySymbol}${payoutPending}`,
            text: "payoutPending",
            title: "Payout Pending",
            to: "/payout",
            filter: false,
        };
        tilesArr.push(tiles);
    }
    datas["tiles"] = tilesArr;
    if (moduleStatus.rank_status) {
        var rank_details = await User.findOne({
            attributes: ["id"],
            where: {
                id: user_id,
            },
            include: [
                {
                    model: rankDetails,
                    as: "rank",
                    include: [
                        {
                            model: Rank,
                            as: "details",
                        },
                    ],
                },
            ],
            prefix,
        });
    }

    const userDetails = await User.findOne({
        where: {
            id: user_id,
        },
        include: [
            {
                model: UserDetails,
                as: "details",
            },
            {
                model: pack,
                as: "package",
            },
        ],
        prefix,
    });

    const placementDetails = await User.findOne({
        attributes: ["username"],
        include: [
            {
                model: User,
                as: "U2",
                attributes: ["username"],
            },
        ],
        where: {
            id: user_id,
        },
        prefix,
    });

    // profile
    const oldImageUrl = join(
        __dirname,
        "../uploads/images/profilePic/",
        userDetails.details.image == null ? "" : userDetails.details.image
    );
    if (userDetails.details.image == null) {
        var profilePic = "";
    } else {
        var profilePic = userDetails.details.image;
    }
    datas["profile"] = {
        user_photo: profilePic,
    };
    if (
        moduleStatus.product_status &&
        dashboard["profile-membership-replica-lcp"]
    ) {
        if (moduleStatus.ecom_status) {
            // TODO ECOM
            var membership = await common.getProductNameFromUserID(
                user_id,
                prefix
            );
        } else {
            var membership = userDetails.package.name;
        }
        var package = {
            title: "Current Package",
            name: membership,
        };
        if (moduleStatus.package_upgrade) {
            // TODO
        }
    }
    if (
        moduleStatus.product_status &&
        dashboard["profile-membership-replica-lcp"] &&
        moduleStatus.subscription_status
    ) {
        // TODO
    }
    // return res.json(!rankConfiguration['joiner-package'])
    if (
        moduleStatus.rank_status &&
        rankConfiguration["joiner-package"] != 1 &&
        dashboard["profile-membership-replica-lcp"]
    ) {
        var rank = {
            title: "Rank",
            curent_rank: rank_details?.rank?.details?.name
                ? rank_details.rank.details.name
                : "NA",
            color: rank_details?.rank?.details?.color
                ? rank_details.rank.details.color
                : "#ccc",
        };
    }
    datas["profile"] = {
        rank: rank,
    };
    const admin = await common.getAdminUsername(prefix);
    const user = await common.idToUsername(user_id, prefix);
    const sponsor = await common.idToUsername(userDetails.sponsor_id, prefix);
    if (
        moduleStatus.replicated_site_status &&
        dashboard["profile-membership-replica-lcp"]
    ) {
        if (process.env.DEMO_STATUS == "yes") {
            if (moduleStatus.ecom_status) {
                var replicaLink = await common.createEcomLink(
                    user_id,
                    "register",
                    prefix
                );
            } else {
                var replicaLink = `${process.env.REPLICA_URL}/replica/${user}`;
            }
        } else {
            if (moduleStatus.ecom_status) {
                var replicaLink = await common.createEcomLink(
                    user_id,
                    "register",
                    prefix
                );
            } else {
                var replicaLink = `${process.env.REPLICA_URL}/replica/${user}`;
            }
        }
        var replica = [
            {
                icon: "fa fa-files-o",
                link: replicaLink,
            },
            {
                icon: "fa fa-facebook",
                link: `https://www.facebook.com/sharer/sharer.php?u=${replicaLink}`,
            },
            {
                icon: "fa fa-twitter",
                link: `https://twitter.com/share?url=${replicaLink}`,
            },
            {
                icon: "fa fa-linkedin",
                link: `http://www.linkedin.com/shareArticle?url=${replicaLink}`,
            },
        ];
        datas["profile"] = {
            lead_capture: leadCapture,
        };
    }
    if (
        moduleStatus.lead_capture_status &&
        dashboard["profile-membership-replica-lcp"]
    ) {
        if (process.env.DEMO_STATUS == "yes") {
            var leadLink = `${process.env.REPLICA_URL}/lcp/${user}/${admin}`;
        } else {
            var leadLink = `${process.env.SITE_URL}/lcp/${user}/${admin}`;
        }
        var leadCapture = [
            {
                icon: "fa fa-files-o",
                link: leadLink,
            },
            {
                icon: "fa fa-facebook",
                link: `https://www.facebook.com/sharer/sharer.php?u=${leadLink}`,
            },
            {
                icon: "fa fa-twitter",
                link: `https://twitter.com/share?url=${leadLink}`,
            },
            {
                icon: "fa fa-linkedin",
                link: `http://www.linkedin.com/shareArticle?url=${leadLink}`,
            },
        ];
        datas["profile"] = profile;
    }
    if (dashboard["profile-membership-replica-lcp"]) {
        var profile = {
            full_name: `${userDetails.details.name} ${userDetails.details.second_name}`,
            user_name: `${userDetails.username}`,
            user_photo: profilePic,
            placement: `${placementDetails.U2.username}`,
            membership_package: package,
            rank: rank,
            replica_title: "Replica Link",
            replica: replica,
            lead_capture_title: "Lead Capture",
            lead_capture: leadCapture,
        };
        datas["profile"] = profile;
    }
    let sponsorDetails = {
        head: sponsor,
        text: "sponsorName",
        title: "sponsor_name",
    };
    datas["sponser_details"] = [sponsorDetails];
    var extraData = [];
    if (dashboard["sponsor-pv-carry"]) {
        var extra1 = [
            {
                head: userDetails.personal_pv,
                text: "personalPv",
                title: "Personal PV",
            },
            {
                head: userDetails.group_pv,
                text: "groupPV",
                title: "Group PV",
            },
        ];
        extraData.push(...extra1);
        datas["extra_data"] = extraData;
    }
    if (moduleStatus.mlm_plan == "Binary") {
        var extra2 = [
            {
                head: userDetails.total_left_carry,
                text: "leftCarry",
                title: "Left Carry",
            },
            {
                head: userDetails.total_right_carry,
                text: "rightCarry",
                title: "Right Carry",
            },
        ];
        extraData.push(...extra2);
        datas["extra_data"] = extraData;
    }
    // if (dashboard["new-members"]) {
    //   const lastestJoinee = await HomeService.getLatestJoinees(user_id, prefix);
    //   var joineeArr = [];
    //   lastestJoinee.map((value, key) => {
    //     value.details.image = value.details.image;
    //     joineeArr[key] = {
    //       id: value.id,
    //       user_name: value.username,
    //       active: value.active,
    //       date_of_joining: moment(value.date_of_joining).format("MMMM Do YYYY"),
    //       user_full_name: `${value.details.name} ${value.details.second_name}`,
    //       product_amount: value.userRegistration.product_amount,
    //       profile_pic: value.details.image,
    //     };
    //     datas["new_members"] = joineeArr;
    //   });
    // }
    // if (dashboard["rank"] && moduleStatus.rank_status) {
    //   // current rank
    //   let crank = await HomeService.currentRankName(user_id, prefix);
    //   let nrank = "";
    //   if (crank != "") {
    //     var currentRank = await HomeService.getCurrentRankData(user_id, prefix);
    //     nrank = await HomeService.getNextRankName(crank.id, prefix);
    //     datas["rank"] = {
    //       current: {
    //         criteria: currentRank,
    //         name: crank.name,
    //       },
    //     };
    //   } else {
    //     nrank = await HomeService.getNextRankName("", prefix);
    //   }
    //   let nextRank;
    //   if (nrank != "" || nrank != false) {
    //     nextRank = await HomeService.getNextRankData(nrank?.id, user_id, prefix);
    //     datas["rank"] = {
    //       ...datas.rank,
    //       next: {
    //         criteria: nextRank,
    //         name: nrank.name,
    //       },
    //     };
    //   }
    // }

    // if (dashboard["earnings-expenses"]) {
    //   if (dashboard["earnings"]) {
    //     const earning = await HomeService.getAllIncomeOrExpense(
    //       user_id,
    //       "credit",
    //       prefix
    //     );
    //     var income = [];
    //     earning.map((value, key) => {
    //       var type = value.amount_type;
    //       if (type == "rank_bonus") {
    //         type = "rankcommission";
    //       } else if (type == "level_commission") {
    //         type = "levelCommission";
    //       } else if (type == "leg") {
    //         type = "binaryCommission";
    //       } else if (type == "referral") {
    //         type = "referralCommission";
    //       }
    //       income[key] = {
    //         amount: value?.amount,
    //         amount_type: value?.amount_type,
    //         user_id: value?.user_id,
    //         title: type,
    //       };
    //     });
    //     datas["earnings_nd_expenses"] = {
    //       ...datas["earnings_nd_expenses"],
    //       incomes: income ? income : [],
    //     };
    //   }
    //   if (dashboard["expenses"]) {
    //     var expenseArr = [];
    //     const expenses = await HomeService.getAllIncomeOrExpense(
    //       user_id,
    //       "debit",
    //       prefix
    //     );
    //     expenses.map((value, key) => {
    //       expenseArr[key] = {
    //         amount: value?.amount,
    //         amount_type: value?.amount_type,
    //         user_id: value?.user_id,
    //       };
    //     });
    //     datas["earnings_nd_expenses"] = {
    //       ...datas["earnings_nd_expenses"],
    //       expenses: expenseArr ? expenseArr : [],
    //     };
    //   }
    //   if (dashboard["payout-status"]) {
    //     var payoutStatus = {
    //       requested: await HomeService.getRequestPendingAmount(user_id, prefix),
    //       approved: await HomeService.getUserTotalPayouts(
    //         user_id,
    //         "approved",
    //         prefix
    //       ),
    //       paid: await HomeService.getUserTotalPayouts(user_id, "paid", prefix),
    //       rejected: await HomeService.getUserTotalPayouts(
    //         user_id,
    //         "rejected",
    //         prefix
    //       ),
    //     };
    //     datas["earnings_nd_expenses"] = {
    //       ...datas["earnings_nd_expenses"],
    //       payout_statuses: payoutStatus ? payoutStatus : [],
    //     };
    //   }
    // }
    // if (dashboard["team-perfomance"]) {
    //   if (dashboard["top-earners"]) {
    //     var topEarners = await HomeService.getTopEarners(user_id, prefix);
    //     topEarners.map((value, key) => {
    //       value.profile_picture = value.profile_picture;
    //     });
    //     datas["team_perfomance"] = {
    //       ...datas["team_perfomance"],
    //       top_earners: topEarners ? topEarners : [],
    //     };
    //   }
    //   if (dashboard["top-recruiters"]) {
    //     var topRecruites = await HomeService.getTopRecruters(user_id, prefix);
    //     topRecruites.map((value, key) => {
    //       value.profile_picture = value.profile_picture;
    //     });
    //     datas["team_perfomance"] = {
    //       ...datas["team_perfomance"],
    //       top_recruiters: topRecruites ? topRecruites : [],
    //     };
    //   }
    //   if (moduleStatus.rank_status) {
    //     if (dashboard["rank-overview"]) {
    //       var rankData = await HomeService.getRankData(user_id, prefix);
    //       datas["team_perfomance"] = {
    //         ...datas["team_perfomance"],
    //         rank_overview: rankData,
    //       };
    //     }
    //   }
    //   if (moduleStatus.product_status) {
    //     if (dashboard["package-overview"]) {
    //       var packageData = await HomeService.getPackageProgressData(
    //         user_id,
    //         prefix
    //       );
    //       datas["team_perfomance"] = {
    //         ...datas["team_perfomance"],
    //         package_overview: packageData,
    //       };
    //     }
    //   }
    // }
    // if (dashboard["joinings-graph"]) {
    //   let chartsData = [];
    //   let chartMode = "month";
    //   let graphData = await HomeService.getJoiningLineChartData(
    //     user_id,
    //     chartMode,
    //     moduleStatus,
    //     prefix
    //   );
    //   if (moduleStatus.mlm_plan == "Binary") {
    //     Object.entries(graphData.labels).map(([key, value]) => {
    //       chartsData[key] = [
    //         value,
    //         graphData["leftArr"][key],
    //         graphData["rightArr"][key],
    //       ];
    //     });
    //     var joiningGraphData = {
    //       chart: chartsData,
    //       label: ["left_join", "right_join"],
    //       code: ["leftJoinings", "rightJoinings"],
    //       color: ["#7265ba", "#189ec8"],
    //       background: ["rgba(149, 139, 204,0.3)", "rgba(71, 172, 222,0.3)"],
    //     };
    //   } else {
    //     Object.entries(graphData.labels).map(([key, value]) => {
    //       chartsData[key] = [value, graphData["joinArray"][key]];
    //     });
    //     var joiningGraphData = {
    //       chart: chartsData,
    //       label: ["joinings"],
    //       code: ["joinings"],
    //       color: ["#7265ba"],
    //       background: ["rgba(149, 139, 204,0.3)"],
    //     };
    //   }
    //   datas["joining_graph_data_new"] = joiningGraphData;
    // }
    let packageNotification = await common.getMaxCommissionAlert(
        user_id,
        prefix
    );
    let commissionAlert = [];
    commissionAlert.push({
        status: packageNotification.percentage >= 90 ? true : false,
        percentage: packageNotification.percentage,
        maxLimit: packageNotification.Limit,
        totalCommissionEarned: packageNotification.totalCommissionEarned,
    });
    datas["commission_alert"] = commissionAlert;

    let response = await successMessage({ value: datas });
    return res.json(response);
};

exports.getDashboardSection2 = async (req, res) => {
    try {
        var datas = {};
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const moduleStatus = await Status.findOne({ prefix });
        const user_id = req.user.id;
        const dashboardItems = await userDashItems.findAll({ prefix });
        let dashboard = dashboardItems.reduce(
            (obj, item) => ({
                ...obj,
                [item.slug]: item.status,
            }),
            {}
        );

        // New members section
        if (dashboard["new-members"]) {
            const lastestJoinee = await HomeService.getLatestJoinees(
                user_id,
                prefix
            );
            var joineeArr = [];
            lastestJoinee.map((value, key) => {
                value.details.image = value.details.image;
                joineeArr[key] = {
                    id: value.id,
                    user_name: value.username,
                    active: value.active,
                    date_of_joining: moment(value.date_of_joining).format(
                        "MMMM Do YYYY"
                    ),
                    user_full_name: `${value.details.name} ${value.details.second_name}`,
                    product_amount: value?.userRegistration?.product_amount
                        ? value?.userRegistration?.product_amount
                        : 0,
                    profile_pic: value.details.image,
                };
            });
            datas["new_members"] = joineeArr;
        }
        // Rank section
        if (dashboard["rank"] && moduleStatus.rank_status) {
            let crank = await HomeService.currentRankName(user_id, prefix);
            let nrank = "";
            if (crank != "") {
                var currentRank = await HomeService.getCurrentRankData(
                    user_id,
                    prefix
                );
                nrank = await HomeService.getNextRankName(crank.id, prefix);
                datas["rank"] = {
                    current: {
                        criteria: currentRank,
                        name: crank.name,
                    },
                };
            } else {
                nrank = await HomeService.getNextRankName("", prefix);
            }
            let nextRank;
            if (nrank != "" || nrank != false) {
                nextRank = await HomeService.getNextRankData(
                    nrank?.id,
                    user_id,
                    prefix
                );
                datas["rank"] = {
                    ...datas.rank,
                    next: {
                        criteria: nextRank,
                        name: nrank.name,
                    },
                };
            }
        }
        // Joining chart
        if (dashboard["joinings-graph"]) {
            let chartsData = [];
            let chartMode = "month";
            let graphData = await HomeService.getJoiningLineChartData(
                user_id,
                chartMode,
                moduleStatus,
                prefix
            );
            if (moduleStatus.mlm_plan == "Binary") {
                Object.entries(graphData.labels).map(([key, value]) => {
                    chartsData[key] = [
                        value,
                        graphData["leftArr"][key],
                        graphData["rightArr"][key],
                    ];
                });
                var joiningGraphData = {
                    chart: chartsData,
                    label: ["left_join", "right_join"],
                    code: ["leftJoinings", "rightJoinings"],
                    color: ["#7265ba", "#189ec8"],
                    background: [
                        "rgba(149, 139, 204,0.3)",
                        "rgba(71, 172, 222,0.3)",
                    ],
                };
            } else {
                Object.entries(graphData.labels).map(([key, value]) => {
                    chartsData[key] = [value, graphData["joinArray"][key]];
                });
                var joiningGraphData = {
                    chart: chartsData,
                    label: ["joinings"],
                    code: ["joinings"],
                    color: ["#7265ba"],
                    background: ["rgba(149, 139, 204,0.3)"],
                };
            }
            datas["joining_graph_data_new"] = joiningGraphData;
        }

        let response = await successMessage({ value: datas });
        return res.json(response);
    } catch (error) {
        return res.json(error.message);
    }
};

exports.getDashboardSection3 = async (req, res) => {
    try {
        var datas = {};
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const user_id = req.user.id;
        const moduleStatus = await Status.findOne({ prefix });
        const dashboardItems = await userDashItems.findAll({ prefix });
        let dashboard = dashboardItems.reduce(
            (obj, item) => ({
                ...obj,
                [item.slug]: item.status,
            }),
            {}
        );

        // Earnings and Expenses
        if (dashboard["earnings-expenses"]) {
            if (dashboard["earnings"]) {
                const earning = await HomeService.getAllIncomeOrExpense(
                    user_id,
                    "credit",
                    prefix
                );
                var income = [];
                earning.map((value, key) => {
                    var type = value.amount_type;
                    if (type == "rank_bonus") {
                        type = "rankcommission";
                    } else if (type == "level_commission") {
                        type = "levelCommission";
                    } else if (type == "leg") {
                        type = "binaryCommission";
                    } else if (type == "referral") {
                        type = "referralCommission";
                    }
                    income[key] = {
                        amount: value?.amount,
                        amount_type: value?.amount_type,
                        user_id: value?.user_id,
                        title: type,
                    };
                });
                datas["earnings_nd_expenses"] = {
                    ...datas["earnings_nd_expenses"],
                    incomes: income ? income : [],
                };
            }
            if (dashboard["expenses"]) {
                var expenseArr = [];
                const expenses = await HomeService.getAllIncomeOrExpense(
                    user_id,
                    "debit",
                    prefix
                );
                expenses.map((value, key) => {
                    expenseArr[key] = {
                        amount: value?.amount,
                        amount_type: value?.amount_type,
                        user_id: value?.user_id,
                    };
                });
                datas["earnings_nd_expenses"] = {
                    ...datas["earnings_nd_expenses"],
                    expenses: expenseArr ? expenseArr : [],
                };
            }
            if (dashboard["payout-status"]) {
                var payoutStatus = {
                    requested: await HomeService.getRequestPendingAmount(
                        user_id,
                        prefix
                    ),
                    approved: await HomeService.getUserTotalPayouts(
                        user_id,
                        "approved",
                        prefix
                    ),
                    paid: await HomeService.getUserTotalPayouts(
                        user_id,
                        "paid",
                        prefix
                    ),
                    rejected: await HomeService.getUserTotalPayouts(
                        user_id,
                        "rejected",
                        prefix
                    ),
                };
                datas["earnings_nd_expenses"] = {
                    ...datas["earnings_nd_expenses"],
                    payout_statuses: payoutStatus ? payoutStatus : [],
                };
            }
        }
        // Team performance
        if (dashboard["team-performance"]) {
            if (dashboard["top-earners"]) {
                var topEarners = await HomeService.getTopEarners(
                    user_id,
                    prefix
                );
                topEarners.map((value, key) => {
                    value.profile_picture = value.profile_picture;
                });
                datas["team_perfomance"] = {
                    ...datas["team_perfomance"],
                    top_earners: topEarners ? topEarners : [],
                };
            }
            if (dashboard["top-recruiters"]) {
                var topRecruites = await HomeService.getTopRecruters(
                    user_id,
                    prefix
                );
                topRecruites.map((value, key) => {
                    value.profile_picture = value.profile_picture;
                });
                datas["team_perfomance"] = {
                    ...datas["team_perfomance"],
                    top_recruiters: topRecruites ? topRecruites : [],
                };
            }
            if (moduleStatus.rank_status) {
                if (dashboard["rank-overview"]) {
                    var rankData = await HomeService.getRankData(
                        user_id,
                        prefix
                    );
                    datas["team_perfomance"] = {
                        ...datas["team_perfomance"],
                        rank_overview: rankData,
                    };
                }
            }
            if (moduleStatus.product_status) {
                if (dashboard["package-overview"]) {
                    var packageData = await HomeService.getPackageProgressData(
                        user_id,
                        prefix
                    );
                    datas["team_perfomance"] = {
                        ...datas["team_perfomance"],
                        package_overview: packageData,
                    };
                }
            }
        }

        let response = await successMessage({ value: datas });
        return res.json(response);
    } catch (error) {
        return res.json(error.message);
    }
};

exports.getTileFilter = async (req, res) => {
    const user_id = req.user.id;
    let { range, type } = req.query;
    let fromDate, toDate;
    var date = new Date();
    let tilesArr = {};
    const prefix = req.headers["api-key"];
    if (!prefix) {
        let response = await errorMessage({ code: 1001 });
        return res.json(response);
    }
    switch (range) {
        case "thisMonth":
            fromDate = new Date(date.getFullYear(), date.getMonth(), 1);
            toDate = new Date(
                date.getFullYear(),
                date.getMonth() + 1,
                0
            ).setHours(23, 59, 59);
            break;
        case "thisYear":
            fromDate = new Date(date.getFullYear(), 0, 1);
            toDate = new Date(date.getFullYear(), 11, 31).setHours(23, 59, 59);
            break;
        case "thisWeek": // current date of week
            var currentWeekDay = date.getDay();
            var lessDays = currentWeekDay == 0 ? 6 : currentWeekDay - 1;
            fromDate = new Date(
                new Date(date).setDate(date.getDate() - lessDays)
            );
            toDate = new Date(
                new Date(fromDate).setDate(fromDate.getDate() + 6)
            ).setHours(23, 59, 59);
            break;
        default:
            fromDate = "";
            toDate = "";
            break;
    }
    if (type == "commision") {
        var commission = await HomeService.getCommissionDetails(
            user_id,
            fromDate,
            toDate,
            prefix
        );
        if (commission == null) {
            commission = 0;
        }
        tiles = {
            amount: commission,
            withcurrency: `${dc.defaultCurrencySymbol}${commission}`,
            text: "commision",
            title: "Commission Earned",
            to: "/ewallet",
            filter: true,
        };
        tilesArr = tiles;
    }
    if (type == "payoutRelease") {
        var payoutReleased = await HomeService.getPayoutDetails(
            user_id,
            fromDate,
            toDate,
            prefix
        );
        if (payoutReleased == null) {
            payoutReleased = 0;
        }
        tiles = {
            amount: payoutReleased,
            withcurrency: `${dc.defaultCurrencySymbol}${payoutReleased}`,
            text: "payoutRelease",
            title: "Payout Released",
            to: "/payout",
            filter: true,
        };
        tilesArr = tiles;
    }
    let response = await successMessage({ value: tilesArr });

    return res.json(response);
};

exports.getGraphFilter = async (req, res) => {
    let datas = {};
    let chartsData = [];
    let { range } = req.query;
    const user_id = req.user.id;
    const prefix = req.headers["api-key"];
    if (!prefix) {
        let response = await errorMessage({ code: 1001 });
        return res.json(response);
    }
    let moduleStatus = await modStatus.getModuleStatus(prefix);
    let graphData = await HomeService.getJoiningLineChartData(
        user_id,
        range,
        moduleStatus,
        prefix
    );
    if (moduleStatus.mlm_plan == "Binary") {
        Object.entries(graphData.labels).map(([key, value]) => {
            chartsData[key] = [
                value,
                graphData["leftArr"][key],
                graphData["rightArr"][key],
            ];
        });
        var joiningGraphData = {
            chart: chartsData,
            label: ["left_join", "right_join"],
            code: ["leftJoinings", "rightJoinings"],
            color: ["#7265ba", "#189ec8"],
            background: ["rgba(149, 139, 204,0.3)", "rgba(71, 172, 222,0.3)"],
        };
    } else {
        Object.entries(graphData.labels).map(([key, value]) => {
            chartsData[key] = [value, graphData["joinArray"][key]];
        });
        var joiningGraphData = {
            chart: chartsData,
            label: ["joinings"],
            code: ["joinings"],
            color: ["#7265ba"],
            background: ["rgba(149, 139, 204,0.3)"],
        };
    }

    datas["joining_graph_data_new"] = joiningGraphData;
    let response = await successMessage({ value: datas });
    return res.json(response);
};

exports.getNotifications = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id, username } = req.user;
        let mail_data = await MailServices.getUnreadMessages(id, prefix);
        let mail_count = mail_data.length;
        let mail_details = { mail_data, mail_count },
            payOutCount = 0,
            pinCount = 0;
        const ModuleStatus = await Status.findOne({ prefix });
        let date = new Date();
        date.setDate(date.getDate() - 2);
        if (
            ModuleStatus.payout_release_status == "both" ||
            ModuleStatus.payout_release_status == "ewallet_request"
        ) {
            payOutCount = await EWalletServices.userPayoutRequestCount(
                id,
                1,
                date,
                1,
                prefix
            );
        }
        if (ModuleStatus.pin_status) {
            pinCount = await PurchaseServices.getUserPinRequestCount(
                id,
                0,
                1,
                prefix
            );
        }
        let documentCount = await common.getUnreadDocumentsCount(id, prefix);
        let newsCount = 0;
        let totalNotificationCount =
            payOutCount + pinCount + documentCount + newsCount;
        // console.log(req.user);
        let packageNotification = await common.getMaxCommissionAlert(
            id,
            prefix
        );
        let alertMail;
        if (packageNotification.percentage >= 90) {
            alertMail = await MailServices.getCommissionAlert(id, prefix);
            if (alertMail == null) {
                const adminId = await common.getAdminId(prefix);
                let reqBody = {
                    user: username,
                    subject: "Max commission alert",
                    message: `${packageNotification.percentage} of your max commission is earned.`,
                };
                const mailedAlert = await MailServices.sendMailToIndividual(
                    adminId,
                    reqBody,
                    prefix
                );
            }
        } else {
            const mailDetails = await Mailbox.findOne({
                where: {
                    to_user_id: id,
                    subject: "Max commission alert",
                },
                prefix,
            });
            if (mailDetails != null) {
                const mailupdateFlag = await mailDetails.update({
                    subject: "",
                });
            }
        }

        return res.json({
            status: true,
            data: {
                mail_details,
                notification_details: {
                    payout_count: payOutCount,
                    pin_count: pinCount,
                    document_count: documentCount,
                    news_count: newsCount,
                    notification_count: totalNotificationCount,
                    commission_count:
                        packageNotification.percentage >= 90 ? 1 : 0,
                },
                commission_limit_notification: {
                    status: packageNotification.percentage >= 90 ? true : false,
                    content: packageNotification,
                },
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message);
    }
};

exports.setDefaultCurrency = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id } = req.user;
        const userDetails = await User.findOne({
            where: {
                id,
            },
            prefix,
        });

        const { currency } = req.body;
        await userDetails.update({ default_currency: currency }, {}, prefix);
        return res.json({ status: true, data: "" });
    } catch (error) {
        return res.status(500).json(error.message);
    }
};

exports.setDefaultLanguage = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id } = req.user;
        const userDetails = await User.findOne({
            where: {
                id,
            },
            prefix,
        });

        const { lang_id } = req.body;
        await userDetails.update({ default_lang: lang_id }, {}, prefix);
        return res.json({
            status: true,
            data: { response: "Default Language updated" },
        });
    } catch (error) {
        return res.status(500).json(error.message);
    }
};

exports.goToStore = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        const token = req.headers["access-token"];
        const { title } = req.query;
        if (!prefix || !token) {
            let response = await errorMessage({ code: 401 });
            return res.json(response);
        }
        const ModuleStatus = await modStatus.getModuleStatus(prefix);
        if (!ModuleStatus.ecom_status) {
            return res.status(401).json({ status: false });
        }
        const { id } = req.user;
        const url = await common.createEcomLink(id, title, prefix);
        if (url == "") {
            return res.status(401).json({ status: false });
        }
        return res.json({
            status: true,
            data: {
                url,
            },
        });
    } catch (error) {
        console.log(error);
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
                    user_id: stringExistOrNot.user_id,
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

exports.checkDemo = async (req, res) => {
    try {
        if (process.env.DEMO_STATUS == "yes") {
            return res.json({ status: true, data: { is_preset_demo: true } });
        } else {
            return res.json({ status: true, data: { is_preset_demo: false } });
        }
    } catch (error) {
        return res.json({ status: true, data: { is_preset_demo: false } });
    }
};

exports.getLiveValueUpdate = async (req, res) => {
    try {
        let count = 4;
        let liveValue = await liveValueUpdates();
        // console.log(liveValue.data, "************************************");
        let data1 = [];
        for (let element of liveValue.data) {
            let result = {
                log: element.png64,
                name: element.name,
                price: element.rate,
                marketCap: element.volume,
                volume: element.cap,
                webSite: element.links.website,
                allTimeHighUSD: element.allTimeHighUSD,
            };
            data1.push(result);
        }
        // let data = [
        //   {
        //     logo: `${process.env.image_url}liveCoin/coin_1.png`,
        //     name: "BTC",
        //     price: "$15926",
        //     marketCap: "$306.91Bn",
        //     volume: "$32.91Bn",
        //     change: "5.09%",
        //     signOfChange: "negative",
        //   },
        //   {
        //     logo: `${process.env.image_url}liveCoin/coin_2.png`,
        //     name: "ETH",
        //     price: "$1182",
        //     marketCap: "$145.91Bn",
        //     volume: "$12.91Bn",
        //     change: "4.95%",
        //     signOfChange: "negative",
        //   },
        //   {
        //     logo: `${process.env.image_url}liveCoin/coin_3.png`,
        //     name: "USDT",
        //     price: "$0.009995654",
        //     marketCap: "$78.91Bn",
        //     volume: "$62.91Bn",
        //     change: "0.00%",
        //     signOfChange: "negative",
        //   },
        //   {
        //     logo: `${process.env.image_url}liveCoin/coin_4.png`,
        //     name: "BNB",
        //     price: "$270",
        //     marketCap: "$43.91Bn",
        //     volume: "$1.251Bn",
        //     change: "4.95%",
        //     signOfChange: "positive",
        //   },
        // ];
        return res.json(
            await successMessage({ value: { count: 10, data: data1 } })
        );
    } catch (error) {
        console.log(error);
        return res.json({ status: false, message: error.message });
    }
};
