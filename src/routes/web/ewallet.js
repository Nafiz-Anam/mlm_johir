import { Router } from "express";
const ewallet = require("../../controllers/web/ewalletController");
// const ewallet = require("../../controllers/web/usdtWalletController");

const {
  validateFundTransfer,
  validate,
  validateSelfTransfer,
} = require("../../middleware/web/validateEwallet");
const router = Router();

router.get("/ewallet_statement_table", ewallet.getEwalletStatementTable);
router.get("/ewallet_history_table", ewallet.getEwalletHistoryTable);
router.get("/purchase_wallet_table", ewallet.getPurchaseWalletTable);
router.get("/user_earnings_table", ewallet.getUserEarningsTable);
router.get("/earnings_export_data", ewallet.getEarningExportData);
router.get("/ewallet_tile", ewallet.ewalletTile);
router.post(
  "/fund_transfer",
  validateFundTransfer(),
  validate,
  ewallet.fundTransfer
);
router.post(
  "/self_transfer",
  validateSelfTransfer(),
  validate,
  ewallet.bebwalletToUsdtWalletFundTrasnfer
);
router.post(
  "usdtToBebFundtransfer",
  validateSelfTransfer(),
  validate,
  ewallet.usdtToBebSelfTransfer
);
router.get("/checkIsSubaccount", ewallet.getSubAcountsParent);

router.get("/transferFromSubAccountToParent", ewallet.getsubAccountsData);

router.post("/transferFromSubAccountToParent", ewallet.parentAccountTransfer);
// router.post('/upload', ewallet.getUploadReciept)
router.get("/externelRecieve", ewallet.blockchainRecieve);

router.get("/checkPaymentStatus", ewallet.getPaymentStatus);

router.get("/getWalletData", ewallet.blockchainAccount);

export default router;
