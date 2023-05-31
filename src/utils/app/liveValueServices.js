const axios = require("axios");

exports.liveValueUpdates = async () => {
  try {
    let form = {
      currency: "USD",
      sort: "rank",
      order: "ascending",
      offset: 0,
      limit: 10,
      meta: true,
    };

    var liveValue = await axios.post(
      `https://api.livecoinwatch.com/coins/list`,
      form,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "User-Agent":
            "Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:28.0) Gecko/20100101 Firefox/28.0",
          "x-api-key": "fae65da9-d049-47ea-bc00-6f53d9c58362",
        },
      }
    );

    if (liveValue) {
      return liveValue;
    }
  } catch (err) {
    console.log(err);
  }
};
