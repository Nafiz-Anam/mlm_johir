const db = require("../../models");
const country = db.countries;
const CountryTable = db.countryTable;

exports.getAllCountries = async (prefix) => {
  const data = [];
  const Countries = await country.findAll({
    attributes: ["id", "name", "phone_code"],
    order: [["name", "ASC"]],
    prefix,
  });
  Object.entries(Countries).map(([key, value]) => {
    data[key] = {
      value: value["id"],
      title: value["name"],
      code: value["name"],
      phone_code: value["phone_code"],
    };
  });
  return data;
};

exports.getAllCountriesWithoutPrefix = async () => {
  const data = [];
  const Countries = await CountryTable.findAll({
    attributes: ["id", "name", "phone_code"],
    order: [["name", "ASC"]],
  });
  Object.entries(Countries).map(([key, value]) => {
    data[key] = {
      value: value["id"],
      title: value["name"],
      code: value["name"],
      phone_code: value["phone_code"],
    };
  });
  return data;
};
