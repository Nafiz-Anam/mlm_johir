import { Router } from "express";
const Ticket = require('../../controllers/app/ticketController')
const router = Router()

router.get('/tickets',Ticket.getTickets)
router.post('/tickets',Ticket.tickets)
router.get('/ticket_time_line/:id',Ticket.ticketTimeline)
router.get('/filters',Ticket.filters)
router.get('/ticket_details/:id',Ticket.ticketDetails)
router.post('/save_ticket/:id',Ticket.saveTicket)



export default router