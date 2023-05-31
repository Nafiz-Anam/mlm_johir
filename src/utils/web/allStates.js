const db = require("../../models");
const states = db.states;
const country = db.countries;

exports.getAllStates = async (id,prefix) => {
  const data = [];
  const States = await states.findAll({
    attributes: ["id", "name"],
    where: { country_id: id },
    prefix
  });
  Object.entries(States).map(([key, value]) => {
    data[key] = {
      value: value.id,
      title: value.name,
      code: value.name,
    };
  });
  return data;
};
