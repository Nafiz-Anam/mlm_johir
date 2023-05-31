const { Op } = require("sequelize");
const db = require("../../models");
const dc = require("../../utils/app/constants");
const languageTable = db.languageTable;
const lang = db.languages;

exports.getAllLanguage = async (prefix) => {
  const data = [];
  const languages = await lang.findAll({
    attributes: ["id", "code", "name"],
    where: {
      status: 1,
    },
    prefix
  });
  Object.entries(languages).map(([key, value]) => {
    data[key] = {
      code: value["code"],
      label: value["name"],
      default: dc.defaultLanguage
        ? value["id"] == dc.defaultLanguage
        : value["id"] == 1,
      id: value["id"],
      img: `${process.env.SITE_URL}/uploads/images/flags/${value["code"]}.png`,
    };
  });
  return data;
};

exports.getAllLanguageWithoutPrefix = async (prefix) => {
  const data = [];
  const languages = await languageTable.findAll({
    attributes: ["id", "code", "name"],
    where: {
      status: 1,
    },
  });
  Object.entries(languages).map(([key, value]) => {
    data[key] = {
      code: value["code"],
      label: value["name"],
      default: dc.defaultLanguage
        ? value["id"] == dc.defaultLanguage
        : value["id"] == 1,
      id: value["id"],
      img: `${process.env.SITE_URL}/uploads/images/flags/${value["code"]}.png`,
    };
  });
  return data;
};
