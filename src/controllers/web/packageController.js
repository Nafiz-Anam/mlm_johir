const { Op } = require("sequelize");
const db = require("../../models");
const modStatus = require("../../utils/web/moduleStatus");
const { errorMessage, successMessage } = require("../../utils/web/response");
const { mlm_laravel } = require("../../models");
const moment = require("moment");
const pack = db.pack;
const repurchaseCategory = db.repurchaseCategory;
const Cart = db.carts;
const Address = db.address;
const {
    getLoggedUserId,
    getDefaultAddress,
} = require("../../utils/web/getLoggedUserId");
const paymentGatewayConfig = db.paymentConfig;
const Order = db.orders;
const OrderDetails = db.orderDetails;
const { encrypt, decrypt } = require("../../middleware/web/encryption");
const CompanyDetails = db.companyDetails;
const Str = require("@supercharge/strings");
const { getAllLanguage } = require("../../utils/web/allLanguages");
const UploadServices = require("../../utils/web/uploadServices");
const RepurchaseServices = require("../../utils/web/repurchaseServices");
const EWalletServices = require("../../utils/web/ewalletServices");
const PurchaseServices = require("../../utils/web/purchaseServices");
const Common = require("../../utils/web/common");
const SignUpService = require("./signupController");
const PaymentGatewayServices = require("../../utils/web/paymentGatewayService");

exports.getRepurchaseProduct = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        var product = [];
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        if (!moduleStatus.repurchase_status && !moduleStatus.product_status) {
            let response = await errorMessage({
                code: 1057,
            });
            return response;
        }
        const products = await pack.findAll({
            attributes: ["id", "name", "product_id", "price", "image"],
            include: [
                {
                    model: repurchaseCategory,
                    attributes: ["name"],
                },
            ],
            where: {
                type: "repurchase",
                active: 1,
            },
            prefix,
        });
        Object.entries(products).map(([key, value]) => {
            if (value.img == null) {
                var image = "";
            } else {
                var image = `${process.env.ADMIN_URL}/uploads/product/${value.img}`;
            }
            product[key] = {
                id: value.id,
                product_id: value.product_id,
                name: value.name,
                category: value.repurchaseCategory.name,
                amount: value.price,
                image: image,
            };
        });

        let data = {
            products: product,
        };
        let response = await successMessage({
            value: data,
        });
        res.json(response);
    } catch (err) {
        return res.status(500).send({
            message: `${err}`,
        });
    }
};

exports.getRepurchaseProductDetails = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const userId = req.user.id;
        const { product_id } = req.query;
        // return res.json(req.params);
        const products = await pack.findOne({
            attributes: [
                "id",
                "name",
                "product_id",
                "price",
                "image",
                "pair_value",
                "description",
            ],
            include: [
                {
                    model: repurchaseCategory,
                    attributes: ["name"],
                },
            ],
            where: {
                [Op.and]: {
                    type: "repurchase",
                    active: "1",
                    id: product_id,
                },
            },
            prefix,
        });

        if (products == null) {
            let response = await errorMessage({ code: 403 });
            return res.json(response);
        }

        let productDetails = {
            id: products.id,
            prod_id: products.product_id,
            product_name: products.name,
            category: products.repurchaseCategory.name,
            amount: products.price,
            image: products.image ? products.image : "no",
            pair_value: products.pair_value,
            description: products.description,
        };

        const cartDetails = await Cart.findOne({
            where: {
                user_id: userId,
                package_id: product_id,
            },
            prefix,
        });

        let cart = {
            quantity: cartDetails ? cartDetails?.quantity : 0,
            rowid: cartDetails ? cartDetails.id : 0,
        };

        let data = {
            product: productDetails,
            cart: cart,
        };
        let response = await successMessage({
            value: data,
        });
        res.json(response);
    } catch (error) {
        let response = await errorMessage({
            code: 1051,
        });
        return res.status(422).json(response);
    }
};

