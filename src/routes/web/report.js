import { Router } from "express";
const report = require("../../controllers/web/reportController");
const joinReport = require("../../controllers/web/joinReportController");

const router = Router();

router.get("/epinTransferReport", report.getEpinTransferReport);
router.get("/commissionReport", report.getCommissionReport);
router.get("/commissionReportExport", report.getCommissionReportExport);
router.get("/joinReport", joinReport.joiningReport);
router.get("/joinReportExport", joinReport.joiningReportExport);

export default router;
