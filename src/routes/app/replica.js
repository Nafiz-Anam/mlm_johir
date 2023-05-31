import { Router } from "express";
const Replica = require('../../controllers/app/replicaController')
const router = Router()

router.get('/home',Replica.home)
router.get('/load_top_banner',Replica.loadTopBanner)
router.post('/contact',Replica.postContact)
router.get('/policy',Replica.policy)
router.post('/upload_payment_reciept',Replica.uploadBankPaymentReceipt);

export default router