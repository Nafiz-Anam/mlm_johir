const db = require("../../models");
const PartyHosts = db.partyHosts;
const UserDetails = db.userDetails;
const Parties = db.parties;
const PartyGuests = db.partyGuests;

exports.getAllHosts = async (id, prefix) => {
    try {
        const allParties = await PartyHosts.findAll({
            where: {
                status: 1,
                added_by: id,
            },
            prefix,
        });

        return allParties;
    } catch (error) {
        console.log(error.message);
        return [];
    }
};

exports.getAllGuest = async (id, prefix) => {
    try {
        const allGuests = await PartyGuests.findAll({
            where: {
                status: 1,
                added_by: id,
            },
            prefix,
        });

        return allGuests;
    } catch (error) {
        console.log(error.message);
        return [];
    }
};

exports.addNewHost = async (user_id, party, t, prefix) => {
    try {
        let hostUser = await PartyHosts.create(
            {
                name: party.firstname,
                second_name: party.second_name,
                address: party.address,
                city: party.city,
                phone: party.phone,
                email: party.email,
                country: party?.country ? party?.country : null,
                state: party?.state ? party?.state : null,
                party_count: 0,
                guest: 0,
                status: 1,
                zip: party.zip,
                added_by: user_id,
                user: 1,
            },
            {
                transaction: t,
                prefix,
            }
        );
        return hostUser;
    } catch (error) {
        console.log(error);
        return false;
    }
};

exports.getUserAsHostId = async (user_id, t, prefix) => {
    try {
        let userHost = await PartyHosts.findOne({
            where: {
                added_by: user_id,
                user: 1,
            },
            prefix,
        });
        if (userHost) {
            return userHost.id;
        } else {
            let details = await UserDetails.findOne({
                where: {
                    user_id: user_id,
                },
                prefix,
            });
            let hostUser = await PartyHosts.create(
                {
                    name: details.name,
                    second_name: details.second_name,
                    address: details.address,
                    city: details.city,
                    phone: details.mobile,
                    email: details.email,
                    country: details?.country_id ? details?.country_id : "",
                    state: details?.state_id ? details?.state_id : "",
                    party_count: 0,
                    guest: 0,
                    status: 1,
                    zip: details.pin,
                    added_by: user_id,
                    user: 1,
                },
                {
                    transaction: t,
                    prefix,
                }
            );
            return hostUser.id;
        }
    } catch (err) {
        console.log(err);
        return false;
    }
};

exports.getHostAddress = async (id, prefix) => {
    try {
        let address = await PartyHosts.findOne({
            attributes: [
                "address",
                "city",
                "state_id",
                "zip",
                "phone",
                "email",
                "country_id",
            ],
            where: {
                id: id,
            },
            prefix,
        });
        return address;
    } catch (err) {
        console.log(err);
        return false;
    }
};

exports.getUserAddress = async (id, prefix) => {
    try {
        let address = await UserDetails.findOne({
            attributes: [
                "address",
                "city",
                "state_id",
                "country_id",
                "mobile",
                "email",
            ],
            where: {
                user_id: id,
            },
            prefix,
        });
        return address;
    } catch (err) {
        console.log(err);
        return false;
    }
};

exports.insertParty = async (
    user_id,
    party,
    newAddress,
    hostAdd,
    userAdd,
    file,
    t,
    prefix
) => {
    try {
        if (party.address == "host_address") {
            var result = await Parties.create(
                {
                    host_id: party.host_id,
                    from_date: party.from,
                    to_date: party.to,
                    from_time: party.startTime,
                    to_time: party.endTime,
                    address: party.address,
                    city: hostAdd.city,
                    state_id: hostAdd.state,
                    country_id: hostAdd.country,
                    phone: hostAdd.phone,
                    email: hostAdd.email,
                    added_by: user_id,
                    status: 1,
                    guest_count: 0,
                    name: party.party_name,
                    image: file,
                    address_type: party.address,
                },
                {
                    transaction: t,
                    prefix,
                }
            );
        } else if (party.address == "user_address") {
            var result = await Parties.create(
                {
                    host_id: party["host_id"],
                    from_date: party.from,
                    to_date: party.to,
                    from_time: party.startTime,
                    to_time: party.endTime,
                    address: party.address,
                    city: userAdd.city,
                    state_id: userAdd.state_id,
                    country_id: userAdd.country_id,
                    phone: userAdd.mobile,
                    email: userAdd.email,
                    added_by: user_id,
                    status: "1",
                    guest_count: "0",
                    name: party.party_name,
                    image: file,
                    address_type: party.address,
                    zip: userAdd.pin,
                },
                {
                    transaction: t,
                    prefix,
                }
            );
        } else {
            var result = await Parties.create(
                {
                    host_id: party.host_id,
                    from_date: party.from,
                    to_date: party.to,
                    from_time: party.startTime,
                    to_time: party.endTime,
                    address: "new Address",
                    city: newAddress.city,
                    state_id: newAddress.state == "" ? null : newAddress.state,
                    country_id: newAddress.country,
                    phone: newAddress.phone,
                    email: newAddress.email,
                    added_by: user_id,
                    status: 1,
                    guest_count: 0,
                    name: party.party_name,
                    image: file,
                    address_type: "new_address",
                },
                {
                    transaction: t,
                    prefix,
                }
            );
        }
        return result;
    } catch (err) {
        console.log(err);
        return false;
    }
};
