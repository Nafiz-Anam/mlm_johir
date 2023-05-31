const { Op } = require("sequelize");
const db = require("../../models");
const UserDetails = db.userDetails;
const User = db.user;
const Mailbox = db.mailBoxes;
const Contacts = db.contacts;
const Common = require("./common");
const TreePath = db.treepath;
const moment = require("moment");
const modStatus = require("./moduleStatus");

exports.getAllMail = async (id, filters, prefix) => {
  let messages = [],
    replicaMessages = [];
  let totalMessages = await Mailbox.findAll({
    include: [
      {
        model: UserDetails,
        as: "from user",
        attributes: ["id", "name", "second_name", "image"],
        include: [
          {
            model: User,
            attributes: ["username"],
          },
        ],
      },
      {
        model: UserDetails,
        as: "to user",
        attributes: ["id", "name", "second_name", "image"],
      },
    ],
    where: {
      [Op.or]: {
        to_user_id: id,
      },
      [Op.and]: {
        inbox_delete_status: 0,
      },
    },
    offset: filters.offset,
    limit: filters.limit,
    order: [["created_at", "DESC"]],
    prefix,
  });

  const moduleStatus = await modStatus.getModuleStatus(prefix);
  if (moduleStatus.replicated_site_status) {
    replicaMessages = await Contacts.findAll({
      where: {
        owner_id: id,
        status: 0,
      },
      include: [
        {
          model: User,
          as: "replica",
        },
      ],
      offset: filters.offset,
      limit: filters.limit,
      order: [["created_at", "DESC"]],
      prefix,
    });
  }

  for await (let [key, value] of Object.entries(totalMessages)) {
    let image =
      value["to user"]?.image == "null"
        ? "nophoto.png"
        : value["to user"]?.image;
    messages[key] = {
      mailtousid: value.id,
      mailtoususer: value.from_user_id,
      mailtoussub: value.subject,
      mailtousmsg: value.message,
      mailtousdate: value.createdAt,
      status: "yes",
      read_msg: value.read_status ? "yes" : "no",
      type: await Common.getUserType(value.from_user_id, prefix),
      flag: 1,
      fullname: value["from user"].name + " " + value["from user"].second_name,
      user_name: value["from user"].user.username,
      from_user_name: value["from user"].user.username,
      thread: value.thread,
      sender_img: image,
      mail_enc_thread: value.thread,
      mail_enc_id: value.id,
      mail_enc_type: await Common.getUserType(value.from_user_id, prefix),
    };
  }

  for await (let [key, value] of Object.entries(replicaMessages)) {
    let message = {
      Name: value.name,
      Email: value.email,
      Address: value.address,
      Phone: value.phone,
      Description: value.contact_info,
    };
    let replicamsg = {
      mailtousid: value.id,
      mailtoususer: value.name,
      mailtoussub: `${value.name} Contacted You`,
      mailtousmsg: message,
      mailtousdate: value.createdAt,
      status: "yes",
      read_msg: value.read_msg == 1 ? "yes" : "no",
      type: "contact",
      flag: "1",
      fullname: value.name,
      user_name: `${value.name} Contacted You`,
      from_user_name: value.name,
      mail_enc_id: value.id,
      mail_enc_type: "contact",
    };
    messages.push(replicamsg);
  }
  let sortedResult = messages.sort((a, b) => {
    return b.mailtousdate - a.mailtousdate;
  });
  return sortedResult;
};

exports.countAllMail = async (id, prefix) => {
  let replicaMessages = [];
  let totalMessages = await Mailbox.findAll({
    attributes: [
      "id",
      "from_user_id",
      "to_user_id",
      "subject",
      "message",
      "date",
      "inbox_delete_status",
      "sent_delete_status",
      "thread",
    ],
    where: {
      [Op.or]: {
        to_user_id: id,
      },
      [Op.and]: {
        inbox_delete_status: 0,
      },
    },
    prefix,
  });

  const moduleStatus = await modStatus.getModuleStatus(prefix);
  if (moduleStatus.replicated_site_status) {
    replicaMessages = await Contacts.findAll({
      where: {
        owner_id: id,
        status: 0,
      },
      prefix,
    });
  }
  return totalMessages.length + replicaMessages.length;
};

