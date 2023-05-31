const { Op, Sequelize } = require("sequelize");
const moment = require("moment");
const db = require("../../models");
const { mlm_laravel } = require("../../models");
const common = require("../../utils/web/common");
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const dc = require("../../utils/web/constants");
const Str = require("@supercharge/strings");
const { successMessage, errorMessage } = require("../../utils/web/response");
const { addEwalletHistory } = require("../../utils/web/ewalletServices");
const pinNum = db.pinNumbers;
const pinAmountDetails = db.pinAmtDetails;
const User = db.user;
const UserDetails = db.userDetails;
const transPass = db.transPassword;
const userBal = db.userBalance;
const EpinAmt = db.pinAmtDetails;
const epinPendReq = db.pinReq;
const pinTransHistory = db.pinTransHistory;

exports.getSearchEpin = async (req, res) => {
  const id = 2;
  var data = [];
  const { term } = req.query;
  try {
    const pin = await pinNum.findAll({
      attributes: ["numbers"],
      where: {
        [Op.and]: {
          allocated_user: id,
          numbers: {
            [Op.like]: `%${term}%`,
          },
        },
      },
      order: ["id"],
    });
    Object.entries(pin).map(([key, value]) => {
      data[key] = {
        id: value.numbers,
        text: value.numbers,
      };
    });
    res.status(200).json({
      status: true,
      data,
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      message: `Error: ${err.message}`,
    });
  }
};

exports.getEpinNumbers = async (req, res) => {
  const date = Date("Y-m-d H:m:i");
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;
    var data = [];
    const pins = await pinNum.findAll({
      attributes: ["id", "numbers"],
      where: {
        [Op.and]: {
          allocated_user: id,
          status: "active",
          expiry_date: {
            [Op.gte]: date,
          },
        },
      },
      order: [["id", "DESC"]],
      prefix,
    });
    Object.entries(pins).map(([key, value]) => {
      data[key] = {
        id: value.numbers,
        value: value.numbers,
      };
    });
    res.status(200).json({
      status: true,
      data: {
        epin_numbers: data,
      },
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      message: `Error: ${err.message}`,
    });
  }
};

exports.getEpinAmount = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;
    var amount = [];
    const userBalance = await userBal.findOne({
      attributes: ["balance_amount"],
      where: {
        user_id: id,
      },
      prefix,
    });
    const allEpinAmount = await EpinAmt.findAll({
      attributes: ["id", "amount"],
      order: [["amount", "ASC"]],
      prefix,
    });
    Object.entries(allEpinAmount).map(([key, value]) => {
      amount[key] = {
        id: value.id,
        value: value.amount,
      };
    });
    var data = {
      amount: amount,
      balance: userBalance.balance_amount,
    };
    var response = await successMessage({
      value: data,
    });
    res.json(response);
  } catch (err) {
    return res.status(422).send({
      status: false,
      message: `Error: ${err.message}`,
    });
  }
};

exports.getEpinPendingRequest = async (req, res) => {
  try {
    const { start, length } = req.query;
    var table_data = [];
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;

    const allEpinPendReq = await epinPendReq.findAll({
      attributes: [
        "id",
        "user_id",
        "requested_pin_count",
        "allotted_pin_count",
        "requested_date",
        "expiry_date",
        "pin_amount",
      ],
      where: {
        status: 1,
        user_id: id,
      },
      offset: start ? parseInt(start) : 0,
      limit: length ? parseInt(length) : 10,
      prefix,
    });
    var count = allEpinPendReq.length;
    Object.entries(allEpinPendReq).map(([key, value]) => {
      table_data[key] = {
        requested_pin_count: value.requested_pin_count,
        pin_count: value.allotted_pin_count,
        amount: value.pin_amount,
        requested_date: moment(value.requested_date).format(
          "MMMM Do YYYY, h:mm:ss a"
        ),
        expiry_date: moment(value.expiry_date).format(
          "MMMM Do YYYY, h:mm:ss a"
        ),
      };
    });
    res.status(200).json({
      status: true,
      data: {
        count,
        table_data,
      },
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      message: `Error: ${err.message}`,
    });
  }
};

