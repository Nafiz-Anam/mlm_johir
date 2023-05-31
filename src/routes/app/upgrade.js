import { Router } from "express";
const router = Router();
const upgrade = require("../../controllers/app/upgradeController");
const {
  upgradePack,
  validate,
} = require("../../middleware/app/validateUpgradePackage");

router.post("/upgrade", upgradePack(), validate, upgrade.upgradePackage);

export default router;
