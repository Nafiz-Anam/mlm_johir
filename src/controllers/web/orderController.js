const { Op } = require("sequelize");
const db = require("../../models");
const OcOrderProduct = db.ocOrderProduct;
const OcOrders = db.ocOrders;
const OcOrderHistory = db.ocOrderHistory;
const Common = require("../../utils/web/common");

exports.getOrderHistory = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id, username } = req.user;
        const ecomRefId = await Common.getEcomCustomerRefId(id, prefix);
        if (ecomRefId == 0) {
            return res.status(422).json({ status: false });
        }
        let orderDetails = [];
        const Orders = await OcOrders.findAll({
            include: [
                {
                    model: OcOrderHistory,
                    where: {
                        order_status_id: 1,
                    },
                },
            ],
            where: {
                customer_id: ecomRefId,
                // order_type: {
                //   [Op.ne]: "register",
                // },
            },
            prefix,
        });
        console.log(
            `************************************** order goes here ******************************`
        );
        const totalOrder = Orders.length;
        for await (let [key, item] of Object.entries(Orders)) {
            console.log(`order details goes here ${JSON.stringify(item)}`);
            let modelDetails =
                await Common.getOcModelNameAndPairValueFromUserId(id, prefix);
            let orderQuantity = await Common.getOcOrderQuantity(
                item.order_id,
                prefix
            );
            let products = await Common.getOCOrderProductsFromOrderId(
                item.order_id,
                prefix
            );
            let price = products.map(({ price }) => Number(price));
            let total_price = products.map(
                (a) => Number(a.price) * Number(a.quantity)
            );
            orderDetails[key] = {
                date_added: new Date(item.date_added).toLocaleDateString(),
                order_id: item.order_id,
                order_id_with_prefix: item.order_id,
                firstname: item.shipping_firstname
                    ? item.shipping_firstname
                    : "",
                payment_method: item.payment_method ? item.payment_method : "",
                lastname: item.shipping_lastname ? item.shipping_lastname : "",
                customer_name: `${item.shipping_firstname} ${item.shipping_lastname}`,
                total: item.total,
                currency_value: item.currency_value,
                full_name: await Common.getUserFullName(id, prefix),
                user_name: username,
                quantity: orderQuantity,
                model: modelDetails.model,
                pair_value: modelDetails.pairValue,
                total_pair_value:
                    Number(orderQuantity) * Number(modelDetails.pairValue),
                shipping_method: item.shipping_method,
                shipping_firstname: item.shipping_firstname
                    ? item.shipping_firstname
                    : "",
                shipping_lastname: item.shipping_lastname
                    ? item.shipping_lastname
                    : "",
                shipping_address_1: item.shipping_address_1
                    ? item.shipping_address_1
                    : "",
                shipping_city: item.shipping_city ? item.shipping_city : "",
                shipping_zone: item.shipping_zone ? item.shipping_zone : "",
                shipping_country: item.shipping_country
                    ? item.shipping_country
                    : "",
                payment_firstname: item.payment_firstname
                    ? item.payment_firstname
                    : "",
                payment_lastname: item.payment_lastname
                    ? item.payment_lastname
                    : "",
                payment_address_1: item.payment_address_1
                    ? item.payment_address_1
                    : "",
                payment_city: item.payment_city ? item.payment_city : "",
                payment_country: item.payment_country
                    ? item.payment_country
                    : "",
                payment_zone: item.payment_zone ? item.payment_zone : "",
                price,
                total_price,
                products,
                order_total: await Common.getOcOrderTotal(
                    item.order_id,
                    prefix
                ),
            };
        }
        return res.json({
            status: true,
            data: { count: totalOrder, order_details: orderDetails },
        });
    } catch (error) {
        console.log(error);
        return res.status(401).json({ status: false });
    }
};