exports.epinRefund = async (req, res) => {
  var id = req.user.id;
  var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { delete_id, action } = req.body;
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    if (action == "refund") {
      var activePins = await pinNum.findOne({
        where: {
          expiry_date: {
            [Op.gt]: Date.now(),
          },
          [Op.and]: {
            status: "active",
          },
          purchase_status: 1,
          id: delete_id,
        },
        prefix,
      });

      if (activePins != null) {
        try {
          var t = await mlm_laravel.transaction();
          var pins = await pinNum.findOne({
            where: {
              id: delete_id,
            },
            prefix,
          });
          const userBalance = await userBal.findOne({
            attributes: ["id", "balance_amount"],
            where: {
              user_id: pins.allocated_user,
            },
            prefix,
          });

          const data = {
            status: "delete",
          };
          await pins.update(
            data,
            {
              transaction: t,
            },
            prefix
          );
          var balance =
            Number(userBalance.balance_amount) + Number(pins.balance_amount);
          await addEwalletHistory(
            id,
            id,
            null,
            "pin_purchase",
            pins.balance_amount,
            balance,
            "pin_purchase_refund",
            "credit",
            null,
            "",
            0,
            (pendingId = false),
            prefix,
            t
          );
          const data1 = {
            balance_amount: balance,
          };
          await userBalance.update(
            data1,
            {
              transaction: t,
            },
            prefix
          );
          let dataArr = JSON.stringify({ refund_id: delete_id });
          await common.insertUserActivity(
            "epin refunded",
            id,
            "epin refunded using ewallet",
            dataArr,
            t,
            ip,
            prefix
          );
          await t.commit();
          let response = await successMessage({
            message: "User Balance updated",
          });
          return res.json(response);
        } catch (error) {
          await t.rollback();
          console.log(error);
          return res.status(400).json({
            status: false,
            message: "User Balance not updated",
          });
        }
      } else {
        let response = await errorMessage({ code: 1016 });
        return res.json(response);
      }
    } else {
      let response = await errorMessage({ code: 406 });
      return res.json(response);
    }
  } catch (err) {
    console.log(err);
    //let response = errorMessage({message:`Error: ${err.message}`})
    return res.status(500).send({
      status: false,
      message: `Error: ${err.message}`,
    });
  }
};

exports.epinPurchase = async (req, res) => {
  var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  let t = await mlm_laravel.transaction();
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;

    const { pin_count, amount, passcode, expiry_date } = req.body;
    const getUserPass = await transPass.findOne({
      attributes: ["password"],
      where: {
        user_id: id,
      },
      prefix,
    });
    if (!getUserPass) {
      let errorResponse = await errorMessage({ code: 1015 });
      return res.json(errorResponse);
    } else {
      const checkTransPassword = await bcrypt.compare(
        passcode,
        getUserPass.password
      );
      if (!checkTransPassword) {
        let errorResponse = await errorMessage({ code: 1021 });
        return res.json(errorResponse);
      }
    }
    const userBalance = await userBal.findOne({
      attributes: ["id", "balance_amount"],
      where: {
        user_id: id,
      },
      prefix,
    });
    const amt = await EpinAmt.findOne({
      attributes: ["amount"],
      where: {
        id: amount,
      },
      prefix,
    });
    const totalAvalAmt = parseInt(pin_count) * parseInt(amt.amount);
    if (totalAvalAmt > userBalance.balance_amount) {
      let errorResponse = await errorMessage({ code: 1014 });
      return res.json(errorResponse);
    }

    for (let i = 0; i < pin_count; i++) {
      const transactionId = Str.random(13);
      const epinNumber = Str.random(13);
      await pinNum.create(
        {
          numbers: epinNumber,
          alloc_date: Date("Y-m-d H:i:s"),
          status: "active",
          uploaded_date: Date("Y-m-d H:i:s"),
          generated_user: 1,
          allocated_user: id,
          expiry_date,
          amount: amt.amount,
          balance_amount: amt.amount,
          purchase_status: 1,
          transaction_id: transactionId,
        },
        {
          transaction: t,
          prefix,
        }
      );
    }

    var bal = _.round(userBalance.balance_amount - totalAvalAmt, 4);
    await userBalance.update(
      {
        balance_amount: bal,
      },
      {
        transaction: t,
      },
      prefix
    );
    await addEwalletHistory(
      id,
      id,
      null,
      "pin_purchase",
      totalAvalAmt,
      bal,
      "pin_purchase",
      "debit",
      null,
      "",
      0,
      (pendingId = false),
      prefix,
      t
    );
    let data = {
      pin_count: pin_count,
      amount: amount,
      passcode: passcode,
      expiry_date: expiry_date,
    };
    let dataArr = JSON.stringify(data);
    await common.insertUserActivity(
      "Epin Purchased",
      id,
      "Epin purchased using ewallet",
      dataArr,
      t,
      ip,
      prefix
    );
    await t.commit();
    res.status(204).json({
      status: true,
    });
  } catch (err) {
    await t.rollback();
    return res.status(500).send({
      status: false,
      message: `Error: ${err.message}`,
    });
  }
};

