import { Router } from "express";
const packages = require("../../controllers/app/packageController");
const {
  validateNewAddress,
  validateAddToCart,
  validate,
} = require("../../middleware/app/validatePackage");
const router = Router();

router.get("/repurchase_product", packages.getRepurchaseProduct);
router.get("/repurchase_product_details", packages.getRepurchaseProductDetails);
router.get("/updateItem", packages.updateItem);
router.get("/getCartItems", packages.getCartItems);
router.get("/getUserAddress", packages.getUserAddress);
router.post("/add_to_cart", validateAddToCart(), validate, packages.addToCart);
router.post(
"/add_checkout_address",
  validateNewAddress(),
  validate,
  packages.addCheckoutAddress
);
router.post("/RemoveAddress", packages.removeAddres);
router.post("/change_default_address", packages.changeDefaultAddress);
router.get("/removeItems", packages.removeItem);
router.post("/repurchase_submit", packages.repurchaseSubmit);
router.get("/purchase_invoice", packages.getInvoice);
router.get("/purchaseReport", packages.getpurchaseReport);
export default router;
