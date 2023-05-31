const db = require("../../models");
const moment = require("moment");
const HomeService = require("../../utils/app/homeService");
const dc = require("../../utils/app/constants");
const common = require("../../utils/app/common");
const Status = db.moduleStatus;
const { encrypt, decrypt } = require("../../middleware/app/encryption");
const User = db.user;
const pack = db.pack;
const userDashItems = db.userDashboardItems;
const UserDetails = db.userDetails;
const rankDetails = db.rankDetails;
const { Op } = require("sequelize");
const { successMessage, errorMessage } = require("../../utils/app/response");
const CommonServices = require("../../utils/app/common");
const Curr = require("../../utils/app/allCurrency");
const Language = require("../../utils/app/allLanguages");
const States = require("../../utils/app/allStates");
const modStatus = require("../../utils/app/moduleStatus");
const signupFields = db.signupField;
const signUpSettings = db.signupSettings;
var _ = require("lodash");
const packages = db.pack;
const signField = db.signupField;
const Country = require("../../utils/app/allCountries");
const userConfig = db.usernameConfig;
const passPolicy = require("../../utils/app/passwordPolicy");
const termsAndCondition = require("../../utils/app/termsAndCondition");
const Config = db.configuration;
const paymentConfig = db.paymentConfig;
const Menus = db.menus;
const MenuPermissions = db.menuPermissions;
//new
const rankConfig = db.rankConfig;
const Rank = db.ranks;
const { join } = require("path");