exports.epinRequest = async (req, res) => {
  var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  let t = await mlm_laravel.transaction();
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;
    const { pin_count, amount, expiry_date } = req.body;
    if (pin_count > 100) {
      let response = await errorMessage({ code: 1045 });
      return res.status(422).json(response);
    }
    let amountValue = await EpinAmt.findOne({
      attributes: ["id", "amount"],
      where: {
        id: amount,
      },
      prefix,
    });

    await epinPendReq.create(
      {
        user_id: id,
        requested_pin_count: pin_count,
        alloted_pin_count: pin_count,
        requested_date: Date("Y-m-d H:i:s"),
        status: 1,
        pin_amount: amountValue.amount,
        expiry_date,
      },
      {
        transaction: t,
        prefix,
      }
    );

    // user activity
    let data = {
      pin_count: pin_count,
      amount: amount,
      expiry_date: expiry_date,
    };
    let dataArr = JSON.stringify(data);
    await common.insertUserActivity(
      "epin requested",
      id,
      "epin requested using ewallet",
      dataArr,
      t,
      ip,
      prefix
    );
    await t.commit();
    return res.status(200).json({
      status: true,
      message: "Epin request Successfully completed",
    });
  } catch (err) {
    console.log(err);
    await t.rollback();
    return res.status(500).send({
      status: false,
      message: `Error: ${err.message}`,
    });
  }
};

