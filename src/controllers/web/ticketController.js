const db = require("../../models");
const { mlm_laravel } = require("../../models");
const { successMessage, errorMessage } = require("../../utils/web/response");
const ticketService = require("../../utils/web/ticketService");
const ticketUpload = require("../../middleware/web/ticketUpload");
const uploadService = require("../../utils/web/uploadServices");
const common = require("../../utils/web/common");
const multer = require("multer");
const fs = require("fs");
const TicketCategories = db.ticketCategories;
const { join } = require("path");

exports.getTickets = async (req, res) => {
  const prefix = req.headers["api-key"];
  if (!prefix) {
    let response = await errorMessage({ code: 1001 });
    return res.json(response);
  }
  const id = req.user.id;
  let query = req.query;
  try {
    let tickets = await ticketService.ticketsGet(id, query, prefix);
    let faqs = await ticketService.faqsGet(prefix);
    let data = {
      tickets: tickets,
      faqs: faqs,
    };
    let response = await successMessage({ value: data });
    return res.json(response);
  } catch (error) {
    return res.json(error.message);
  }
};

exports.tickets = async (req, res) => {
  var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  let fileDetails = {};
  const id = req.user.id;
  let t = await mlm_laravel.transaction();
  try {
    await ticketUpload(req, res, async function (err) {
      if (err != undefined) {
        if (err instanceof multer.MulterError) {
          if (err.code == "LIMIT_FILE_SIZE") {
            let response = await errorMessage({ code: 1018 });
            return res.status(500).json(response);
          }
        } else if (err) {
          // An unknown error occurred when uploading.
          if (err.message == "Only images jpg|jpeg|png|pdf are allowed") {
            let response = await errorMessage({ code: 1017 });
            return res.status(500).json(response);
          } else {
            let response = await errorMessage({ code: 1024 });
            return res.status(500).json(response);
          }
        }
      } else {
        let postArr = req.body;
        const prefix = req.headers["api-key"];
        if (!prefix) {
          let response = await errorMessage({ code: 1001 });
          return res.json(response);
        }
        let track_id = await ticketService.createTicketId(prefix);
        if (
          postArr.category == "" ||
          postArr.subject == "" ||
          postArr.priority == "" ||
          postArr.message_to_admin == ""
        ) {
          let response = await errorMessage({ code: 1004 });
          return res.json(response);
        }
        let tickets = {
          trackId: track_id,
          subject: postArr.subject,
          user_id: id,
          message: postArr.message_to_admin,
          category: postArr.category,
          priority: postArr.priority,
          file_name: req.file?.filename
            ? `${process.env.image_url}tickets/${req.file.filename}`
            : "",
        };

        await TicketCategories.increment("ticket_count", {
          by: 1,
          where: {
            id: postArr.category,
          },
          prefix,
        });
        let data = {
          upload_data: {
            file_name: tickets.file_name,
          },
        };

        let docFilename = data.upload_data.file_name;

        let newTicket = await ticketService.createNewTicket(
          id,
          tickets,
          ip,
          t,
          prefix
        );

        if (newTicket.true) {
          await ticketService.incrementCategoryCount(
            tickets.category,
            t,
            prefix
          );
        }
        let replyTicket = await ticketService.replyTicket(
          newTicket.id,
          tickets.message,
          tickets.user_id,
          docFilename,
          t,
          prefix
        );
        if (newTicket && replyTicket) {
          // User activity
          let result = await ticketService.insertToHistory(
            newTicket.id,
            id,
            "user",
            "Ticket created",
            0,
            t,
            prefix
          );
          let dataArr = JSON.stringify(postArr);
          await common.insertUserActivity(
            "Ticket created",
            id,
            "Ticket created by user",
            dataArr,
            t,
            ip,
            prefix
          );
          if (result) {
            await t.commit();
            // let response = await successMessage({ code: 200 });
            return res.json({ status: true, data: "" });
          } else {
            await t.rollback();
            let response = await errorMessage({ code: 1004 });
            return res.status(500).json(response);
          }
        } else {
          await t.rollback();
          let response = await errorMessage({ code: 1004 });
          return res.status(500).json(response);
        }
      }
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ status: false, data: "Some Error Occured" });
  }
};

