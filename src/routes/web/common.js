import { Router } from "express";
import authUnapprove from "../../middleware/web/authUnapproved";
const Common = require("../../controllers/web/commonController");
const router = Router();
const {
    validateVisitor,
    validate,
} = require("../../middleware/web/validateDemoVisitor");

router.get("/api_key", Common.getApiKey);
router.post("/check_token", Common.checkToken);
router.get("/app_info", Common.getAppInfo);
router.get("/getAllCountry", Common.getCountries);
router.post(
    "/add_new_demo_visitor",
    validateVisitor(),
    validate,
    Common.addNewDemoVisitor
);
// router.post("/verifyotp");
router.get(
    "/unapprovedDashboard",
    authUnapprove,
    Common.getUnapprovedDashboard
);
router.get("/logout", authUnapprove, Common.unapprovedLogOut);
router.post("/bankUpload", authUnapprove, Common.uploadReceipt);
router.get(
    "/generateWalletAddress",
    authUnapprove,
    Common.postGenerateWalletAddress
);
router.get("/ckeckPaymentStatus", authUnapprove, Common.getPaymentStatus);
router.get("/enrollNow", authUnapprove, Common.EnrollNow);
export default router;