exports.updateItem = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id } = req.user;
        var { row_id, quantity } = req.query;
        var quantity = parseInt(quantity);
        if (quantity < 1) {
            let response = await errorMessage({
                code: 1052,
            });
            return res.status(422).json(response);
        }
        if (quantity > 100) {
            return res.status(422).json({
                success: false,
                error: { description: "Quantity should be less than 100" },
            });
        }
        //TODO validation for quantity
        if (typeof quantity != "number") {
            let response = await errorMessage({
                code: 1053,
            });
            return res.status(422).json(response);
        }
        const cart = await Cart.findOne({
            where: {
                id: row_id,
            },
            prefix,
        });
        await cart.update(
            {
                quantity: quantity,
            },
            {},
            prefix
        );
        let response = await successMessage({ code: 200 });
        return res.json(response);
    } catch (error) {
        let response = await errorMessage({
            code: 1051,
        });
        return res.status(422).json(response);
    }
};

exports.addToCart = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const user_id = req.user.id;
        const { product_id, product_qty } = req.body;
        const package = await pack.findOne({
            where: {
                id: product_id,
            },
            prefix,
        });
        if (!package) {
            let response = await errorMessage({
                code: 1050,
            });
            return res.status(422).json(response);
        }
        const cart = await Cart.findOne({
            where: {
                package_id: product_id,
                user_id: user_id,
            },
            prefix,
        });
        if (cart) {
            let qnty = cart.quantity + 1;
            await cart.update(
                {
                    quantity: qnty,
                },
                {},
                prefix
            );
        } else {
            await Cart.create(
                {
                    user_id: user_id,
                    package_id: package.id,
                    quantity: product_qty,
                },
                { prefix }
            );
        }
        let response = await successMessage({
            code: 200,
        });
        res.json(response);
    } catch (err) {
        return res.status(422).json(err.message);
    }
};

exports.getCartItems = async (req, res) => {
    try {
        let total;
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        let userId = req.user.id;
        let data = {};
        const cart = await Cart.findAll({
            attributes: ["id", "quantity"],
            include: [
                {
                    model: pack,
                    attributes: ["id", "name", "price", "image"],
                },
            ],
            where: {
                user_id: userId,
            },
            prefix,
        });
        Object.entries(cart).map(([key, value]) => {
            total = value.quantity * value.pack.price;
            data[value.id] = {
                id: value.pack.id,
                name: value.pack.name,
                price: value.pack.price,
                prod_img: value.pack.image,
                qty: value.quantity,
                rowid: value.id,
                subtotal: total,
            };
        });
        let response = await successMessage({
            value: data,
        });
        res.json(response);
    } catch (err) {
        return res.json(err.message);
    }
};

exports.removeItem = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { row_id } = req.query;
        let userId = req.user.id;
        if (!row_id) {
            let response = await errorMessage({
                code: 1050,
            });
            return res.json(response);
        }
        const cart = await Cart.findOne({
            where: {
                id: row_id,
            },
            prefix,
        });
        if (row_id == "all") {
            await Cart.destroy({
                where: {
                    user_id: userId,
                },
                prefix,
            });
        } else {
            await cart.destroy({ prefix });
        }
        let response = await successMessage({
            code: 200,
        });
        return res.json(response);
    } catch (err) {
        return res.status(500).json(err.message);
    }
};

exports.getUserAddress = async (req, res) => {
    const prefix = req.headers["api-key"];
    if (!prefix) {
        let response = await errorMessage({ code: 1001 });
        return res.json(response);
    }
    const user_id = req.user.id;
    let addressdata = [];
    try {
        const userAddress = await Address.findAll({
            where: {
                user_id: user_id,
                deleted_at: null,
            },
            prefix,
        });
        Object.entries(userAddress).map(([key, value]) => {
            addressdata[key] = {
                id: value.id,
                user_id: value.user_id,
                name: value.name,
                address: value.address,
                pin: value.zip,
                town: value.city,
                mobile: value.mobile,
                default: value.is_default > 0 ? true : 0,
            };
        });
        return res.json({ status: true, data: { data: addressdata } });
    } catch (err) {
        return res.json(err.message);
    }
};

