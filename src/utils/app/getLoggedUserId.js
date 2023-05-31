const db = require("../../models");
const User = db.user;
const Address = db.address;

exports.getLoggedUserId = async (username) => {
  const userId = await User.findOne({
    attributes: ["id"],
    where: { username },
  });
  return userId;
};

exports.getDefaultAddress = async (userid,prefix) => {
  
  const defaultAddress = await Address.findOne({
    attributes: ["id"],
    where: {
      user_id: userid,
      is_default: "1",
    },
    prefix
  });
  return defaultAddress.id;
};
