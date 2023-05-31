import { Router } from "express";
import {
  validatePersonalDetails,
  validateContactDetails,
  validateBankDetails,
  validateSettingDetails,
  validateChangePassword,
  validateChangeTransPassword,
  validatePaymentDetails,
  validate,
} from "../../middleware/web/validateUserProfile";
const profile = require("../../controllers/web/profileController");
const router = Router();

router.put(
  "/personalDetails",
  validatePersonalDetails(),
  validate,
  profile.updatePersonalDetails
);
router.put(
  "/contactDetails",
  validateContactDetails(),
  validate,
  profile.updateContactDetails
);
router.put(
  "/bankDetails",
  validateBankDetails(),
  validate,
  profile.updateBankDetails
);
router.put(
  "/settingstDetails",
  validateSettingDetails(),
  validate,
  profile.updateSettingsDetails
);
router.put(
  "/paymentMethod",
  validatePaymentDetails(),
  validate,
  profile.updatePaymentDetails
);
router.get("/upgrade_package", profile.getUpgradePackage);
router.put(
  "/password",
  validateChangePassword(),
  validate,
  profile.updatePassword
);
router.put(
  "/transaction_password",
  validateChangeTransPassword(),
  validate,
  profile.updateTransactionPassword
);
router.post("/image", profile.uploadProfilePic);
router.post("/kyc_file_uploads", profile.kycUploads);
router.get("/kyc_uploads", profile.getKycDetails);
router.get("/view", profile.getProfileView);
router.get("/image_delete", profile.deleteProfilePic);
router.get("/countryChange", profile.changeCountry);
router.get("/subscription_details", profile.subscriptionDetails);
router.post("/subscription", profile.subscription);
router.post("/remove_kyc", profile.removeKyc);
router.post("/forget_transaction_password", profile.forgetTransactionPassword);

export default router;
