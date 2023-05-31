import { Router } from "express";
const bebWallet = require("../../controllers/app/bebWalletController");
const {
  validate,
  validateFundTransfer,
} = require("../../middleware/app/validateUsdtWallet");
const router = Router();

router.get("/bebWalletTile", bebWallet.ewalletTile);
router.get("/bebWalletStatementTable", bebWallet.getEwalletStatementTable);
router.get("/bebWalletHistoryTable", bebWallet.getEwalletHistoryTable);
router.get("/purchase_wallet_table", bebWallet.getPurchaseWalletTable);
router.get("/userEarningsTable", bebWallet.getUserEarningsTable);
router.get("/earnings_export_data", bebWallet.getEarningExportData);
router.post(
  "/selfTransfer",
  validateFundTransfer(),
  validate,
  bebWallet.bebwalletToUsdtWalletFundTrasnfer
);
export default router;