exports.getDashboard = async (req, res) => {
  //1
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
      toDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).setHours(
        23,
        59,
        59
      );
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
  console.log(`userDetails ===== `, JSON.stringify(userDetails));
  const oldImageUrl = join(
    __dirname,
    "../uploads/images/profilePic/",
    userDetails.details.image == null ? "" : userDetails.details.image
  );
  if (userDetails.details.image == null) {
    var profilePic = "";
  } else {
    var profilePic = await common.convertToIpUrl( userDetails.details.image);
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
      var membership = await common.getProductNameFromUserID(user_id, prefix);
    } else {
      var membership = userDetails.package.name;
    }
    var package = {
      title: "Current Package",
      name: membership,
    };
    //==============================  extra data  ============================
    const { id } = req.user;
    var package = {
      title: "Membership Package",
      name: membership,
    };
    if (
      moduleStatus.subscription_status ||
      moduleStatus.subscription_status_demo
    ) {
      let expiryvdate = await CommonServices.getProductValidityDate(id, prefix);
      let expiryStatus = true;
      if (expiryvdate >= new Date().toLocaleDateString()) {
        expiryStatus = false;
      }

      package["renew"] = {
        renewal_link: "",
        title: "renew",
        date: expiryvdate,
        status: expiryStatus,
      };
      if (moduleStatus.ecom_status || moduleStatus.ecom_status_demo) {
        let renewalLink = await CommonServices.createEcomLink(
          id,
          "renew",
          prefix
        );
        package["renew"] = {
          ...package["renew"],
          renewal_link: renewalLink,
        };
      }
    }
    //=================================  extra data end   ==================================
    const upgradeStatus = await CommonServices.isEligibleUpgrade(id, prefix);
    package["is_eligible"] = upgradeStatus;
    console.log(`upgradeStatus ------ `, upgradeStatus);
    if (moduleStatus.package_upgrade && upgradeStatus) {
      console.log(`inside uopgrade 333333 link ========`);
      if (!moduleStatus.ecom_status) {
        let currentPackageDetails =
          await CommonServices.getMembershipPackageDetails(id, prefix);
        var upgradablePackList = [];
        if (currentPackageDetails) {
          upgradablePackList = await CommonServices.getUpgradablePackageList(
            currentPackageDetails,
            prefix
          );
        }
        console.log(
          `upgradablePackList && upgradablePackList.length dash`,
          upgradablePackList,
          upgradablePackList.length
        );

        if (upgradablePackList && upgradablePackList.length > 0) {
          package["upgrade_link"] = "toPage";
        }
      } else {
        if (moduleStatus.product_status) {
          package["upgrade_link"] = await CommonServices.createEcomLink(
            id,
            "upgrade",
            prefix
          );
        }
      }
    }
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
    var replica = {
      title: "Replica-link",
      copy_link: {
        icon: "fa fa-files-o",
        link: replicaLink,
      },
      shared_link: [
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
      ],
    };
    // datas["profile"] = {
    //   lead_capture: leadCapture,
    // };
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
    var leadCapture = {
      title: "Lead Capture",
      copy_link: {
        icon: "fa fa-files-o",
        link: leadLink,
      },
      shared_link: [
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
      ],
    };
    datas["profile"] = {
      lead_capture: leadCapture,
    };
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
      lead_capture: leadCapture
        ? leadCapture
        : {
            title: "Lead Capture",
            copy_link: {
              icon: "fa fa-files-o",
              link: "",
            },
            shared_link: [],
          },
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
    var extra1 = {
      sponsor: {
        head: sponsor,
        text: "sponsorName",
        title: "sponsor_name",
      },
      pv: {
        personal: {
          head: userDetails.personal_pv,
          title: "Personal PV",
        },
        group: {
          head: userDetails.group_pv,
          title: "Group PV",
        },
      },
    };
    extraData = extra1;
    datas["extra_data"] = extraData;
  }
  if (moduleStatus.mlm_plan == "Binary") {
    var extra2 = {
      carry: {
        leftCarry: {
          head: userDetails.total_left_carry,
          text: "leftCarry",
          title: "Left carry",
        },
        rightCarry: {
          head: userDetails.total_right_carry,
          text: "rightCarry",
          title: "Right carry",
        },
      },
    };
    extraData = { ...extraData, ...extra2 };
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
  let packageNotification = await common.getMaxCommissionAlert(user_id, prefix);
  let commissionAlert = {};
  commissionAlert = {
    status: packageNotification.percentage >= 90 ? true : false,
    percentage: packageNotification.percentage,
    maxLimit: packageNotification.Limit,
    totalCommissionEarned: packageNotification.totalCommissionEarned,
  };
  datas["commission_alert"] = commissionAlert;

  // let response = await successMessage({ value: datas });
  // return res.json(response);

  //2
  //   var datas = {};
  //   const prefix = req.headers["api-key"];
  //   if (!prefix) {
  //     let response = await errorMessage({ code: 1001 });
  //     return res.json(response);
  //   }
  //   const moduleStatus = await Status.findOne({ prefix });
  //   const user_id = req.user.id;
  //   const dashboardItems = await userDashItems.findAll({ prefix });
  //   let dashboard = dashboardItems.reduce(
  //     (obj, item) => ({
  //       ...obj,
  //       [item.slug]: item.status,
  //     }),
  //     {}
  //   );

  // New members section
  if (dashboard["new-members"]) {
    const currencyId = await common.getUserCurrencyId(user_id, prefix);
    const lastestJoinee = await HomeService.getLatestJoinees(user_id, prefix);
    var joineeArr = [];
    lastestJoinee.map((value, key) => {
      value.details.image = value.details.image;
      joineeArr[key] = {
        id: value.id,
        user_name: value.username,
        active: value.active,
        date_of_joining: moment(value.date_of_joining).format("MMMM Do YYYY"),
        user_full_name: `${value.details.name} ${value.details.second_name}`,
        product_amount: value?.userRegistration?.product_amount
          ? value?.userRegistration?.product_amount
          : 0,
        profile_pic: value.details.image,
        product_amount_with_currency: `${currencyId}${value.userRegistration.product_amount}`,
      };
    });
    datas["new_members"] = joineeArr;
  }
  // Rank section
  if (dashboard["rank"] && moduleStatus.rank_status) {
    let crank = await HomeService.currentRankName(user_id, prefix);
    let nrank = "";
    if (crank != "") {
      var currentRank = await HomeService.getCurrentRankData(user_id, prefix);
      nrank = await HomeService.getNextRankName(crank.id, prefix);
      datas["rank"] = {
        current: {
          criteria: [
            {
              rank_name: currentRank?.referalCount?.rank_name
                ? currentRank.referalCount.rank_name
                : "",
              required: currentRank?.referalCount?.required
                ? currentRank.referalCount.required
                : "",
              achieved: currentRank?.referalCount?.achieved
                ? currentRank.referalCount.achieved
                : "",
              percentage: currentRank?.referalCount?.percentage
                ? currentRank.referalCount.percentage
                : "",
              text: currentRank?.referalCount?.text
                ? currentRank.referalCount.text
                : "",
              title: currentRank?.referalCount?.title
                ? currentRank.referalCount.title
                : "",
            },
          ],
          name: crank?.name ? crank?.name : "",
        },
      };
    } else {
      nrank = await HomeService.getNextRankName("", prefix);
    }
    let nextRank;
    if (nrank != "" || nrank != false) {
      nextRank = await HomeService.getNextRankData(nrank?.id, user_id, prefix);
      datas["rank"] = {
        ...datas.rank,
        next: {
          criteria: [
            {
              rank_name: nextRank?.referalCount?.rank_name
                ? nextRank?.referalCount?.rank_name
                : "",
              achieved: nextRank?.referalCount?.achieved
                ? nextRank.referalCount.achieved
                : "",
              required: nextRank?.referalCount?.required
                ? nextRank.referalCount.required
                : "",
              percentage: nextRank?.referalCount?.percentage
                ? nextRank.referalCount.percentage
                : "",
              text: nextRank?.referalCount?.text
                ? nextRank.referalCount.text
                : "",
              title: nextRank?.referalCount?.title
                ? nextRank.referalCount.title
                : "",
            },
          ],
          name: nrank?.name ? nrank.name : "",
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
  }
  //   let response = await successMessage({ value: datas });
  //   return res.json(response);

  //3
  //   var datas = {};
  //   const prefix = req.headers["api-key"];
  //   if (!prefix) {
  //     let response = await errorMessage({ code: 1001 });
  //     return res.json(response);
  //   }
  //   const user_id = req.user.id;
  //   const moduleStatus = await Status.findOne({ prefix });
  //   const dashboardItems = await userDashItems.findAll({ prefix });
  //   let dashboard = dashboardItems.reduce(
  //     (obj, item) => ({
  //       ...obj,
  //       [item.slug]: item.status,
  //     }),
  //     {}
  //   );

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
        requested: await HomeService.getRequestPendingAmount(user_id, prefix),
        approved: await HomeService.getUserTotalPayouts(
          user_id,
          "approved",
          prefix
        ),
        paid: await HomeService.getUserTotalPayouts(user_id, "paid", prefix),
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
      var topRecruites = await HomeService.getTopRecruters(user_id, prefix);
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
  let response = await successMessage({ value: datas });
  return res.json(response);
};

exports.getNetwork = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    let menuList = [];
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
        title: "Networks",
      },
      order: [["order"], [{ model: Menus, as: "submenu" }, "child_order"]],
      prefix,
    });
    console.log(
      `************************************ menu ***********************************`
    );
    for await (let [key, value] of Object.entries(menu)) {
      let subMenuList = [];
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
                to: `mobileGenealogy`,
              };
              break;
            case "Sponsor Tree":
              subMenuList[i] = {
                id: submenu.id,
                title: "sponsorTree",
                icon: null,
                to: `mobileSponser`,
              };
              break;
            case "Tree View":
              subMenuList[i] = {
                id: submenu.id,
                title: "treeView",
                icon: null,
                to: `mobileTreeView`,
              };
              break;
            case "Downline Members":
              subMenuList[i] = {
                id: submenu.id,
                title: "downlineMembers",
                icon: null,
                to: `downlineMembers`,
              };
              break;
            case "Referral Members":
              subMenuList[i] = {
                id: submenu.id,
                title: "referralMembers",
                icon: null,
                to: `referralMembers`,
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
        };
      }
    }

    menuList = menuList.filter((el) => {
      return el.title == "network";
    });
    // const data = {
    //   menu_list: menuList.filter((el) => {
    //     return el !== null && typeof el !== "undefined";
    //   }),
    // };
    const data = {
      menu_list: {
        ["title"]: "Network",
        ["submenu"]: menuList[0].subMenuList,
      },
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

//test
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
      userMemberShipDetails = await CommonServices.getProductNameFromUserID(
        id,
        prefix
      );
    }

    //TODO product validity
    var memberShipPackageDetails = {
      title: "Membership Package : ",
      name: userMemberShipDetails,
    };
    if (moduleStatus.subscription_status) {
      let expiryvdate = await CommonServices.getProductValidityDate(id, prefix);
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
    const upgradeStatus = await CommonServices.isEligibleUpgrade(id, prefix);

    console.log(`upgradeStatus ------ `, upgradeStatus);
    if (moduleStatus.package_upgrade && upgradeStatus) {
      console.log(`inside uopgrade link ========`);
      if (!moduleStatus.ecom_status) {
        let currentPackageDetails =
          await CommonServices.getMembershipPackageDetails(id, prefix);
        var upgradablePackList = [];
        if (currentPackageDetails) {
          upgradablePackList = await CommonServices.getUpgradablePackageList(
            currentPackageDetails,
            prefix
          );
        }
        console.log(
          `upgradablePackList && upgradablePackList.length view`,
          upgradablePackList,
          upgradablePackList.length
        );
        if (upgradablePackList && upgradablePackList.length > 0) {
          memberShipPackageDetails["upgrade_link"] = "";
        }
      } else {
        if (moduleStatus.product_status) {
          memberShipPackageDetails["upgrade_link"] =
            await CommonServices.createEcomLink(id, "upgrade", prefix);
        }
      }
    }
    // const isSubaccount = await CommonServices.isSubAccount(id, prefix);
    // var createSubAccountStatus = !isSubaccount;
    const createSubAccountStatus = !(await CommonServices.isSubAccount(
      id,
      prefix
    ));
    console.log(`userDetails ====== `, JSON.stringify(userDetails));

    console.log(
      `userDetails.details.image ====== `,
      JSON.stringify(userDetails.details.image)
    );
    if (
      userDetails.details.image == undefined ||
      userDetails.details.image == "NULL"
    ) {
      appImgUrl = "";
    } else {
      console.log(
        `profile -appImgurl------------------------------------------------`
      );
      appImgUrl = await CommonServices.convertToIpUrl(
        userDetails.details.image
      );
    }
    var profile = {
      full_name: `${userDetails.details.name} ${userDetails.details.second_name}`,
      user_name: `${userDetails.username}`,
      user_photo: appImgUrl,
      email: `${userDetails.details.email}`
        ? `${userDetails.details.email}`
        : `NULL`,
      password_policy: passwordPolicy,
      membership_package: memberShipPackageDetails,
      createSubAccount: createSubAccountStatus,
    };

    if (moduleStatus.kyc_status) {
      profile = { ...profile, kyc_status: userDetails.details.kyc_status };
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

    const placement = {
      sponsor: {
        title: "Sponsor",
        text: "sponsor",
        head: sponsorDetails?.name,
      },
      placement: {
        title: "Placement",
        text: "placement",
        head: fatherDetails?.name,
      },
      position: {
        head: userDetails.position === "L" ? "Left" : "Right",
        text: "position",
        title: "Position",
      },
    };
    const pv = {
      personal: {
        head: `${userDetails?.personal_pv}`,
        text: "personalPv",
        title: "Personal",
      },
      group: {
        head: `${userDetails?.group_pv}`,
        text: "groupPV",
        title: "Group",
      },
    };

    const carry = {
      leftCarry: {
        head: userDetails?.total_left_carry,
        text: "leftCarry",
        title: "Left carry",
      },
      rightCarry: {
        head: userDetails?.total_right_carry,
        text: "rightCarry",
        title: "Right carry",
      },
    };
    const extraData = {
      ...placement,
      pv: pv,
      carry: carry,
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
          value: userDetails.details.name ? userDetails.details.name : null,
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
          value: userDetails.details.gender ? userDetails.details.gender : null,
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
          value: userDetails.details.dob ? userDetails.details.dob : null,
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
          value: userDetails.details.city ? userDetails.details.city : null,
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
          value: userDetails.details.pin ? userDetails.details.pin : null,
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
          value: userDetails.details.email ? userDetails.details.email : null,
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
          value: userDetails.details.mobile ? userDetails.details.mobile : null,
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
        value: userDetails.details?.bank ? userDetails.details.bank : "",
        type: "text",
        required: false,
      },
      {
        title: "Branch_name",
        code: "branchName",
        value: userDetails.details?.branch ? userDetails.details.branch : "",
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
        value: userDetails.details?.ifsc ? userDetails.details.ifsc : "",
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
        case "Bitcoin":
          Config[key] = {
            title: "Blocktrail",
            code: "blocktrailAccount",
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
      code: "paymentMethod",
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
    // if (moduleStatus.mlm_plan == "Binary") {
    //   var Field4 = {
    //     title: "Binary Position Lock",
    //     code: "binaryLegSettings",
    //     value: userDetails.binary_leg,
    //     type: "select",
    //     required: true,
    //     options: [
    //       {
    //         title: "None",
    //         code: "none",
    //         value: "any",
    //       },
    //       {
    //         title: "Left Leg",
    //         code: "leftLeg",
    //         value: "left",
    //       },
    //       {
    //         title: "Right Leg",
    //         code: "rightLeg",
    //         value: "right",
    //       },
    //       {
    //         title: "Weak Leg",
    //         code: "weakLeg",
    //         value: "weak_leg",
    //       },
    //     ],
    //   };
    //   settingsFields.push(Field4);
    // }

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

    let editFields = [];
    editFields.push(
      personalDetails,
      contactDetails,
      bankDetails,
      paymentDetails
      // settingsDetailsFields
    );

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

exports.getMobRegister = async (req, res) => {
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
      paymentMethodStatus = true;
      let paymentDetails = await paymentConfig.findAll({
        attributes: ["name", "status"],
        where: {
          registration: 1,
        },
        prefix,
      });
      console.log(paymentDetails);
      //discuss
      paymentDetails = paymentDetails.filter((item) => {
        return item.name != "Free Joining";
      });
      // paymentDetails = paymentDetails.filter((item) => {
      //   return item.name != "Bank Transfer";
      // });
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
    let paymentInfo = {
      title: {
        code: "paymentType",
        title: "Payment Type",
      },
      fields: paymentField,
      registrationFee: registrationFee.reg_amount,
    };
    let list = [];
    list.push(sponsor, contactInfo, loginInfo, paymentInfo);
    let data = {
      list: list,
      // sponsor: sponsor,
      // contactInfo: contactInfo,
      // loginInformation: loginInfo,
      // paymentMethods: paymentInfo,
      PaymentMethodsStatus: paymentMethodStatus,
    };
    let response = await successMessage({
      value: data,
    });
    res.json(response);
  } catch (err) {
    return res.json(err.message);
  }
};
