import { Router } from "express";
const authAccess = require("../../controllers/app/authController");
const router = Router();

router.post("/access", authAccess.getAccessToken);
router.get("/logout", authAccess.logOutAPI);
router.get("/validateString", authAccess.validateString);

router.post("/verifyOtp", authAccess.getVerifyQRCode);
router.post("/reset_otp", authAccess.resetGoogleOtp);
router.post("/password_forget", authAccess.forgetPassword);
router.post("/valid_user", authAccess.validUser);
router.post("/valid_user_email", authAccess.validEmail);
router.get("/reset_password", authAccess.validForgetKey);
router.post("/password_reset", authAccess.resetPassword);
router.get("/reset_tran_password", authAccess.validTransForgetKey);
router.post("/tran_password_reset", authAccess.resetTransPassword);
router.get("/validateTreeString", authAccess.validateTreeString);
router.get("/validateEmail", authAccess.emailVerification);
router.post("/create-payment-intent", authAccess.getPaymentGatewayKey);
export default router;
