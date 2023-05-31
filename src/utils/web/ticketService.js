const db = require("../../models");
const Str = require("@supercharge/strings");
const common = require("../../utils/web/common");
const moment = require("moment");
const { Op, where } = require("sequelize");
const { default: tags } = require("../../models/rest/tags");
const Tickets = db.tickets;
const TicketCategories = db.ticketCategories;
const TicketStatus = db.ticketStatus;
const TicketPriority = db.ticketPriority;
const TicketReplies = db.ticketReplies;
const TicketActivity = db.ticketActivity;
const TicketFaqs = db.ticketFaqs;
const Tags = db.tags;
const TicketTags = db.ticketTags;

exports.ticketsGet = async (userId, filters, prefix) => {
  let whereStatement = [];
  let Arr = [];
  if (userId) {
    let condition1 = {
      user_id: userId,
    };
    whereStatement.push(condition1);
  }
  if (filters.ticket_id) {
    let condition2 = {
      track_id: filters.ticket_id,
    };
    whereStatement.push(condition2);
  }
  if (filters.category) {
    let condition3 = {
      category_id: filters.category,
    };
    whereStatement.push(condition3);
  }
  if (filters.status) {
    let condition4 = {
      status_id: filters.status,
    };
    whereStatement.push(condition4);
  }
  if (filters.priority) {
    let condition5 = {
      priority_id: filters.priority,
    };
    whereStatement.push(condition5);
  }
  let result = await Tickets.findAll({
    include: [
      {
        model: TicketStatus,
      },
      {
        model: TicketCategories,
      },
      {
        model: TicketPriority,
      },
    ],
    where: whereStatement,
    prefix,
  });
  for await (let [key, value] of Object.entries(result)) {
    Arr[key] = {
      id: value.id,
      ticket_id: value.track_id,
      subject: value.subject,
      assignee_user_name: await common.idToUsername(value.assignee_id, prefix),
      status_name: value.ticketStatus.ticket_status,
      category_name: value.ticketCategory.category_name,
      priority_name: value.ticketPriority.priority,
    };
  }

  return Arr;
};

exports.faqsGet = async (prefix) => {
  try {
    let result = await TicketFaqs.findAll(
      {
        attributes: ["id", "question", "answer", "status", "category_id"],
        prefix
      }
    );
    return result;
  } catch (error) {
    console.log(error.message);
    return [];
  }
};