exports.epinTransfer = async (req, res) => {
  var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  let t = await mlm_laravel.transaction();
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;
    const { epin, transfer_user } = req.body;
    if (transfer_user == req.user.username) {
      let response = await errorMessage({ code: 406 });
      return res.status(422).json(response);
    }
    const checkEpin = await pinNum.findOne({
      where: {
        [Op.and]: {
          allocated_user: id,
          numbers: epin,
        },
      },
      prefix,
    });
    if (checkEpin == null) {
      let response = await errorMessage({
        code: 1016,
      });
      return res.status(422).json(response);
    }
    const toUser = await User.findOne({
      attributes: ["id"],
      where: {
        username: transfer_user,
      },
      prefix,
    });
    if (toUser == null) {
      let response = await errorMessage({ code: 1011 });
      return res.status(500).json(response);
    }
    const pinId = await pinNum.findOne({
      attributes: ["id"],
      where: {
        numbers: epin,
      },
      prefix,
    });
    if (!toUser) {
      let response = await errorMessage({
        code: 1011,
      });
      return res.json(response);
    }
    const transfer = await pinId.update(
      {
        allocated_user: toUser.id,
      },
      {
        transaction: t,
      },
      prefix
    );
    if (!transfer) {
      let response = await errorMessage({
        code: 1046,
      });
      return res.json(response);
    }
    await pinTransHistory.create(
      {
        to_user: toUser.id,
        from_user: id,
        epin_id: pinId.id,
        ip: ip,
        done_by: id,
        activity: "Epin transfered",
        date: Date("Y-m-d H:i:s"),
      },
      {
        transaction: t,
        prefix,
      }
    );
    // user activity
    let data = {
      epin: epin,
      user: transfer_user,
    };
    let dataArr = JSON.stringify(data);
    await common.insertUserActivity(
      "Epin transferred",
      id,
      "Epin transferred using ewallet",
      dataArr,
      t,
      ip,
      prefix
    );
    await t.commit();
    let response = await successMessage({
      message: "Epin Transfer successfully",
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    await t.rollback();
    let response = await errorMessage({
      code: 1046,
    });
    return res.status(422).json(response);
  }
};

exports.getEpinTile = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;

    epin_tile = [];
    const activeEpins = await pinNum
      .scope("isActivePin", "isNotExpired")
      .findAll({
        attributes: [
          [Sequelize.fn("Count", Sequelize.col("id")), "count"],
          [Sequelize.fn("sum", Sequelize.col("balance_amount")), "amount"],
        ],
        where: {
          allocated_user: id,
        },
        raw: true,
        prefix,
      });
    const epinRequest = await epinPendReq.findAll({
      attributes: ["id"],
      include: [
        {
          model: User,
          attributes: ["id"],
          where: {
            id: id,
          },
        },
      ],
      where: {
        status: 1,
      },
      prefix,
    });
    const count = epinRequest.length;

    const active = {
      amount: activeEpins[0].count == null ? 0 : activeEpins[0].count,
      text: "active_epin",
      icon: `${process.env.SITE_URL}/uploads/logos/Paid-w.png`,
      bg_color: "#5bc554",
    };
    epin_tile.push(active);
    const balance = {
      amount: activeEpins[0].amount == null ? 0 : activeEpins[0].amount,
      text: "epin_balance",
      icon: `${process.env.SITE_URL}/uploads/logos/E-Wallet-w.png`,
      bg_color: "#44badc",
    };
    epin_tile.push(balance);
    const pending = {
      amount: count ? count : 0,
      text: "pending_epin",
      icon: `${process.env.SITE_URL}/uploads/logos/Pending-w.png`,
      bg_color: "#ffe690",
    };
    epin_tile.push(pending);

    let result = { epin_tile };
    let response = await successMessage({
      value: result,
    });
    res.json(response);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err.message);
  }
};

