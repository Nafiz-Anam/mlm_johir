import { Router } from "express";
const authAccess = require("../../controllers/web/authController");
const router = Router();

router.post("/access", authAccess.getAccessToken);
router.get("/logout", authAccess.logOutAPI);
router.post("/password_forget", authAccess.forgetPassword);
router.get("/reset_password", authAccess.validForgetKey);
router.post("/password_reset", authAccess.resetPassword);



router.get("/validateString", authAccess.validateString);
router.post("/verifyOtp", authAccess.getVerifyQRCode);
router.post("/reset_otp", authAccess.resetGoogleOtp);
router.post("/valid_user", authAccess.validUser);
router.post("/valid_user_email", authAccess.validEmail);
router.get("/reset_tran_password", authAccess.validTransForgetKey);
router.post("/tran_password_reset", authAccess.resetTransPassword);
router.get("/validateTreeString", authAccess.validateTreeString);
router.get("/validateEmail", authAccess.emailVerification);
router.post("/create-payment-intent", authAccess.getPaymentGatewayKey);


// checking
router.post("/pass_enc", authAccess.enc);

export default router;
