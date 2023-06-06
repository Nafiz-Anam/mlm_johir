const db = require("../../models");
const { errorMessage } = require("../../utils/web/response");
const MailServices = require("../../utils/web/mailServices");
const modStatus = require("../../utils/web/moduleStatus");
const Common = require("../../utils/web/common");

exports.getInboxMailList = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id } = req.user;
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        if (!moduleStatus.mailbox_status) {
            let response = await errorMessage({ code: 1057 });
            return res.json(response);
        }
        const { offset, limit } = req.query;
        let filters = {
            offset: offset ? parseInt(offset) : 0,
            limit: limit ? parseInt(limit) : 10,
        };

        const mail_list = await MailServices.getAllMail(id, filters, prefix);
        let mail_count = await MailServices.countAllMail(id, prefix);
        const unread_count = mail_list.filter((obj) => {
            if (obj.read_msg == "no") {
                return true;
            }

            return false;
        }).length;
        return res.json({
            status: true,
            data: { mail_list, mail_count, unread_count },
        });
    } catch (err) {
        console.log(err);
        res.json(err.message);
    }
};

exports.viewSingleCompleteMail = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        if (!moduleStatus.mailbox_status) {
            let response = await errorMessage({ code: 1057 });
            return res.json(response);
        }
        const { id } = req.user;
        const msg_id = parseInt(req.query.msg_id);
        const { msg_type } = req.query;
        await MailServices.updateViewStatus(msg_id, msg_type, id, prefix);
        let result = await MailServices.getAllCorrespondingMail(
            msg_id,
            msg_type,
            id,
            prefix
        );
        if (result == null) {
            let response = await errorMessage({ code: 1048 });
            return res.json(response);
        }
        let response = { status: true, data: result };
        return res.json(response);
    } catch (err) {
        return res.status(500).json(err.message);
    }
};

exports.replyMailGetDetails = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id } = req.user;
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        if (!moduleStatus.mailbox_status) {
            let response = await errorMessage({ code: 1057 });
            return res.json(response);
        }
        const msg_id = parseInt(req.query.mail_id);
        if (!msg_id) {
            let response = await errorMessage({ code: 1048 });
            return res.json(response);
        }
        const details = await MailServices.getReplyDetails(msg_id, prefix);
        if (details == null) {
            let response = await errorMessage({ code: 1048 });
            return res.json(response);
        }
        return res.json({ status: true, data: details });
    } catch (err) {
        console.log(err);
        res.status(500).json(err.message);
    }
};

exports.replyMail = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        if (!moduleStatus.mailbox_status) {
            let response = await errorMessage({ code: 1057 });
            return res.json(response);
        }
        const { id } = req.user;
        const { subject, message } = req.body;
        const msg_id = parseInt(req.body.mail_id);
        const replyMail = await MailServices.replyMail(
            id,
            msg_id,
            subject,
            message,
            prefix
        );
        if (replyMail == false) {
            let response = await errorMessage({ code: 1047 });
            return res.json(response);
        }
        res.json({ status: true, data: "" });
    } catch (err) {
        console.log(err);
        res.status(500).json(err.message);
    }
};

exports.sentMailList = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        if (!moduleStatus.mailbox_status) {
            let response = await errorMessage({ code: 1057 });
            return res.json(response);
        }
        const { id } = req.user;
        const { offset, limit } = req.query;
        let filters = {
            offset: offset ? parseInt(offset) : 0,
            limit: limit ? parseInt(limit) : 10,
        };
        const mail_list = await MailServices.getSentMessages(
            id,
            filters,
            prefix
        );
        const mail_count = await MailServices.countAllSentMail(id, prefix);
        return res.json({ status: true, data: { mail_list, mail_count } });
    } catch (error) {
        console.log(error);
        res.status(500).json(error.message);
    }
};

exports.getSingleSentMail = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        if (!moduleStatus.mailbox_status) {
            let response = await errorMessage({ code: 1057 });
            return res.json(response);
        }
        const id = parseInt(req.query.id);
        const { type } = req.query;
        if (!id) {
            let response = await errorMessage({ code: 1048 });
            return res.json(response);
        }
        const result = await MailServices.getSIngleSentMail(id, type, prefix);
        return res.json({ status: true, data: [result] });
    } catch (error) {
        return res.status(500).json(error.message);
    }
};

exports.deleteMail = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        if (!moduleStatus.mailbox_status) {
            let response = await errorMessage({ code: 1057 });
            return res.json(response);
        }
        const { id } = req.user;
        const msgId = parseInt(req.body.delete_id);
        const { mail_type } = req.body;
        const deleted = await MailServices.deleteSingleMail(
            id,
            msgId,
            mail_type,
            prefix
        );
        if (deleted == false) {
        }
        return res.status(200).json({ status: true });
    } catch (error) {
        console.log(error);
        res.status(500).json(error.message);
    }
};

exports.getComposeData = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id } = req.user;
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        if (!moduleStatus.mailbox_status) {
            let response = await errorMessage({ code: 1057 });
            return res.json(response);
        }
        const sender_email = await Common.getEmailId(id, prefix);
        const downline_users = await MailServices.getDownLineUserForMail(
            id,
            prefix
        );
        const admin_username = await Common.getAdminUsername(prefix);
        return res.json({
            status: true,
            data: { sender_email, downline_users, admin_username },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json(err.message);
    }
};

exports.sendMail = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id } = req.user;
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        if (!moduleStatus.mailbox_status) {
            let response = await errorMessage({ code: 1057 });
            return res.json(response);
        }
        const requestBody = req.body;
        if (requestBody.type == "individual") {
            if (requestBody.user == null || requestBody.user == "") {
                let response = await errorMessage({ code: 1047 });
                return res.json(response);
            }
        }
        let response = await MailServices.sendMail(id, requestBody, prefix);
        if (response == false) {
            let response = await errorMessage({ code: 1047 });
            return res.json(response);
        }
        return res.status(200).json({ status: true });
    } catch (error) {
        console.log(error);
        res.status(500).json(error.message);
    }
};

exports.getAdminMailList = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id } = req.user;
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        if (!moduleStatus.mailbox_status) {
            let response = await errorMessage({ code: 1057 });
            return res.json(response);
        }
        const { offset, limit } = req.query;
        let filters = {
            offset: offset ? parseInt(offset) : 0,
            limit: limit ? parseInt(limit) : 10,
        };

        const mail_list = await MailServices.getAdminMailList(
            id,
            filters,
            prefix
        );
        let mail_count = await MailServices.countAllAdminMail(id, prefix);
        const unread_count = 0;
        return res.json({
            status: true,
            data: { mail_list, mail_count, unread_count },
        });
    } catch (err) {
        console.log(err);
        res.json(err.message);
    }
};