exports.removeAddress = async (req, res) => {
    const { addressId } = req.query;

    try {
        if (!addressId) {
            let response = await errorMessage({
                code: 1023,
            });
            return res.status(422).json(response);
        }
        const userAddress = await Address.findOne({
            where: {
                id: addressId,
            },
        });
        await userAddress.destroy();
        let response = await successMessage({
            code: 200,
        });
        res.json(response);
    } catch (error) {
        return res.json(err.message);
    }
};

exports.addCheckoutAddress = async (req, res) => {
    const prefix = req.headers["api-key"];
    if (!prefix) {
        let response = await errorMessage({ code: 1001 });
        return res.json(response);
    }
    const userId = req.user.id;
    const { name, address, zip_code, city, phone } = req.body;
    let t = await mlm_laravel.transaction();
    try {
        const previousDefaultAddr = await Address.findOne({
            where: {
                user_id: userId,
            },
            order: [["id", "DESC"]],
            prefix,
        });

        //TODO CHANGE ADDRESS IS DEFAULT VALUE TO INTEGER
        if (previousDefaultAddr) {
            await previousDefaultAddr.update(
                {
                    is_default: "0",
                },
                {
                    transaction: t,
                },
                prefix
            );
        }

        await Address.create(
            {
                name,
                address,
                user_id: userId,
                zip: zip_code,
                city,
                mobile: phone,
                is_default: "1",
            },
            {
                transaction: t,
                prefix,
            }
        );

        await t.commit();
        let response = await successMessage({
            code: 200,
        });
        res.json(response);
    } catch (err) {
        await t.rollback();
        return res.json(err.message);
    }
};

exports.changeDefaultAddress = async (req, res) => {
    let t = await mlm_laravel.transaction();
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const userId = req.user.id;
        const { address_id } = req.body;

        if (!userId) {
            let response = await errorMessage({
                code: 1002,
            });
            return res.json(response);
        }
        const previousDefaultAddr = await Address.findOne({
            where: {
                user_id: userId,
                is_default: "1",
            },
            prefix,
        });
        const newDefaultAddr = await Address.findOne({
            where: {
                user_id: userId,
                id: address_id,
            },
            prefix,
        });
        await previousDefaultAddr.update(
            {
                is_default: "0",
            },
            {
                transaction: t,
            },
            prefix
        );
        await newDefaultAddr.update(
            {
                is_default: "1",
            },
            {
                transaction: t,
            },
            prefix
        );
        await t.commit();
        let response = await successMessage({
            code: 200,
        });
        return res.json(response);
    } catch (err) {
        await t.rollback();
        return res.json(err.message);
    }
};

exports.removeAddres = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        let userId = req.user.id;
        const { address_id } = req.body;
        if (!address_id) {
            let response = await errorMessage({
                code: 1004,
            });
            return res.json(response);
        }

        const userAddress = await Address.findOne({
            where: {
                id: address_id,
                user_id: userId,
            },
            prefix,
        });

        if (!userAddress) {
            let response = await errorMessage({ code: 401 });
            return res.json(response);
        }
        await Address.destroy(
            {
                where: {
                    id: address_id,
                },
            },
            { prefix }
        );

        let response = await successMessage({
            code: 200,
        });
        return res.json(response);
    } catch (Err) {
        res.json(Err.message);
    }
};

