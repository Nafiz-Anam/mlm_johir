import { Router } from "express";
const dashboard = require("../../controllers/app/mobileController");
const router = Router()

router.get('/view',dashboard.getProfileView);
router.get('/register',dashboard.getMobRegister);
router.get('/network',dashboard.getNetwork);//true
router.get('/dashboard',dashboard.getDashboard);
//test
export default router;