exports.createTicketId = async (prefix) => {
  let track_id = `IMS-${Str.random(12)}`;
  try {
    let result = await Tickets.findOne({
      where: { track_id: track_id },
      prefix,
    });
    if (result) {
      this.createTicketId(prefix);
    } else {
      return track_id;
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.createNewTicket = async (userId, ticket, ip, t, prefix) => {
  try {
    let result = await Tickets.create(
      {
        track_id: ticket["trackId"],
        name: await common.idToUsername(userId, prefix),
        user_id: parseInt(ticket["user_id"]),
        category_id: ticket["category"],
        priority_id: ticket["priority"],
        assignee_id: await common.getAdminId(prefix),
        assignee_name: await common.getAdminUsername(prefix),
        subject: ticket["subject"],
        attachments: ticket["file_name"],
        message: ticket["message"],
        last_replier: ticket["user_id"],
        ip: ip,
        status_id: 1,
        assignee_read_ticket: 1,
      },
      {
        transaction: t,
        prefix,
      }
    );
    return result;
  } catch (error) {
    console.log(error.message);
    await t.rollback();
    return false;
  }
};

exports.incrementCategoryCount = async (category, t, prefix) => {
  try {
    let categoryCount = await TicketCategories.findOne({
      attributes: ["id", "ticket_count"],
      where: { id: category },
      prefix,
    });
    let data = {
      ticket_count: categoryCount.ticket_count + 1,
    };
    await categoryCount.update(data, { transaction: t }, prefix);
  } catch (error) {
    await t.rollback();
    console.log(error.message);
  }
};

exports.replyTicket = async (
  ticketId,
  message,
  user_id,
  file_name,
  t,
  prefix
) => {
  try {
    let replies = await TicketReplies.create(
      {
        ticket_id: ticketId,
        user_id: user_id,
        message: message,
        image: file_name ? file_name : "",
        status: 1,
      },
      {
        transaction: t,
        prefix,
      }
    );
    return true;
  } catch (error) {
    await t.rollback();
    console.log(error);
    return false;
  }
};

exports.insertToHistory = async (
  ticket_id,
  user_id,
  user_type,
  activity,
  message,
  t,
  prefix
) => {
  try {
    let result = await TicketActivity.create(
      {
        ticket_id: ticket_id,
        doneby: user_id,
        doneby_usertype: "user",
        activity: activity,
        if_comments: "",
        if_reply: message,
      },
      {
        transaction: t,
        prefix,
      }
    );
    return true;
  } catch (error) {
    // await t.rollback();
    console.log(error.message);
    return false;
  }
};

exports.getTicketActivityHistory = async (ticket_id, prefix) => {
  let activityArr = [];
  let ticket = await Tickets.findOne({
    attributes: ["id"],
    where: { track_id: ticket_id },
    prefix,
  });
  let activity = await TicketActivity.findAll({
    where: {
      ticket_id: ticket.id,
      activity: {
        [Op.ne]: "Comment added",
      },
    },
    prefix,
    order: ["id"],
  });
  for await (let [key, value] of Object.entries(activity)) {
    activityArr[key] = {
      id: value.id,
      ticket_id: value.ticket_id,
      done_by: await common.idToUsername(value.doneby, prefix),
      done_by_user_type: "user",
      date: moment(value.createdAt).format("YYYY-MM-DD"),
      activity: value.activity,
      comments: value.if_comments,
      message: value.if_reply,
    };
  }
  return activityArr;
};

exports.getAllTicketCategory = async (prefix) => {
  try {
    console.log("prefix", prefix);
    let result = await TicketCategories.findAll({
      attributes: ["id", "category_name"],
      where: { status: 1 },
      prefix,
    });
    return result;
  } catch (error) {
    console.log(error.message);
    return [];
  }
};

exports.getAllTicketStatus = async (prefix) => {
  try {
    let result = await TicketStatus.findAll({
      attributes: ["id", ["ticket_status", "status"]],
      where: { status: 1 },
      prefix,
    });
    return result;
  } catch (error) {
    console.log(error.message);
    return [];
  }
};

exports.getAllTicketPriority = async (prefix) => {
  try {
    console.log("prefix", prefix);
    let result = await TicketPriority.findAll({
      attributes: ["id", "priority"],
      where: { status: 1 },
      prefix,
    });
    return result;
  } catch (error) {
    console.log(error.message);
    return [];
  }
};

exports.getTicketData = async (ticketId, userId, prefix) => {
  let whereStatement = [];
  if (ticketId) {
    let condition1 = {
      track_id: ticketId,
    };
    whereStatement.push(condition1);
  }
  if (userId) {
    let condition2 = {
      user_id: userId,
    };
    whereStatement.push(condition2);
  }
  let result = await Tickets.findOne({
    include: [
      {
        model: TicketStatus,
      },
      {
        model: TicketCategories,
      },
      {
        model: TicketPriority,
      },
    ],
    where: whereStatement,
    prefix,
  });
  let tickets = await Tickets.findOne({
    attributes: ["id"],
    where: { track_id: ticketId },
    prefix,
  });
  let tags = await Tags.findOne({
    attributes: ["id", "tag"],
    include: [
      {
        model: TicketTags,
        where: { tag_id: tickets.id },
      },
    ],
    prefix
  });
  let data = {
    id: result.id,
    ticket_id: result.trackid,
    created_date: moment(result.createdAt).format("YYYY-MM-DD"),
    updated_date: moment(result.updatedAt).format("YYYY-MM-DD"),
    subject: result.subject,
    message: result.message,
    attachments: result.attachments,
    tags: tags ? tags.tag : "",
    user: await common.idToUsername(result.user_id, prefix),
    user_id: result.user_id,
    lastreplier: await common.idToUsername(result.last_replier, prefix),
    status_no: result.status,
    status: result.ticketStatus.ticket_status,
    category: result.ticketCategory.category_name,
    priority: result.ticketPriority.priority,
    assignee: result.name,
  };
  return data;
};

exports.getAllReply = async (ticketId, prefix) => {
  let data = [];
  let replies = await TicketReplies.findAll({
    where: { ticket_id: ticketId },
    order: ["id"],
    prefix,
  });
  for await (let [key, value] of Object.entries(replies)) {
    data[key] = {
      date: moment(value.createdAt).format("MMM Do YYYY h:mm:ss a"),
      user_id: value.user_id,
      attachments: value.image,
      message: value.message,
      profile_pic: await common.getProfilePic(value.user_id, prefix),
      user: await common.idToUsername(value.user_id, prefix),
    };
  }
  return data;
};

exports.getTicketId = async (ticket_id, prefix) => {
  try {
    let result = await Tickets.findOne({
      attributes: ["id"],
      where: { track_id: ticket_id },
      prefix,
    });
    return result.id;
  } catch (error) {
    console.log(error.message);
  }
};
