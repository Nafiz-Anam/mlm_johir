import { Router } from "express"
const Crm = require('../../controllers/web/crmController')
const router = Router()
const {validateAddFollowup,validateAddOrEditLead,validate} = require("../../middleware/web/validateCrm");

router.get('/crmTile',Crm.getCrmTiles)
router.get('/followup',Crm.getFollowup)
router.get('/viewLeads',Crm.getViewLeads)
router.get('/time_line',Crm.timeline)
router.post('/addNextFollowup',Crm.addNextFollowup)
router.post('/addLeads',validateAddOrEditLead(),validate,Crm.addLeads)
router.post('/addFollowup',Crm.addFollowup)
router.put('/editLeads/:id',validateAddOrEditLead(),validate,Crm.editLeads)
router.get('/graph',Crm.graph)


export default router