const router = require("express").Router();
const donation = require("../../controllers/web/donationController");

router.get("/recieve_donation_report",donation.receiveDonationReport);
router.get("/sent_donation_report",donation.sendDonationReport);
router.get("/donation_view",donation.donationView);
router.post("/donate_fund",donation.donate);

module.exports = router;