const stripe = require("stripe")(process.env.STRIPE_KEY);
const db = require("../../models");
const StripePayment = db.stripePayment;

exports.stripePayment = async (stripe_token, amount, desc) => {
  try {
    const result = await stripe.charges.create({
      source: stripe_token.id,
      amount: parseInt(amount * 100),
      currency: "usd",
      description: `${desc} at ${new Date()}`,
    });
    return result;
  } catch (error) {
    console.log(error)
    return false;
  }
};

exports.insertInToStripePaymentActivity = async (
  userId,
  stripeRes,
  productId = null,
  orderId = null,
  totalAmount,
  paymentMethod,
  prefix,
  t
) => {
  console.log("starting")
  try {
    await StripePayment.create(
      {
        charge_id:stripeRes?.id,
        user_id: userId,
        product_id: productId,
        order_id:orderId,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        stripe_response:JSON.stringify(stripeRes)
      },
      { transaction: t, prefix }
    );
  console.log("created")
    return true
  } catch (err) {
    console.log(err);
    return false;
  }
};
