const jwt = require("jsonwebtoken");
const Common = require("../../utils/web/common");
const { errorMessage } = require("../../utils/web/response");
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers["access-token"];
    // const prefix = req.headers["api-key"];
    const prefix = process.env.PREFIX;

    if (!token || !prefix) {
      return res.status(403).send("A token is required for authentication");
    }
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);

    const tokenFromDB = await Common.getAccessToken(decoded.id, prefix);
    console.log("---------------", tokenFromDB, token);
    if (tokenFromDB != token || tokenFromDB == false) {
      console.log("=================tokenFromDB==========================");
      // return res.status(401).json({ status: false });
      return res.status(401).send("token expired");
    }
    req.user = decoded;
    return next();
  } catch (err) {
    console.log("=======================err", err);
    let response = await errorMessage({ code: 1002 });
    return res.status(401).json(response);
  }
};

module.exports = verifyToken;
