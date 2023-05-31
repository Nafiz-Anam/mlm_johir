const { Op } = require("sequelize");
const db = require("../../models");
const dc = require("../../utils/app/constants");
const currencyTable = db.currencyTable;
const Curr = db.currencies;

exports.getAllCurrencies = async (prefix) => {
  const data = [];
  const currencies = await Curr.findAll({
    attributes: ["title", "symbol_left", "symbol_right", "code", "id", "value"],
    where: {
      [Op.and]: [
        {
          status: {
            [Op.ne]: "disabled",
          },
        },
        {
          delete_status: "yes",
        },
      ],
    },
    prefix
  });
  Object.entries(currencies).map(([key, value]) => {
    data[key] = {
      title: value["title"],
      symbol_left: value["symbol_left"],
      symbol_right: value["symbol_right"],
      code: value["code"],
      id: value["id"],
      value: parseFloat(value["value"]),
      default: dc.defaultCurrency
        ? value["id"] == dc.defaultCurrency
        : value["default_id"] == 1,
      precision: value["code"] == "BTC" ? 8 : 2,
    };
  });
  return data;
};


exports.getAllCurrenciesWithoutPrefix = async () => {
    const data = [];
    const currencies = await currencyTable.findAll({
      attributes: ["title", "symbol_left", "symbol_right", "code", "id", "value"],
      where: {
        [Op.and]: [
          {
            status: {
              [Op.ne]: "disabled",
            },
          },
          {
            delete_status: "yes",
          },
        ],
      },
    });
    Object.entries(currencies).map(([key, value]) => {
      data[key] = {
        title: value["title"],
        symbol_left: value["symbol_left"],
        symbol_right: value["symbol_right"],
        code: value["code"],
        id: value["id"],
        value: parseFloat(value["value"]),
        default: dc.defaultCurrency
          ? value["id"] == dc.defaultCurrency
          : value["default_id"] == 1,
        precision: value["code"] == "BTC" ? 8 : 2,
      };
    });
    return data;
  };
