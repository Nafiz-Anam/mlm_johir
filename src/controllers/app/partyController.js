const db = require("../../models");
const { Op } = require("sequelize");
const { errorMessage, successMessage } = require("../../utils/app/response");
const partyUpload = require("../../middleware/app/partyUpload");
const multer = require("multer");
const { mlm_laravel } = require("../../models");
const Country = require("../../utils/app/allCountries");
const PartyServices = require("../../utils/app/partyServices");
const PartyGuests = db.partyGuests;
const { getAllCountries } = require("../../utils/app/allCountries");
const PartyHosts = db.partyHosts;

exports.getHosts = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;
    const allHosts = await PartyServices.getAllHosts(id, prefix);
    let result = [];
    for await (let [key, value] of Object.entries(allHosts)) {
      result[key] = {
        id: value.id,
        name: value.name,
        last_name: value.second_name,
        address: value.address,
        city: value.city,
        phone: value.phone,
        email: value.email,
        country: value?.country_id ? value?.country_id : "",
        state: value?.state_id ? value?.state_id : "",
        party_count: value.party_count,
        guest: value.guest,
        zip: value.zip,
      };
    }
    return res.json({ status: true, data: { result } });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

exports.createNewHost = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const user_id = req.user.id;
    const {
      firstname,
      lastname,
      address,
      country,
      state,
      city,
      zip,
      phone,
      email,
      id,
    } = req.body;

    const partyDetails = await PartyHosts.findOne({
      where: {
        id: id,
      },
      prefix,
    });
    if (!partyDetails) {
      await PartyHosts.create(
        {
          name: firstname,
          second_name: lastname,
          address,
          city,
          phone,
          country_id: country,
          state_id: state,
          email,
          zip,
          added_by: user_id,
          status: 1,
          user: 1,
        },
        { prefix }
      );
      return res.json({ status: true, data: "added successfully" });
    }
    await partyDetails.update(
      {
        name: firstname,
        second_name: lastname,
        address,
        city,
        phone,
        country_id: country,
        state_id: state,
        email,
        zip,
        id,
      },
      {},
      prefix
    );
    return res.json({ status: true, data: "updated succesfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

exports.updateHost = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;
    const hostId = req.query.id;
    if (!hostId) {
      let response = await errorMessage({ code: 406 });
      return res.json(response);
    }
    const hostDetails = await PartyHosts.findOne({
      where: {
        id: hostId,
      },
      prefix,
    });
    if (hostDetails == null) {
      let response = await errorMessage({ code: 406 });
      return res.json(response);
    }
    if (hostDetails.added_by != id) {
      let response = await errorMessage({ code: 406 });
      return res.json(response);
    }
    const {
      firstname,
      lastname,
      address,
      country,
      state,
      city,
      zip,
      phone,
      email,
    } = req.body;
    await hostDetails.update(
      {
        name: firstname,
        second_name: lastname,
        address,
        city,
        phone,
        country_id: country,
        state_id: state,
        email,
        zip,
      },
      {},
      prefix
    );
    return res.json({ status: true, data: "" });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

exports.viewSingleHost = async (req, res) => {
  const prefix = req.headers["api-key"];
  if (!prefix) {
    let response = await errorMessage({ code: 1001 });
    return res.json(response);
  }
  const guestId = req.query.id;
  if (!guestId) {
    let response = await errorMessage({ code: 406 });
    return res.json(response);
  }
  const hostDetails = await PartyHosts.findOne({
    where: {
      id: guestId,
    },
    prefix,
  });
  if (hostDetails == null) {
    let response = await errorMessage({ code: 406 });
    return res.json(response);
  }
  let result = [];
  result[0] = {
    id: hostDetails.id,
    name: hostDetails.name,
    last_name: hostDetails.second_name,
    address: hostDetails.address,
    city: hostDetails.city,
    phone: hostDetails.phone,
    email: hostDetails.email,
    country: hostDetails?.country_id ? hostDetails?.country_id : "",
    state: hostDetails?.state_id ? hostDetails?.state_id : "",
    party_count: hostDetails.party_count,
    guest: hostDetails.guest,
    zip: hostDetails.zip,
  };
  return res.json({ status: true, data: { result } });
};

exports.deleteHost = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;
    const hostIds = req.body;

    for await (let [key, value] of Object.entries(hostIds)) {
      const hostDetails = await PartyHosts.findOne({
        where: {
          id: value,
        },
        prefix,
      });
      if (hostDetails != null && hostDetails.added_by == id) {
        await hostDetails.update(
          {
            status: 0,
          },
          {},
          prefix
        );
      }
    }
    return res.json({ status: true, data: "" });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

exports.getGuests = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;
    const allGuests = await PartyServices.getAllGuest(id, prefix);
    let result = [];
    for await (let [key, value] of Object.entries(allGuests)) {
      result[key] = {
        id: value.id,
        name: value.name,
        last_name: value.second_name,
        address: value.address,
        city: value.city,
        phone: value.phone,
        email: value.email,
        country: value?.country_id ? value?.country_id : "",
        state: value?.state_id ? value?.state_id : "",
        zip: value.zip,
      };
    }
    return res.json({ status: true, data: { result } });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

exports.createNewGuest = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const user_id = req.user.id;
    const {
      firstname,
      lastname,
      address,
      country,
      state,
      city,
      zip,
      phone,
      email,
      id,
    } = req.body;
    const partyDetails = await PartyGuests.findOne({
      where: {
        id: id,
      },
      prefix,
    });
    if (partyDetails == null) {
      await PartyGuests.create(
        {
          name: firstname,
          second_name: lastname,
          address,
          city,
          phone,
          country_id: country,
          state_id: state,
          email,
          zip,
          added_by: user_id,
          status: 1,
          user: 1,
        },
        { prefix }
      );
      return res.json({ status: true, data: "added successfully" });
    }
    await partyDetails.update(
      {
        name: firstname,
        second_name: lastname,
        address,
        city,
        phone,
        country_id: country,
        state_id: state,
        email,
        zip,
        id,
      },
      {},
      prefix
    );
    return res.json({ status: true, data: "updated succesfully" });
  } catch (error) {
    console.log(error);
    return res.status(422).json(error.message);
  }
};