exports.updateViewStatus = async (messageId, messageType, toUserId, prefix) => {
  try {
    if (messageType == "contact") {
      const replicaMailDetails = await Contacts.findOne({
        where: {
          id: messageId,
        },
        prefix,
      });

      if (replicaMailDetails.owner_id == toUserId) {
        await replicaMailDetails.update(
          {
            read_msg: 1,
          },
          {},
          prefix
        );
      }
    } else {
      const mailDetails = await Mailbox.findOne({
        where: {
          id: messageId,
        },
        prefix,
      });
      if (mailDetails.to_user_id == toUserId) {
        await mailDetails.update(
          {
            read_status: 1,
          },
          {},
          prefix
        );
      }
    }
    true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

exports.getAllCorrespondingMail = async (
  messageId,
  messageType,
  userId,
  prefix
) => {
  try {
    if (messageType == "contact") {
      const replicaMailDetails = await Contacts.findOne({
        where: {
          id: messageId,
        },
        order: [["created_at", "DESC"]],
        prefix,
      });

      const replicaResult = {
        id: replicaMailDetails.id,
        contact_name: replicaMailDetails.name,
        contact_email: replicaMailDetails.email,
        contact_address: replicaMailDetails.address,
        contact_phone: replicaMailDetails.phone,
        contact_info: replicaMailDetails.contact_info,
        owner_id: replicaMailDetails.owner_id,
        status: replicaMailDetails.status,
        mailadiddate: replicaMailDetails.createdAt,
        read_msg: replicaMailDetails.read_msg ? "yes" : "no",
        msg: replicaMailDetails.contact_info,
        date: replicaMailDetails.mail_added_date,
      };
      return replicaResult;
    } else {
      let totalMessages = await Mailbox.findAll({
        include: [
          {
            model: UserDetails,
            as: "from user",
            attributes: ["id", "name", "second_name", "image"],
            include: [
              {
                model: User,
                attributes: ["username"],
              },
            ],
          },
          {
            model: UserDetails,
            as: "to user",
            attributes: ["id", "name", "second_name", "image"],
            include: [
              {
                model: User,
                attributes: ["username"],
              },
            ],
          },
        ],
        where: {
          [Op.or]: {
            id: messageId,
            thread: messageId,
          },
          [Op.and]: [
            {
              [Op.or]: [
                { from_user_id: userId },
                { to_user_id: userId },
                { to_all: 1 },
              ],
            },
          ],
        },
        order: [["created_at", "DESC"]],
        prefix,
      });
      let result = [];
      for await (let [key, value] of Object.entries(totalMessages)) {
        result[key] = {
          id: value.id,
          to_user: value?.to_user_id ? value.to_user_id : "admin",
          subject: value.subject,
          fullname: value["from user"].name,
          message: value.message,
          date: value.createdAt,
          status: "yes",
          from: value.from_user_id,
          user_name: await Common.idToUsername(value.from_user_id, prefix),
          read_msg: value.read_status ? "yes" : "no",
          delete_status: "no",
          thread: value.id,
          msg: value.message,
          is_sent_mail: value.from_user_id == userId ? true : false,
        };
      }
      let sortedResult = result.sort((a, b) => {
        return b.mailtousdate - a.mailtousdate;
      });
      return sortedResult;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
};

exports.getReplyDetails = async (msgId, prefix) => {
  try {
    const mailDetails = await Mailbox.findOne({
      where: {
        id: msgId,
      },
      prefix,
    });
    if (mailDetails == null) {
      return null;
    }
    const reply_to_user = await Common.idToUsername(
      mailDetails.from_user_id,
      prefix
    );
    const reply_msg = mailDetails.subject ? mailDetails.subject : "";
    return { reply_to_user, reply_msg };
  } catch (error) {
    return null;
  }
};

exports.replyMail = async (id, msgId, subject, message, prefix) => {
  try {
    let replyMailId, msgTo;
    const mailDetails = await Mailbox.findOne({
      where: {
        id: msgId,
      },
      prefix,
    });

    if (mailDetails.thread != null) {
      replyMailId = mailDetails.thread;
      const firstMailDetails = await Mailbox.findOne({
        where: {
          id: replyMailId,
        },
        order: [["created_at", "DESC"]],
        prefix,
      });
      msgTo = firstMailDetails.from_user_id;
    } else {
      replyMailId = msgId;
      msgTo = mailDetails.from_user_id;
    }

    await Mailbox.create(
      {
        from_user_id: id,
        to_user_id: msgTo,
        to_all: 0,
        subject,
        message,
        date: new Date(),
        inbox_delete_status: 0,
        sent_delete_status: 0,
        thread: replyMailId,
      },
      { prefix }
    );
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

exports.getSentMessages = async (id, filters, prefix) => {
  try {
    let messages = [];
    let totalMessages = await Mailbox.findAll({
      include: [
        {
          model: UserDetails,
          as: "from user",
          attributes: ["id", "name", "second_name", "image"],
          include: [
            {
              model: User,
              attributes: ["username"],
            },
          ],
        },
        {
          model: UserDetails,
          as: "to user",
          attributes: ["id", "name", "second_name", "image"],
          include: [
            {
              model: User,
              attributes: ["username"],
            },
          ],
        },
      ],
      where: {
        [Op.or]: {
          to_all: 1,
          sent_delete_status: 0,
        },
        [Op.and]: {
          from_user_id: id,
        },
      },
      offset: filters.offset,
      limit: filters.limit,
      order: [["created_at", "DESC"]],
      prefix,
    });
    for await (let [key, value] of Object.entries(totalMessages)) {
      messages[key] = {
        mailtousid: value.id,
        mailtoususer: value.to_user_id,
        mailfromuser: id,
        mailtoussub: value.subject,
        mailtousmsg: value.message,
        mailtousdate: value.createdAt,
        status: "yes",
        read_msg: value.read_status ? "yes" : "no",
        deleted_by: value.deleted_by ? value.deleted_by : "",
        thread: value.thread,
        mailadidmsg: value.message,
        user_name: value["to user"].user.username,
        fullname: value["to user"].name + " " + value["to user"].second_name,
        mailadid: value.id,
        mailadmsg: value.message,
        mailadsubject: value.subject,
        mailadiddate: value.createdAt,
        type: await Common.getUserType(id, prefix),
        mail_enc_id: value.id,
        mail_enc_type: await Common.getUserType(id, prefix),
      };
    }

    let sortedResult = messages.sort((a, b) => {
      return b.mailtousdate - a.mailtousdate;
    });
    return sortedResult;
  } catch (error) {
    console.log(error);
    return false;
  }
};

exports.countAllSentMail = async (id, prefix) => {
  let totalMessages = await Mailbox.findAll({
    attributes: [
      "id",
      "from_user_id",
      "to_user_id",
      "subject",
      "message",
      "date",
      "inbox_delete_status",
      "sent_delete_status",
      "thread",
    ],
    where: {
      [Op.and]: {
        from_user_id: id,
        sent_delete_status: 0,
      },
    },
    prefix,
  });
  return totalMessages.length;
};

exports.getSIngleSentMail = async (id, type, prefix) => {
  try {
    let mailDetails;
    mailDetails = await Mailbox.findOne({
      where: {
        id,
      },
      include: [
        {
          model: UserDetails,
          as: "from user",
          attributes: ["id", "name", "second_name", "image"],
          include: [
            {
              model: User,
              attributes: ["username"],
            },
          ],
        },
        {
          model: UserDetails,
          as: "to user",
          attributes: ["id", "name", "second_name", "image"],
          include: [
            {
              model: User,
              attributes: ["username"],
            },
          ],
        },
      ],
      prefix,
    });
    if (type == "to_admin") {
      return {
        mailadid: mailDetails.id,
        mailaduser: mailDetails.to_user_id,
        mailadsubject: mailDetails.subject,
        mailadiddate: mailDetails.createdAt,
        status: "yes",
        mailadidmsg: mailDetails.message,
        read_msg: mailDetails.read_status ? "yes" : "no",
        deleted_by: mailDetails.deleted_by ? mailDetails.deleted_by : "",
        thread: mailDetails.thread,
        to: mailDetails["to user"].user?.username
          ? mailDetails["to user"].user?.username
          : "",
        fullname:
          mailDetails["to user"].name +
          " " +
          mailDetails["to user"].second_name,
        msg: mailDetails.message,
        is_sent_mail: true,
      };
    } else if ((type = "user")) {
      return {
        mailtousid: mailDetails.id,
        mailtoususer: mailDetails.to_user_id,
        mailfromuser: mailDetails.from_user_id,
        mailtoussub: mailDetails.subject,
        mailtousdate: mailDetails.createdAt,
        status: "yes",
        mailtousmsg: mailDetails.message,
        read_msg: mailDetails.read_status ? "yes" : "no",
        deleted_by: mailDetails.deleted_by ? mailDetails.deleted_by : "",
        thread: mailDetails.thread,
        to: mailDetails["to user"].user?.username
          ? mailDetails["to user"].user?.username
          : "",
        fullname:
          mailDetails["to user"].name +
          " " +
          mailDetails["to user"].second_name,
        msg: mailDetails.message,
        is_sent_mail: true,
      };
    }
  } catch (error) {
    console.log(error);
    return resizeBy.status(500).json(error.message);
  }
};

exports.deleteSingleMail = async (id, msgId, type, prefix) => {
  try {
    if (type == "contact") {
      const mailDetails = await Contacts.findOne({
        where: {
          id: msgId,
        },
        prefix,
      });

      await mailDetails.update(
        {
          status: 1,
        },
        {},
        prefix
      );
      return true;
    } else {
      const mailDetails = await Mailbox.findOne({
        where: {
          id: msgId,
        },
        prefix,
      });
      if (mailDetails.to_user_id == id) {
        await mailDetails.update(
          {
            inbox_delete_status: 1,
          },
          {},
          prefix
        );
      } else {
        await mailDetails.update(
          {
            sent_delete_status: 1,
          },
          {},
          prefix
        );
      }
      let deleteThread = await deleteAllThreadMails(msgId, id, prefix);
      if (deleteThread == false) {
        return false;
      }
      return true;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

const deleteAllThreadMails = (exports.deleteAllThreadMails = async (
  msgId,
  id,
  prefix
) => {
  try {
    const allReplies = await Mailbox.findAll({
      where: {
        thread: msgId,
      },
      prefix,
    });
    if (allReplies.length > 0) {
      for await (let [key, value] of Object.entries(allReplies)) {
        let SingleMail = await Mailbox.findOne({
          where: {
            id: value.id,
          },
          prefix,
        });

        if (SingleMail.to_user_id == id) {
          await SingleMail.update(
            {
              inbox_delete_status: 1,
            },
            {},
            prefix
          );
        } else {
          await SingleMail.update(
            {
              sent_delete_status: 1,
            },
            {},
            prefix
          );
        }
      }
      return true;
    } else {
      return true;
    }
  } catch (err) {
    return false;
  }
});

exports.getDownLineUserForMail = async (id, prefix) => {
  const result = [];
  const Details = await TreePath.findAll({
    include: [
      {
        model: User,
        as: "T1",
        include: [
          {
            model: UserDetails,
            as: "details",
          },
        ],
      },
    ],
    where: {
      ancestor: id,
      descendant: {
        [Op.ne]: id,
      },
    },
    prefix,
  });
  for await (let [key, value] of Object.entries(Details)) {
    let fullname = `${value["T1"].details.name} ${value["T1"].details.second_name} (${value["T1"].username})`;
    result[key] = {
      id: value["T1"].username,
      value: fullname,
    };
  }
  return result;
};

const getDownlineUserIdForMail = (exports.getDownlineUserNameForMail = async (
  id,
  prefix
) => {
  const result = [];
  const Details = await TreePath.findAll({
    include: [
      {
        model: User,
        as: "T1",
        include: [
          {
            model: UserDetails,
            as: "details",
          },
        ],
      },
    ],
    where: {
      ancestor: id,
      descendant: {
        [Op.ne]: id,
      },
    },
    prefix,
  });
  for await (let [key, value] of Object.entries(Details)) {
    result[key] = {
      id: value["T1"].id,
    };
  }
  return result;
});

exports.sendMail = async (id, requestBody, prefix) => {
  try {
    if (requestBody.type == "admin") {
      const result = await sendMailToAdmin(id, requestBody, prefix);
      return result;
    }
    if (requestBody.type == "individual") {
      const result = await sendMailToIndividual(id, requestBody, prefix);
      return result;
    }

    if (requestBody.type == "myTeam") {
      const result = await sendMailToTeam(id, requestBody, prefix);
      return result;
    }

    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const sendMailToAdmin = (exports.sendMailToAdmin = async (
  id,
  requestBody,
  prefix
) => {
  try {
    const adminId = await Common.getAdminId(prefix);
    await Mailbox.create(
      {
        from_user_id: id,
        to_user_id: adminId,
        to_all: 0,
        subject: requestBody.subject,
        message: requestBody.message,
        date: new Date(),
        inbox_delete_status: 0,
        sent_delete_status: 0,
        read_status: 0,
      },
      { prefix }
    );
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
});

const sendMailToIndividual = (exports.sendMailToIndividual = async (
  id,
  requestBody,
  prefix
) => {
  try {
    const userId = await Common.usernameToId(requestBody.user, prefix);
    await Mailbox.create(
      {
        from_user_id: id,
        to_user_id: userId,
        to_all: 0,
        subject: requestBody.subject,
        message: requestBody.message,
        date: new Date(),
        inbox_delete_status: 0,
        sent_delete_status: 0,
        read_status: 0,
      },
      { prefix }
    );
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
});

const sendMailToTeam = (exports.sendMailToTeam = async (
  id,
  requestBody,
  prefix
) => {
  try {
    const usersArray = await getDownlineUserIdForMail(id, prefix);
    for await (let [key, value] of Object.entries(usersArray)) {
      await Mailbox.create(
        {
          from_user_id: id,
          to_user_id: value.id,
          to_all: 0,
          subject: requestBody.subject,
          message: requestBody.message,
          date: new Date(),
          inbox_delete_status: 0,
          sent_delete_status: 0,
          read_status: 0,
        },
        { prefix }
      );
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
});

exports.getAdminMailList = async (id, filters, prefix) => {
  let messages = [];
  let totalMessages = await Mailbox.findAll({
    include: [
      {
        model: UserDetails,
        as: "from user",
        attributes: ["id", "name", "second_name", "image"],
        include: [
          {
            model: User,
            attributes: ["username"],
          },
        ],
      },
      {
        model: UserDetails,
        as: "to user",
        attributes: ["id", "name", "second_name", "image"],
      },
    ],
    where: {
      [Op.and]: {
        to_all: 1,
        sent_delete_status: 0,
      },
    },
    offset: filters.offset,
    limit: filters.limit,
    order: [["created_at", "DESC"]],
    prefix,
  });

  for await (let [key, value] of Object.entries(totalMessages)) {
    let image =
      value["to user"]?.image == "null" ? "" : value["to user"]?.image;
    messages[key] = {
      mailtousid: value.id,
      mailtoususer: value.from_user_id,
      mailtoussub: value.subject,
      mailtousmsg: value.message,
      mailtousdate: value.createdAt,
      status: "yes",
      read_msg: value.read_status ? "yes" : "no",
      type: await Common.getUserType(value.from_user_id, prefix),
      flag: 1,
      fullname: value["from user"].name + " " + value["from user"].second_name,
      user_name: value["from user"].user.username,
      from_user_name: value["from user"].user.username,
      thread: value.thread,
      sender_img: image,
      mail_enc_thread: value.thread,
      mail_enc_id: value.id,
      mail_enc_type: await Common.getUserType(value.from_user_id, prefix),
    };
  }

  let sortedResult = messages.sort((a, b) => {
    return b.mailtousdate - a.mailtousdate;
  });
  return sortedResult;
};

exports.countAllAdminMail = async (id, prefix) => {
  let totalMessages = await Mailbox.findAll({
    include: [
      {
        model: UserDetails,
        as: "from user",
        attributes: ["id", "name", "second_name", "image"],
        include: [
          {
            model: User,
            attributes: ["username"],
          },
        ],
      },
      {
        model: UserDetails,
        as: "to user",
        attributes: ["id", "name", "second_name", "image"],
      },
    ],
    where: {
      [Op.or]: {
        to_all: 1,
        to_user_id: id,
      },
      [Op.and]: {
        sent_delete_status: 0,
      },
    },
    prefix,
  });
  return totalMessages.length;
};

exports.getUnreadMessages = async (id, prefix) => {
  try {
    let messages = [],
      replicaMessages = [];
    let totalMessages = await Mailbox.findAll({
      include: [
        {
          model: UserDetails,
          as: "from user",
          attributes: ["id", "name", "second_name", "image"],
          include: [
            {
              model: User,
              attributes: ["username"],
            },
          ],
        },
        {
          model: UserDetails,
          as: "to user",
          attributes: ["id", "name", "second_name", "image"],
        },
      ],
      where: {
        [Op.or]: {
          to_user_id: id,
        },
        [Op.and]: {
          inbox_delete_status: 0,
          read_status: 0,
        },
      },
      order: [["created_at", "DESC"]],
      prefix,
    });

    const moduleStatus = await modStatus.getModuleStatus(prefix);
    if (moduleStatus.replicated_site_status) {
      replicaMessages = await Contacts.findAll({
        where: {
          owner_id: id,
          read_msg: 0,
        },
        include: [
          {
            model: User,
            as: "replica",
            include: [
              {
                model: UserDetails,
                attributes: ["image"],
                as: "details",
              },
            ],
          },
        ],
        order: [["created_at", "DESC"]],
        prefix,
      });
    }

    for await (let [key, value] of Object.entries(totalMessages)) {
      let image =
        value["from user"]?.image == "null" ||
        value["from user"]?.image == "" ||
        value["from user"]?.image == null
          ? ""
          : value["from user"]?.image;
      messages[key] = {
        mailaduser: value.from_user_id,
        mailadsubject: value.subject,
        mailadiddate: moment(value.createdAt).format("MMM Do YY"),
        username: value["from user"].user.username,
        image,
        date: value.createdAt,
      };
    }

    for await (let [key, value] of Object.entries(replicaMessages)) {
      let image = "";
      messages[key] = {
        mailaduser: value.from_user_id,
        mailadsubject: value.contact_info,
        mailadiddate: moment(value.createdAt).format("MMM Do YY"),
        username: value.name,
        image,
        date: value.createdAt,
      };
    }

    let sortedResult = messages.sort((a, b) => {
      return b.date - a.date;
    });
    return sortedResult;
  } catch (error) {
    console.log(error);
    return [];
  }
};

exports.getCommissionAlert = async (userId, prefix) => {
  try {
    let mailDetails;
    mailDetails = await Mailbox.findOne({
      where: {
        to_user_id: userId,
        subject: "Max commission alert",
      },
      prefix,
    });
    return mailDetails;
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};
