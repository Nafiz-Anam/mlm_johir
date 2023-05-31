import { Router } from "express";
const {
  registerValidation,
  validate,
} = require("../../middleware/web/validateRegistration");
const signup = require("../../controllers/web/signupController");
const router = Router();

router.post("/register_submit", registerValidation(), validate, signup.userRegister);
router.post("/check_leg_availability", signup.checkLegAvailability);
router.get("/check_leg_availability", signup.getCheckLegAvailability);
router.get("/register", signup.getRegister);
router.get("/registration_preview", signup.getRegisterPreview);
router.get("/accound_details", signup.getBankAccountDetails);
router.post("/check_username", signup.checkUsername);
router.get("/validate_username", signup.validateUsername);

// router.post("/subAccountCreation", signup.postSubAccountCreation);
router.get("/userdetails", signup.getuserDetails);
router.get("/getpackageList", signup.getUserPackageDetails);

export default router;
