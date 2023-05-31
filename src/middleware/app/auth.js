const jwt = require("jsonwebtoken");
const Common = require("../../utils/app/common");
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers["access-token"];
    const prefix = req.headers["api-key"];
    if (!token || !prefix) {
      console.log(
        "A token is required for authentication***************************************"
      );
      return res.status(403).send("A token is required for authentication");
    }
    console.log(
      "=========================mobile tocken ==================",
      token
    );
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    console.log("==============decoded==========", decoded);
    const tokenFromDB = await Common.getAccessToken(decoded.id, prefix);
    if (tokenFromDB != token || tokenFromDB == false) {
      return res.status(401).json({ status: false });
    }
    req.user = decoded;
    return next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ status: false });
  }
};

module.exports = verifyToken;