exports.updateGuest = async (req, res) => {
  try {
    const { id } = req.user;
    const guestId = req.query.id;
    if (!guestId) {
      let response = await errorMessage({ code: 406 });
      return res.json(response);
    }
    const guestDetails = await PartyGuests.findOne({
      where: {
        id: guestId,
      },
      prefix,
    });
    if (guestDetails == null) {
      let response = await errorMessage({ code: 406 });
      return res.json(response);
    }
    if (guestDetails.added_by != id) {
      let response = await errorMessage({ code: 406 });
      return res.json(response);
    }
    const {
      firstname,
      lastname,
      address,
      country,
      state,
      city,
      zip,
      phone,
      email,
    } = req.body;
    await guestDetails.update(
      {
        name: firstname,
        second_name: lastname,
        address,
        city,
        phone,
        country_id: country,
        state_id: state,
        email,
        zip,
      },
      {},
      prefix
    );
    return res.json({ status: true, data: "" });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

exports.createParty = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const user_id = req.user.id;
    await partyUpload(req, res, async function (err) {
      if (err != undefined) {
        if (err instanceof multer.MulterError) {
          if (err.code == "LIMIT_FILE_SIZE") {
            let response = await errorMessage({ code: 1018 });
            return res.status(500).json(response);
          }
        } else if (err) {
          // An unknown error occurred when uploading.
          if (err.message == "Only images jpg|jpeg|png|pdf are allowed") {
            let response = await errorMessage({ code: 1017 });
            return res.status(500).json(response);
          } else {
            let response = await errorMessage({ code: 1024 });
            return res.status(500).json(response);
          }
        }
      } else {
        let party = [];
        let postArr = req.body;
        party = postArr;
        if (
          new Date(postArr.from) < new Date() ||
          new Date(postArr.to) < new Date() ||
          new Date(postArr.from) > new Date(postArr.to)
        ) {
          let response = await errorMessage({ code: 406 });
          return res.status(422).json(response);
        }
        let t = await mlm_laravel.transaction();
        let host = postArr.host;
        if (host == "new") {
          const addNewHostResult = await PartyServices.addNewHost(
            user_id,
            party,
            t,
            prefix
          );
          if (addNewHostResult == false) {
            let response = await errorMessage({ code: 1030 });
            return res.status(422).json(response);
          }
          party["new_host_address"] = addNewHostResult;
          party["host_id"] = addNewHostResult.id;
        }
        if (host == "iam") {
          const hostIdResult = await PartyServices.getUserAsHostId(
            user_id,
            t,
            prefix
          );

          if (hostIdResult == false) {
            let response = await errorMessage({ code: 1023 });
            return res.status(422).json(response);
          }
          party["host_id"] = hostIdResult;
        }
        if(host =="old"){
          party["host_id"] = postArr['oldHost']
        }
        if (party.address) {
          if (party.address == "host_address") {
            if (postArr.host == "new") {
              var hostAddress = party["new_host_address"];
            } else {
              var hostAddress = await PartyServices.getHostAddress(
                party.host_id,
                prefix
              );
              if (hostAddress == false) {
                let response = await errorMessage({ code: 1023 });
                return res.status(422).json(response);
              } else if (hostAddress == null || hostAddress.length < 0) {
                return res.status(422).json({
                  status: false,
                  error: { code: 1071, description: "Host address is empty" },
                });
              }
            }
          } else if (party.address == "user_address") {
            var userAddress = await PartyServices.getUserAddress(
              user_id,
              prefix
            );
            if (userAddress == false || userAddress == null || userAddress.country_id == null || userAddress.city == null) {
              return res.status(422).json({
                status: false,
                error: { code: 1072, description: "Owner address is empty" },
              });
            }
          } else {
            var addressNew = JSON.parse(party.address);
          }
        }
        var file = req.file.file_name ? `${process.env.image_url}tickets{req.file.file_name}` : "";
        party["party_name"] = postArr.party_name;
        let partyInsert = await PartyServices.insertParty(
          user_id,
          party,
          addressNew,
          hostAddress,
          userAddress,
          file,
          t,
          prefix
        );
        if (partyInsert) {
          await t.commit();
          let response = await successMessage({
            message: `Your Party Has Been Created`,
          });
          return res.json(response);
        } else {
          let response = await errorMessage({ code: 1030 });
          return res.status(422).json(response);
        }
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err.message);
  }
};

exports.deleteGuest = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const { id } = req.user;
    const guestIds = req.body;
    for await (let [key, value] of Object.entries(guestIds)) {
      const guestDetails = await PartyGuests.findOne({
        where: {
          id: value.id,
        },
        prefix,
      });
      if (guestDetails != null && guestDetails.added_by == id) {
        await guestDetails.update(
          {
            status: 0,
          },
          {},
          prefix
        );
      }
    }
    return res.json({ status: true, data: "" });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

exports.viewSingleGuest = async (req, res) => {
  const prefix = req.headers["api-key"];
  if (!prefix) {
    let response = await errorMessage({ code: 1001 });
    return res.json(response);
  }
  const hostId = req.query.id;
  if (!hostId) {
    let response = await errorMessage({ code: 406 });
    return res.json(response);
  }
  const guestDetails = await PartyGuests.findOne({
    where: {
      id: hostId,
    },
    prefix,
  });
  if (guestDetails == null) {
    let response = await errorMessage({ code: 406 });
    return res.json(response);
  }
  let result = [];
  result[0] = {
    id: guestDetails.id,
    name: guestDetails.name,
    last_name: guestDetails.second_name,
    address: guestDetails.address,
    city: guestDetails.city,
    phone: guestDetails.phone,
    email: guestDetails.email,
    country: guestDetails?.country_id ? guestDetails?.country_id : "",
    state: guestDetails?.state_id ? guestDetails?.state_id : "",
    party_count: guestDetails.party_count,
    guest: guestDetails.guest,
    zip: guestDetails.zip,
  };
  return res.json({ status: true, data: { result } });
};

exports.getCountries = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const countries = await getAllCountries(prefix);
    return res.json({
      status: true,
      data: {
        country: countries,
      },
    });
  } catch (err) {
    console.log(err);
  }
};
