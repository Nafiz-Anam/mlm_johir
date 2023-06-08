import { Router } from "express";
const router = Router();
const payments = require("../../controllers/web/paymentController");
const { checkEpinValidity, validate } = require("../../middleware/web/validateEpin");
const {
  validatePurchaseWalletBalance,
} = require("../../middleware/web/validatePayout");
const { validateEwalletBalance } = require("../../middleware/web/validateEwallet");

router.get("/payment_methods", payments.getPaymentMethod);
router.post("/upload_payment_reciept", payments.uploadBankPaymentReceipt);
router.post("/check_epin_validity", payments.checkEpinValidity);
router.post(
  "/check_ewallet_balance",
  validateEwalletBalance(),
  validate,
  payments.checkEwalletBalance
);
router.post(
  "/check_purchase_wallet_balance",
  validatePurchaseWalletBalance(),
  validate,
  payments.checkPurchaseWalletBalance
);

// router.get("/payment_methods", payments.getPaymentMethod);
// router.post("/upload_payment_reciept", payments.uploadBankPaymentReceipt);


export default router;