exports.getEpinList = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;
    var tableData = [];
    var whereStatement = [];
    var epinListResult = [];
    var amountList = [];

    var { start, length, epins, amounts, status, direction, order } = req.query;
    let filters = {
      start: start ? parseInt(start) : 0,
      length: length ? parseInt(length) : 10,
      epins: epins.includes("") ? [] : epins,
      amounts: amounts.includes("") ? [] : amounts,
    };

    status = status ? status : "active";
    if (filters.epins.length > 0) {
      let condition1 = {
        numbers: filters.epins,
      };
      whereStatement.push(condition1);
    }
    if (status) {
      if (status == "used_expired") {
        var condition2 = {
          [Op.or]: {
            status: "used",
            expiry_date: {
              [Op.lt]: new Date(),
            },
          },
        };
      } else {
        var condition2 = {
          status: status,
          expiry_date: {
            [Op.gt]: new Date(),
          },
        };
      }
      whereStatement.push(condition2);
    }
    if (filters.amounts.length > 0) {
      let condition3 = {
        amount: filters.amounts,
      };
      whereStatement.push(condition3);
    }
    const epinList = await pinNum.findAll({
      attributes: [
        "id",
        "numbers",
        "status",
        "purchase_status",
        "expiry_date",
        "amount",
        "balance_amount",
      ],
      include: [
        {
          model: User,
          attributes: ["id", "username"],
          where: {
            id: id,
          },
        },
      ],
      where: whereStatement,
      offset: filters.start,
      limit: filters.length,
      prefix,
    });

    const totalResult = await pinNum.findAll({
      attributes: [
        "id",
        "numbers",
        "status",
        "purchase_status",
        "expiry_date",
        "amount",
        "balance_amount",
      ],
      include: [
        {
          model: User,
          attributes: ["id", "username"],
          where: {
            id: id,
          },
        },
      ],
      where: whereStatement,
      prefix,
    });

    const amountResult = await pinAmountDetails.findAll({
      attributes: ["id", "amount"],
      prefix,
    });

    const epinResult = await pinNum.findAll({
      attributes: [
        "id",
        "numbers",
        "status",
        "purchase_status",
        "expiry_date",
        "amount",
        "balance_amount",
      ],
      include: [
        {
          model: User,
          attributes: ["id", "username"],
          where: {
            id: id,
          },
          include: [
            {
              model: UserDetails,
              as: "details",
              attributes: ["second_name", "name", "image"],
            },
          ],
        },
      ],
      where: whereStatement,
      offset: filters.start,
      limit: filters.length,
      prefix,
    });

    const count = totalResult.length;

    Object.entries(epinList).map(([key, value]) => {
      tableData[key] = {
        epin_id: value.id,
        pin_number: value.numbers,
        amount: value.amount,
        balance_amount: value.balance_amount,
        status: value.expiry_date < new Date() ? "expired" : value.status,
        expiry_date: moment(value.expiry_date).format(
          "MMMM Do YYYY, h:mm:ss a"
        ),
        refund:
          value.status == "active" &&
          value.purchase_status &&
          value.expiry_date > new Date()
            ? "refund"
            : "na",
      };
    });

    Object.entries(amountResult).map(([key, value]) => {
      amountList[key] = {
        id: value.id,
        amount: value.amount,
      };
    });

    Object.entries(epinResult).map(([key, value]) => {
      epinListResult[key] = {
        pin_id: value.id,
        pin_numbers: value.numbers,
        status: value.status,
        purchase_status: value.purchase_status ? "yes" : "no",
        pin_expiry_date: moment(value.expiry_date).format("YYYY-MM-DD"),
        pin_amount: value.amount,
        pin_balance_amount: value.balance_amount,
        user_name: value.user.username,
        full_name: `${value.user.details.name} ${value.user.details.second_name}`,
        user_photo: value.user.details.image,
      };
    });

    const data = {
      count: count,
      table_data: tableData,
      epins: epinListResult,
      amounts: amountResult,
    };
    let response = await successMessage({
      value: data,
    });
    res.json(response);
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

exports.getEpinTransferHistory = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;
    var tableData = [];
    var { start, limit, startDate, endDate } = req.query;

    const transferDetails = await pinTransHistory.findAll({
      attributes: ["to_user", "from_user", "date"],
      include: [
        {
          model: User,
          as: "user1",
          attributes: ["username"],
          include: [
            {
              model: UserDetails,
              as: "details",
              attributes: ["name", "second_name"],
              raw: true,
            },
          ],
        },
        {
          model: User,
          as: "user2",
          attributes: ["username"],
          include: [
            {
              model: UserDetails,
              as: "details",
              attributes: ["name", "second_name"],
              raw: true,
            },
          ],
        },
        {
          model: pinNum,
          attributes: ["numbers", "amount"],
        },
      ],
      prefix,
    });
    const count = transferDetails.length;
    Object.entries(transferDetails).map(([key, value]) => {
      tableData[key] = {
        member_name:
          value.from_user == id
            ? `${value.user1.details.name} ${value.user1.details.second_name} (${value.user1.username})`
            : `${value.user2.details.name} ${value.user2.details.second_name} (${value.user2.username})`,
        epin: value.pinNumber.numbers,
        transferred_date: moment(value.date).format("MMMM Do YYYY, h:mm:ss a"),
        type: value.from_user == id ? "Transferred" : "Received",
        amount: value.pinNumber.amount,
      };
    });
    const data = {
      count: count,
      table_data: tableData,
    };
    let response = await successMessage({ value: data });
    res.json(response);
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
