import { Router } from "express";
const router = Router();
const payments = require("../../controllers/app/paymentController");
const { checkEpinValidity, validate } = require("../../middleware/app/validateEpin");
const {
  validatePurchaseWalletBalance,
} = require("../../middleware/app/validatePayout");
const { validateEwalletBalance } = require("../../middleware/app/validateEwallet");

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

router.get("/payment_methods", payments.getPaymentMethod);
router.post("/upload_payment_reciept", payments.uploadBankPaymentReceipt);


export default router;