exports.repurchaseSubmit = async (req, res) => {
    var t = await mlm_laravel.transaction();
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        let { username, id } = req.user;
        let postArray = req.body;
        let pinData = [],
            pinArray;
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        const cartDetails = await Cart.findAll({
            where: {
                user_id: id,
            },
            prefix,
        });
        if (cartDetails.length <= 0) {
            let response = await errorMessage({ code: 1026 });
            return res.json(response);
        }

        let amount = 0,
            totalpv = 0,
            singlePackageAmount = 0,
            order_status = "1",
            isPinOk = false,
            isEwalletOk = false,
            isFreeJOinOk = false,
            isBankTransferOk = false,
            isStripeOk = false,
            paymentType,
            isPwalletOk = false,
            pendingStatus = false,
            paymentStatus = false,
            stripeResponse;

        for await (const item of cartDetails) {
            let singlePackageDetail = await pack.findOne({
                where: {
                    id: item.package_id,
                },
                prefix,
            });
            totalpv += singlePackageDetail.bv_value;
            amount += singlePackageDetail.price * item.quantity;
        }
        //getting all repurchase payment methods
        const activeRepurchasePaymentMethod =
            await paymentGatewayConfig.findAll({
                where: {
                    status: 1,
                    repurchase: 1,
                },
                prefix,
            });

        //check whether payment method is present in active repurchase payment methods or not
        const findValue = (value) => {
            let objectResult = activeRepurchasePaymentMethod.find(
                (o) => o.name === value
            );
            return objectResult;
        };

        if (postArray.payment_method === "purchase_wallet") {
            if (!moduleStatus.purchase_wallet) {
                let response = await errorMessage({ code: 1036 });
                return res.json(response);
            }
            paymentType = await Common.getPaymentMethodId(
                "purchase-wallet",
                prefix
            );
            if (paymentType == false) {
                let response = await errorMessage({ code: 406 });
                return res.json(response);
            }
            let purchaseWalletUser = postArray.user_name;
            let purchaseWalletPassword = postArray.password;
            if (purchaseWalletUser != "") {
                if (purchaseWalletUser != username) {
                    let response = await errorMessage({ code: 1039 });
                    return res.json(response);
                }
            } else {
                let response = await errorMessage({ code: 1039 });
                return res.json(response);
            }
            if (purchaseWalletPassword != "") {
                const validatePurchaseWalletPassword =
                    await EWalletServices.checkEwalletPassword(
                        id,
                        purchaseWalletPassword,
                        prefix
                    );
                if (validatePurchaseWalletPassword == false) {
                    let response = await errorMessage({ code: 1039 });
                    return res.json(response);
                }
            }
            let purchaseWalletBalanceAmount =
                await PurchaseServices.getPurchaseWalletAmount(id, prefix);
            if (purchaseWalletBalanceAmount >= amount) {
                isPwalletOk = true;
            } else {
                let response = await errorMessage({ code: 1025 });
                return res.status(422).json(response);
            }
        }

        if (postArray.payment_method === "ewallet") {
            let freePurchaseResult = findValue("E-wallet");
            if (!freePurchaseResult.repurchase) {
                let response = await errorMessage({ code: 1036 });
                return res.json(response);
            }
            paymentType = await Common.getPaymentMethodId("e-wallet", prefix);
            if (paymentType == false) {
                let response = await errorMessage({ code: 406 });
                return res.json(response);
            }
            let ewalletUser = postArray.user_name;
            let ewalletPassword = postArray.password;
            if (ewalletUser != "") {
                if (ewalletUser != username) {
                    let response = await errorMessage({ code: 1039 });
                    return res.json(response);
                }
            } else {
                let response = await errorMessage({ code: 1039 });
                return res.json(response);
            }

            if (ewalletPassword != "") {
                const validatePurchaseWalletPassword =
                    await EWalletServices.checkEwalletPassword(
                        id,
                        ewalletPassword,
                        prefix
                    );
                if (validatePurchaseWalletPassword == false) {
                    let response = await errorMessage({ code: 1039 });
                    return res.json(response);
                }
            }
            let eWalletBalanceAmount =
                await PurchaseServices.getPurchaseWalletAmount(id, prefix);
            if (eWalletBalanceAmount >= amount) {
                isEwalletOk = true;
            } else {
                let response = await errorMessage({ code: 1014 });
                return res.json(response);
            }
        }

        if (postArray.payment_method === "freejoin") {
            let freePurchaseResult = findValue("Free Joining");
            if (!freePurchaseResult.repurchase) {
                let response = await errorMessage({ code: 1036 });
                return res.json(response);
            }
            paymentType = await Common.getPaymentMethodId(
                "free-joining",
                prefix
            );
            if (paymentType == false) {
                let response = await errorMessage({ code: 406 });
                return res.json(response);
            }
            isFreeJOinOk = true;
        }

        if (postArray.payment_method === "banktransfer") {
            let freePurchaseResult = findValue("Bank Transfer");
            if (!freePurchaseResult.repurchase) {
                let response = await errorMessage({ code: 1036 });
                return res.json(response);
            }
            paymentType = await Common.getPaymentMethodId(
                "bank-transfer",
                prefix
            );
            if (paymentType == false) {
                let response = await errorMessage({ code: 406 });
                return res.json(response);
            }
            isBankTransferOk = true;
        }

        if (postArray.payment_method === "epin") {
            let freePurchaseResult = findValue("E-pin");
            if (!freePurchaseResult.repurchase) {
                let response = await errorMessage({ code: 1036 });
                return res.json(response);
            }
            paymentType = await Common.getPaymentMethodId("e-pin", prefix);
            if (paymentType == false) {
                let response = await errorMessage({ code: 406 });
                return res.json(response);
            }
            let epinDetails = postArray.epin;
            for await (let [key, value] of Object.entries(epinDetails)) {
                pinData[key] = {
                    pin: value,
                    amount: 0,
                };
                pinArray = await RepurchaseServices.validateAllEpins(
                    pinData,
                    amount,
                    id,
                    prefix
                );

                if (Object.values(pinArray).indexOf("nopin") > -1) {
                    let response = await errorMessage({ code: 1016 });
                    return res.status(500).json(response);
                }

                //checking for duplicate pin
                var valueArr = pinArray.map(function (item) {
                    return item.pin;
                });
                var isDuplicate = valueArr.some(function (item, idx) {
                    return valueArr.indexOf(item) != idx;
                });
                if (isDuplicate) {
                    let response = await errorMessage({ code: 1055 });
                    return res.status(500).json(response);
                }
                isPinOk = true;
            }
        }

        if (postArray.payment_method === "stripe") {
            let freePurchaseResult = findValue("Stripe");
            if (!freePurchaseResult.repurchase) {
                let response = await errorMessage({ code: 1036 });
                return res.json(response);
            }
            const description = "Repurchase";
            stripeResponse = await PaymentGatewayServices.stripePayment(
                postArray.stripe_token,
                amount,
                description
            );
            if (stripeResponse == false) {
                let response = await errorMessage({ code: 429 });
                return res.status(500).json(response);
            }
            paymentType = await Common.getPaymentMethodId("stripe", prefix);
            if (paymentType == false) {
                let response = await errorMessage({ code: 406 });
                return res.json(response);
            }
            isStripeOk = true;
        }
        const defaultAddressId = await getDefaultAddress(id, prefix);

        if (isBankTransferOk) {
            paymentStatus = true;
            order_status = "0";
            pendingStatus = true;
        }

        if (isFreeJOinOk) {
            paymentStatus = true;
        }

        if (isPwalletOk) {
            let transactionId = await Common.createUniqueTransaction(prefix, t);
            let insertHistory =
                await PurchaseServices.insertPurchasewalletHistory(
                    id,
                    id,
                    amount,
                    amount,
                    "repurchase",
                    "debit",
                    0,
                    transactionId,
                    0,
                    prefix,
                    t
                );
            if (insertHistory == false) {
                let response = await errorMessage({ code: 1030 });
                return res.json(response);
            } else {
                let deductBalance =
                    await PurchaseServices.deductFromPurchaseWallet(
                        id,
                        amount,
                        prefix,
                        t
                    );
                if (deductBalance == false) {
                    let response = await errorMessage({ code: 1030 });
                    return res.json(response);
                } else {
                    paymentStatus = true;
                }
            }
        }

        if (isEwalletOk) {
            let transactionId = await Common.createUniqueTransaction(prefix, t);

            let insertUsedEwallet = await SignUpService.insertUsedEwallet(
                id,
                id,
                amount,
                eWalletBalanceAmount,
                transactionId,
                "repurchase",
                t,
                prefix
            );
            if (insertUsedEwallet == false) {
                let response = await errorMessage({ code: 1030 });
                return res.json(response);
            } else {
                let deductBalance =
                    await PurchaseServices.deductFromPurchaseWallet(
                        id,
                        amount,
                        prefix,
                        t
                    );
                if (deductBalance == false) {
                    let response = await errorMessage({ code: 1030 });
                    return res.json(response);
                } else {
                    paymentStatus = true;
                }
            }
        }

        if (isPinOk) {
            let resp = await RepurchaseServices.UpdateUsedEpin(
                pinArray,
                id,
                "repurchase",
                prefix,
                t
            );
            if (resp) {
                paymentStatus = true;
                //TODO Insert used epin
                // let insertIntoUsedPin = await RepurchaseServices.insertUsedPin(
                //   pinArray,
                //   id,
                //   method,
                //   prefix,
                //   t
                // );
            } else {
                let response = await errorMessage({ code: 429 });
                return res.status(500).json(response);
            }
        }

        const randomINvoiceNumber = Str.random(12);
        let newInvoiceNumber = "RPCHSE" + randomINvoiceNumber;
        //TODO -- Change payment method value from string to it's id
        const newPackage = await Order.create(
            {
                user_id: id,
                invoice_no: newInvoiceNumber,
                order_address_id: defaultAddressId,
                order_date: new Date(),
                total_amount: amount,
                total_pv: totalpv,
                order_status,
                payment_method: paymentType,
            },
            { transaction: t, prefix }
        );

        if (isStripeOk) {
            const insertHistory =
                await PaymentGatewayServices.insertInToStripePaymentActivity(
                    id,
                    stripeResponse,
                    null,
                    newPackage.id,
                    amount,
                    "Repurchase",
                    prefix,
                    t
                );
            if (insertHistory == true) {
                paymentStatus = true;
            } else {
                let response = await errorMessage({ code: 429 });
                return res.status(500).json(response);
            }
        }

        for await (const item of cartDetails) {
            let singlePackageDetail = await pack.findOne({
                where: {
                    id: item.package_id,
                },
                prefix,
            });
            singlePackageAmount = item.quantity * singlePackageDetail.price;
            await OrderDetails.create(
                {
                    order_id: newPackage.id,
                    package_id: item.package_id,
                    quantity: item.quantity,
                    amount: singlePackageAmount,
                    product_pv: singlePackageDetail.pair_value,
                    order_status,
                },
                { transaction: t, prefix }
            );
        }

        let encryptedid = encrypt(`${newPackage.id}`);

        await Cart.destroy({
            where: {
                user_id: id,
            },
            transaction: t,
            prefix,
        }).then((res) => {});
        let data = {
            invoice_no: newInvoiceNumber,
            enc_order_id: encryptedid,
            pending: order_status ? true : false,
        };
        if (!pendingStatus) {
            let updateUserPV = await UploadServices.updateUserPV(
                cartDetails,
                amount,
                id,
                defaultAddressId,
                order_status,
                postArray.payment_method,
                moduleStatus,
                t,
                prefix
            );
            if (!updateUserPV) {
                let response = await errorMessage({ code: 403 });
                return res.json(response);
            }
        } else if (pendingStatus) {
            await t.commit();
        }
        return res.json({ status: true, data });
    } catch (err) {
        await t.rollback();
        console.log(err);
        res.json(err.message);
    }
};

