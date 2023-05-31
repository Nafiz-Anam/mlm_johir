import { Router } from "express";
const Payout = require("../../controllers/web/payoutController");
const payments = require("../../controllers/web/paymentController");
const {
  validatePayoutRequest,
  validate,
} = require("../../middleware/web/validatePayout");
const { validateEwalletBalance } = require("../../middleware/web/validateEwallet");
const {
  validatePurchaseWalletBalance,
} = require("../../middleware/web/validatePayout");
const router = Router();

router.post(
  "/payout_request",
  validatePayoutRequest(),
  validate,
  Payout.payoutRequest
);
router.get("/payout_request", Payout.payoutRequestGet);
router.post("/payout_request_cancelation", Payout.payoutRequestCancellation);
router.get("/rejected_list", Payout.getRejectedList);
router.get("/approved_paid_list", Payout.getApprovedPaidList);
router.get("/approved_pending_list", Payout.getApprovedPendingList);
router.get("/payout_tiles", Payout.getPayoutTiles);
router.get("/pending_list", Payout.getPendingList);
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

export default router;
