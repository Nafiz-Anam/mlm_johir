var path = require("path");
const fs = require("fs");
const db = require("../../models");
const pack = db.pack;
const User = db.user;

const getApi = async (req, res, next) => {
  try {
    let prefix = await req.headers["prefix"];
    return next();
  } catch (err) {
    console.log(err);
    res.json(err.message);
  }
};
module.exports = getApi;
