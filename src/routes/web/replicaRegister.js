import { Router } from "express";
const ReplicaRegister = require("../../controllers/web/replicaRegisterController");
const router = Router();

router.get("/register", ReplicaRegister.getRegister);
router.post("/register_submit", ReplicaRegister.userRegister);
router.post("/check_leg_availability", ReplicaRegister.checkLegAvailability);
// router.get('/register',signup.getRegister)
router.get("/registration_preview", ReplicaRegister.getRegisterPreview);
router.get("/accound_details", ReplicaRegister.getBankAccountDetails);
router.post("/check_username", ReplicaRegister.checkUsername);
router.post(
  "/upload_payment_reciept",
  ReplicaRegister.uploadBankPaymentReceipt
);
router.get("/accound_details", ReplicaRegister.getBankAccountDetails);
router.get("/countryChange", ReplicaRegister.changeCountry);

export default router;
