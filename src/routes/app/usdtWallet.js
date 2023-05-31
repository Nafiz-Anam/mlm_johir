import { Router } from "express";
const usdtWallet = require("../../controllers/app/ewalletController");
const {
  validate,
  validateFundTransfer,
} = require("../../middleware/app/validateUsdtWallet");

const router = Router();

router.get("/usdtWalletTile", usdtWallet.ewalletTile);
router.get("/usdtWalletStatementTable", usdtWallet.getEwalletStatementTable);
router.get("/usdtWalletHistoryTable", usdtWallet.getEwalletHistoryTable);
router.get("/purchase_wallet_table", usdtWallet.getPurchaseWalletTable);
router.get("/userEarningsTable", usdtWallet.getUserEarningsTable);
router.get("/earnings_export_data", usdtWallet.getEarningExportData);
router.post(
  "/fund_transfer",
  validateFundTransfer(),
  validate,
  usdtWallet.fundTransfer
);
router.post(
  "/selfTransfer",
  validateFundTransfer(),
  validate,
  usdtWallet.bebwalletToUsdtWalletFundTrasnfer
);

export default router;
