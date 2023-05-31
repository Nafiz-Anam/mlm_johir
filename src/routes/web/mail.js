import { Router } from "express";
const mail = require("../../controllers/web/mailController");
const router = Router();
const { validateReplyMail,validateSendMail, validate } = require("../../middleware/web/validateMail");


router.get("/inbox_mail_list", mail.getInboxMailList);
router.get("/inbox_mail", mail.viewSingleCompleteMail);
router.get("/mail_reply_data", mail.replyMailGetDetails);
router.post("/mail_reply", validateReplyMail(), validate, mail.replyMail);
router.get("/sent_mail_list", mail.sentMailList);
router.get('/sent_mail',mail.getSingleSentMail);
router.post('/mail_delete',mail.deleteMail);
router.get('/mail_compose_data',mail.getComposeData);
router.post('/mail_compose',validateSendMail(),validate,mail.sendMail);
router.get('/inbox_admin_mail_list',mail.getAdminMailList);

export default router;
