import { Router } from "express"
const epin = require('../../controllers/web/epinController')
import {validateEpinPurchase,validate,validateEpinRequest,validateEpinTransfer} from '../../middleware/web/validateEpin'
const router = Router()



router.get('/searchEpin',epin.getSearchEpin)
router.get('/epin_numbers',epin.getEpinNumbers)
router.get('/epin_amounts',epin.getEpinAmount)
router.get('/epin_tile',epin.getEpinTile)
router.get('/epin_list',epin.getEpinList)
router.get('/epin_transfer_history',epin.getEpinTransferHistory)
router.get('/epin_pending_requests',epin.getEpinPendingRequest)
router.post('/epin_refund',epin.epinRefund)
router.post('/epin_purchase',validateEpinPurchase(),validate,epin.epinPurchase)
router.post('/request_epin',validateEpinRequest(),validate,epin.epinRequest)
router.post('/epin_transfer',validateEpinTransfer(),validate,epin.epinTransfer)



export default router