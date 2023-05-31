const { Op, Sequelize, QueryTypes } = require("sequelize");
const { mlm_laravel } = require("../../models");
const db = require("../../models");
const User = db.user;
const Package = db.pack;
const Pins = db.pinNumbers;
const UsernameConfig = db.usernameConfig
const Config = db.configuration;
const legDetails = db.legDetails;
const UserPVDetails = db.userPvDetails
const StairStep = db.stairstep
const modStatus = require("./moduleStatus");
const TreeServices = require("./treeService");
const Common = require("./common");

exports.checkAllEpins = async (regr, epins) => {
  isEpinOk = false;
  let epinAmount, epinBalanceAmt, epinUsedAmount;
  let EpinArr = [];
  let totalBalanceAmount = regr.totalAmount;
  epins.map((value) => {
    // const epinDetails = await checkValidity(value, regr.sponsorId)
    if (epinDetails) {
      epinAmount = epinDetails.balance_amount;
      epinBalanceAmt = epinDetails.balance_amount;
      epinUsedAmount = epinDetails.balance_amount;

      if (totalBalanceAmount) {
        if (epinAmount == totalBalanceAmount) {
          epinBalanceAmt = 0;
          totalBalanceAmount = 0;
        } else if (epinAmount > totalBalanceAmount) {
          epinBalanceAmt = epinAmount - totalBalanceAmount;
          epinUsedAmount = totalBalanceAmount;
          totalBalanceAmount = 0;
        } else {
          epinBalanceAmt = 0;
          let regBalance = totalBalanceAmount - epinAmount;
          totalBalanceAmount = regBalance >= 0 ? regBalance : 0;
        }
        if (totalBalanceAmount == 0) {
          isEpinOk = true;
        }
      } else {
        epinUsedAmount = 0;
      }
      var Epin = {
        pin: epinDetails.numbers,
        amount: epinDetails.balance_amount,
        balance_amount: epinBalanceAmt,
        reg_balance_amount: totalBalanceAmount,
        epin_used_amount: epinUsedAmount,
        product_amount: regr.productAmount,
      };
      EpinArr.push(Epin);
    } else {
      let Epin = {
        pin: "nopin",
        amount: 0,
        balance_amount: 0,
        reg_balance_amount: 0,
        epin_used_amount: 0,
        product_amount: regr.productAmount,
      };
      EpinArr.push(Epin);
    }
  });
  EpinArr["is_pin_ok"] = isEpinOk;
  return EpinArr;
};

async function checkValidity(epin, sponsorId) {
  let date = Date.now();
  const check = await Pins.findOne({
    attributes: ["numbers", "balance_amount"],
    where: {
      allocated_user: sponsorId,
      status: "active",
      expiry_date: {
        [Op.gte]: date,
      },
      amount: {
        [Op.gt]: 0,
      },
      numbers: epin,
    },
  });
  return check;
}

exports.addBySpecificPlan = async (user_id,sponsorId, t, prefix) => {
  try {
    const moduleStatus = await modStatus.getModuleStatus(prefix);
    if (moduleStatus.mlm_plan == "Unilevel" || moduleStatus.mlm_plan == "Donation" || moduleStatus.mlm_plan == "Matrix" || moduleStatus.mlm_plan == "Party") {
      return true;
    }
    if (moduleStatus.mlm_plan == "Binary") {
      await legDetails.create(
        {
          user_id: user_id,
        },
        {
          transaction: t,
          prefix,
        }
      );
      return true
    }
    if (moduleStatus.mlm_plan == 'Stair_Step') {
      let leaderId = await StairStep.findOne({
        attributes: ['leader_id'],
        where: { user_id: sponsorId },
        prefix
      })
      await StairStep.create({
        breakaway_status: 0,
        leader_id: leaderId.leader_id,
        user_id: user_id
      }, { transaction: t, prefix })
      await UserPVDetails.create({
        user_id: user_id
      }, { transaction: t, prefix })
      return true
    }
  } catch (err) {
    return err.message;
  }
};

exports.getWidthCieling = async (prefix) => {
  console.log("get width ceiling")
  let { width_ceiling } = await Config.findOne({
    prefix,
  });
  console.log("width ceiling")
  console.log(width_ceiling)
  return width_ceiling;
};

exports.checkPosition = async (sponsorId, widthCeiling, prefix) => {
  try {
    let id;
    if (sponsorId == "") {
      //TODO
      id = await Common.getAdminId(prefix);
      return {
        id,
        position: 1,
      };
    }
    let rootLevel = await TreeServices.getUserLevel(sponsorId, prefix);
    let selectQuery = `SELECT ft.id, ft.username, (SELECT COUNT(*) FROM ${prefix}users WHERE father_id = ft.id) AS leg_count, GROUP_CONCAT(fta.leg_position ORDER BY fta.user_level ASC SEPARATOR ',' ) AS orderColumn FROM ${prefix}treepaths as tp JOIN ${prefix}users as ft ON tp.descendant = ft.id JOIN ${prefix}treepaths as tpa ON tpa.descendant = tp.descendant JOIN ${prefix}users as fta ON fta.id = tpa.ancestor WHERE tp.ancestor = :sponsorId AND fta.user_level >= :rootLevel GROUP BY tp.descendant HAVING leg_count < :widthCeiling ORDER BY ft.user_level, orderColumn LIMIT 1;`

    let result = await mlm_laravel.query(selectQuery, {
      replacements: {
        sponsorId: sponsorId,
        rootLevel: rootLevel,
        widthCeiling: widthCeiling,
      },
      type: QueryTypes.SELECT,
      raw: true,
      prefix,
    });
    if (result == null || result.length <= 0) {
      id = await Common.getAdminId(prefix);
      return {
        id,
        position: 1,
      };
    }

    return {
      id: result[0]["id"],
      position: result[0]["leg_count"] + 1,
    };
  } catch (err) {
    return false;
  }
};

const getDynamicUsername = exports.getDynamicUsername = async (prefix) => {
  try {
    let nameConfig = UsernameConfig.findOne({prefix})
    let num = Math.floor(Math.random() * 1000000)
    if(nameConfig.prefix_status) {
      let pre = nameConfig.prefix
      var userName = `${pre}${num}`
    }
    let check = await User.findOne({
      where : {
        username : userName
      },
      prefix
    })
    if(check) {
      await getDynamicUsername(prefix)
    }else{
      return userName
    }
  } catch (err) {
    console.log(err.message);
  }
}
