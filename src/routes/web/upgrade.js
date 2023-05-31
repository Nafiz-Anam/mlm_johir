import { Router } from "express";
const router = Router();
const upgrade = require("../../controllers/web/upgradeController");
const {
  upgradePack,
  validate,
} = require("../../middleware/web/validateUpgradePackage");

router.post("/upgrade", upgradePack(), validate, upgrade.upgradePackage);

export default router;
