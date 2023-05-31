const db = require("../../models");
const Cart = db.carts;
const pack = db.pack;

exports.totalAmount = async (userId,prefix) => {
  let total;
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
  });
  return total
};
