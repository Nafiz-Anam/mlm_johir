import { Router } from "express"
const tools = require('../../controllers/web/toolsController')
const router = Router()

router.get('/all_news',tools.getAllNews)
router.get('/view_news',tools.getViewNews)
router.get('/faq',tools.getFaqs)

router.get('/replica_banner',tools.getReplicaBanner)
router.post('/replica_banner',tools.replicaBanner)
router.get('/leads',tools.getLeads)
router.put('/leads/:id',tools.leads)
router.get('/download_product',tools.downloadProduct)
router.get('/invites_emails',tools.inviteEmails)

export default router