exports.getInvoice = async (req, res) => {
    const prefix = req.headers["api-key"];
    if (!prefix) {
        let response = await errorMessage({ code: 1001 });
        return res.json(response);
    }
    const { id } = req.query;
    const user_id = req.user.id;
    try {
        let product_details = [];
        let idFromParams = id.replace(/%3A/g, ":");
        let decryptedId = Number(decrypt(idFromParams));

        let defaultAddressDetails = await Address.findOne({
            attributes: [
                "name",
                "address",
                "zip",
                "city",
                "mobile",
                "id",
                "user_id",
                "is_default",
            ],
            where: {
                is_default: "1",
                user_id,
            },
            prefix,
        });

        let correctedAddressFormat = {
            name: defaultAddressDetails.name,
            address: defaultAddressDetails.address,
            pin: defaultAddressDetails.zip,
            town: defaultAddressDetails.city,
            mobile: defaultAddressDetails.mobile,
            id: defaultAddressDetails.id,
            user_id: defaultAddressDetails.user_id,
        };

        const orderResult = await Order.findOne({
            where: {
                id: decryptedId,
            },
            prefix,
        });

        let orderDetailsResult = await OrderDetails.findAll({
            attributes: ["quantity", "amount"],
            where: {
                order_id: decryptedId,
            },
            include: {
                model: pack,
                attributes: ["name", "price"],
            },
            prefix,
        });

        Object.entries(orderDetailsResult).map(([key, value]) => {
            product_details[key] = {
                product_name: value.pack.name,
                product_amount: value.pack.price,
                quantity: value.quantity,
                amount: value.amount,
            };
        });

        const languages = await getAllLanguage(prefix);

        let defaultLanguage = languages.find((o) => o.default === true);

        const companyInfoResult = await CompanyDetails.findOne({ prefix });
        let companyInfo = {
            id: companyInfoResult.id,
            company_name: companyInfoResult?.name,
            logo: companyInfoResult?.logo,
            email: companyInfoResult?.email,
            phone: companyInfoResult?.phone,
            favicon: companyInfoResult?.favicon,
            company_address: companyInfoResult?.address,
            default_lang: defaultLanguage,
            admin_theme_folder: "",
            user_theme_folder: "",
            fb_link: companyInfoResult?.fb_link,
            twitter_link: companyInfoResult?.twitter_link,
            inst_link: companyInfoResult?.insta_link,
            gplus_link: companyInfoResult?.gplus_link,
            fb_count: companyInfoResult?.fb_count,
            twitter_count: 0,
            inst_count: companyInfoResult?.insta_count,
            gplus_count: companyInfoResult?.gplus_count,
            logo_shrink: companyInfoResult?.logo_shrink,
        };
        return res.json({
            status: true,
            data: {
                product_details,
                order_date: orderResult.order_date,
                invoice_no: orderResult.invoice_no,
                address: correctedAddressFormat,
                companyInfo,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(422).json(err.message);
    }
};

exports.getpurchaseReport = async (req, res) => {
    try {
        const { start, length, start_date, end_date } = req.query;
        const user_id = req.user.id;
        var purchseReport = [];
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        if (!moduleStatus.repurchase_status && !moduleStatus.product_status) {
            let response = await errorMessage({
                code: 1057,
            });
            return response;
        }
        let filters = {
            start: start ? parseInt(start) : 0,
            length: length ? parseInt(length) : 10,
        };
        let purchaseReport = await Order.findAll({
            attributes: [
                "invoice_no",
                "total_amount",
                "payment_method",
                "order_date",
            ],
            where: {
                order_status: "1",
                user_id: user_id,
                order_date: {
                    [Op.between]: [
                        (fromDate = moment(start_date).format(
                            "YYYY-MM-DD 00:00:00"
                        )),
                        moment(end_date).format("YYYY-MM-DD 23:59:59"),
                    ],
                },
            },
            offset: filters.start,
            limit: filters.length,
            prefix,
        });

        for await (let [key, value] of Object.entries(purchaseReport)) {
            let paymentmethod = await Common.getPaymentMethodName(
                value.payment_method,
                prefix
            );
            purchseReport[key] = {
                invoice_no: value.invoice_no,
                amount: value.total_amount,
                payment_method: await changePaymentMethod(paymentmethod),
                purchase_date: moment(value.order_date).format(
                    "MMMM Do YYYY, h:mm:ss a"
                ),
            };
        }
        data = {
            total_row: purchseReport.length,
            data: purchseReport,
        };
        return res.json({
            status: true,
            data,
        });
    } catch (err) {
        res.json(err.message);
    }
};

const changePaymentMethod = async (data) => {
    let code;
    switch (data) {
        case "Paypal":
            code = "paypal";
            break;
        case "Authorize.Net":
            code = "authorize";
            break;
        case "Bitcoin":
            code = "bitcoin";
            break;
        case "Blockchain":
            code = "blockchain";
            break;
        case "Bitgo":
            code = "bitgo";
            break;
        case "Payeer":
            code = "payeer";
            break;
        case "Sofort":
            code = "sofort";
            break;
        case "SquareUp":
            code = "squareup";
            break;
        case "E-pin":
            code = "epin";
            break;
        case "E-wallet":
            code = "ewallet";
            break;
        case "Bank Transfer":
            code = "banktransfer";
            break;
        case "Free Joining":
            code = "freejoin";
            break;
        case "Stripe":
            code = "stripe";
            break;
        default:
            break;
    }
    return code;
};
