import { Router } from "express";
const Lcp = require('../../controllers/app/lcpContoller')
const router = Router()

router.post('/addLcp',Lcp.addLcp)


export default router