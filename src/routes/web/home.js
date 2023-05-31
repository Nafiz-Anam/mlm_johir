import { Router } from "express";
const home = require("../../controllers/web/homeController");
const router = Router();

router.get("/app_layout", home.getAppLayout);
router.get("/dashboard", home.getDashboard);
router.get("/dashboard_tile", home.getDashboard1);
router.get("/latest_members", home.getDashboardSection2);
router.get("/earnings", home.getDashboardSection3);
router.get("/notifications", home.getNotifications);
router.post("/set_default_currency", home.setDefaultCurrency);
router.get("/graphFilter", home.getGraphFilter);
router.get("/tileFilter", home.getTileFilter);
router.post("/set_default_language", home.setDefaultLanguage);
router.get("/gotoStore", home.goToStore);
router.get("/chckeDemo", home.checkDemo);
router.get("/LiveValueUpdate", home.getLiveValueUpdate);

export default router;
