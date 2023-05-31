const db = require("../../models");
const ReplicaBanner = db.replicaBanner;
const ReplicaContent = db.replicaContent;
const ReplicaContact = db.contacts;

exports.selectBanner = async (user_id, prefix) => {
  let whereStatement = [];
  if (user_id) {
    let condition1 = {
      user_id: user_id,
    };
    whereStatement.push(condition1);
  }
  let result = await ReplicaBanner.findAll({
    attributes: ["image"],
    where: whereStatement,
    prefix,
  });
  return result;
};

exports.GetReplicaContent = async (user_id, lang_id, prefix) => {
  let whereStatement = [];
  if (user_id) {
    let condition1 = {
      user_id: user_id,
    };
    whereStatement.push(condition1);
  }
  if (lang_id) {
    let condition2 = {
      lang_id: lang_id,
    };
    whereStatement.push(condition2);
  }
  let result = await ReplicaContent.findAll({
    attributes: ["key", "value"],
    where: whereStatement,
    prefix,
  });
  return result;
};

exports.postContact = async (contact, replica_id, prefix) => {
  try {
     await ReplicaContact.create(
      {
        name: contact["name"],
        email: contact["email"],
        address: contact["address"],
        phone: contact["phone"],
        contact_info: contact["message"],
        owner_id: replica_id,
        status: 0,
        mail_added_date: new Date().toJSON(),
        read_msg: 0,
      },
      { prefix }
    );
    return true
  } catch (error) {
    console.log(error);
    return false
  }
};