exports.ticketTimeline = async (req, res) => {
  const ticket_id = req.params.id;
  const prefix = req.headers["api-key"];
  if (!prefix) {
    let response = await errorMessage({ code: 1001 });
    return res.json(response);
  }
  try {
    let activityHistory = await ticketService.getTicketActivityHistory(
      ticket_id,
      prefix
    );
    let response = await successMessage({ value: activityHistory });
    return res.json(response);
  } catch (error) {
    return res.json(error.message);
  }
};

exports.filters = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    let filters = {
      categories: await ticketService.getAllTicketCategory(prefix),
      statuses: await ticketService.getAllTicketStatus(prefix),
      priorities: await ticketService.getAllTicketPriority(prefix),
    };
    let data = {
      filters: filters,
    };
    let response = await successMessage({ value: data });
    return res.json(response);
  } catch (error) {
    return res.json(error.message);
  }
};

exports.ticketDetails = async (req, res) => {
  const prefix = req.headers["api-key"];
  let ticket_id = req.params.id;
  if (!prefix) {
    let response = await errorMessage({ code: 1001 });
    return res.json(response);
  }
  try {
    const user_id = req.user.id;
    let details = await ticketService.getTicketData(ticket_id, user_id, prefix);
    let replies = await ticketService.getAllReply(details.id, prefix);

    replies.map((value) => {
      const oldImageUrl = join(
        __dirname,
        "/../../uploads/images/profilePic/",
        value.profile_pic ? value.profile_pic : ""
      );
      if (
        value.profile_pic == null ||
        value.profile_pic == "NULL" ||
        value.profile_pic == ""
      ) {
        var profilePic = "";
      } else {
        var profilePic = value.image;
      }
      value.profile_pic = profilePic;
      if (value.attachments !== "") {
        value.attachments = value.attachments;
      }
    });
    let data = {
      details: details,
      ticket_replies: replies,
    };
    let response = await successMessage({ value: data });
    return res.json(response);
  } catch (error) {
    console.log(error);
    return res.json(error.message);
  }
};

exports.saveTicket = async (req, res) => {
  const id = req.user.id;
  const ticket_id = req.params.id;
  try {
    await ticketUpload(req, res, async function (err) {
      if (err != undefined) {
        if (err instanceof multer.MulterError) {
          if (err.code == "LIMIT_FILE_SIZE") {
            let response = await errorMessage({ code: 1018 });
            return res.status(500).json(response);
          }
        } else if (err) {
          // An unknown error occurred when uploading.
          if (err.message == "Only images jpg|jpeg|png|pdf are allowed") {
            let response = await errorMessage({ code: 1017 });
            return res.status(500).json(response);
          } else {
            let response = await errorMessage({ code: 1024 });
            return res.status(500).json(response);
          }
        }
      } else {
        let { message } = req.body;
        const prefix = req.headers["api-key"];
        let t = await mlm_laravel.transaction();
        if (message.trim() == "") {
          let response = await errorMessage({ code: 1004 });
          return res.status(422).json(response);
        }
        if (!prefix) {
          let response = await errorMessage({ code: 1001 });
          return res.json(response);
        }
        if (req.file) {
          await uploadService.updateUploadCount(id, prefix);
          let data = {
            upload_data: {
              file_name: `${process.env.image_url}tickets/${req.file.filename}`,
            },
          };
          var docFilename = data.upload_data.file_name;
        }
        let ticket = await ticketService.getTicketId(ticket_id, prefix);
        let reply = await ticketService.replyTicket(
          ticket,
          message,
          id,
          docFilename,
          t,
          prefix
        );
        if (reply) {
          let data = {
            ticket_id: ticket_id,
            message: message,
            upload_file: req.file?.filename ? req.file.filename : "",
          };
          let dataArr = JSON.stringify(data);
          //  await common.insertUserActivity('Ticket Reply Sent',id,dataArr,t,prefix)
          let replyToUser = await common.getAdminUsername(prefix);
          let activity = `Reply send to ${replyToUser}`;

          let result = await ticketService.insertToHistory(
            ticket,
            id,
            "user",
            activity,
            message,
            t,
            prefix
          );
          if (result) {
            await t.commit();
            let response = await successMessage({ code: 200 });
            return res.json(response);
          } else {
            let response = await errorMessage({ code: 1004 });
            return res.json(response);
          }
        } else {
          let response = await errorMessage({ code: 1004 });
          return res.json(response);
        }
      }
    });
  } catch (error) {
    return res.json(error.message);
  }
};
