const router = require("express").Router();
const partyController = require("../../controllers/app/partyController");
const {
  validateCreateHost,
  validateCreateGUest,
  validate,
} = require("../../middleware/app/validateParty");

router.get("/allHosts", partyController.getHosts);
router.post('/create_party',partyController.createParty)
router.post(
  "/createHost",
  validateCreateHost(),
  validate,
  partyController.createNewHost
);
router.get("/updateHost", partyController.viewSingleHost);
router.put(
  "/updateHost",
  validateCreateHost(),
  validate,
  partyController.updateHost
);
router.get("/allGuests", partyController.getGuests);
router.post(
  "/createGuest",
  validateCreateGUest(),
  validate,
  partyController.createNewGuest
);
router.get("/updateGuest", partyController.viewSingleGuest);
router.put(
  "/updateGuest",
  validateCreateGUest(),
  validate,
  partyController.updateGuest
);
router.get("/getAllCountry",partyController.getCountries);
router.post("/deleteGuest",partyController.deleteGuest);
router.post("/deleteHost",partyController.deleteHost);

module.exports = router;
