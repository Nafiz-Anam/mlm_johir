const db = require("../../models");
const User = db.user;
const Tree = db.treepath;
const { Op, Sequelize, QueryTypes } = require("sequelize");
const { mlm_laravel } = require("../../models");
const { successMessage, errorMessage } = require("../../utils/web/response");
const moment = require("moment");

exports.joiningReport = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id } = req.user;
        var { start_date, end_date, length, start } = req.query;
        // console.log(id, User, Tree);

        start_date = start_date ? new Date(start_date) : new Date();
        let newEndDate = end_date ? new Date(end_date) : new Date();
        newEndDate.setDate(newEndDate.getDate() + 1);
        start = start ? start : 0;
        length = length ? length : 10;
        start_date = moment(start_date).format("YYYY-MM-DD 23:59:59");
        newEndDate = moment(newEndDate).format("YYYY-MM-DD 23:59:59");

        console.log(start_date, end_date, newEndDate);
        let decendants = await mlm_laravel.query(
            `SELECT  s.username, s.active, s.father_id, s.sponsor_id, s.date_of_joining, T1.username AS father_name , T2.username AS sponsorname FROM  ${prefix}users as s LEFT OUTER JOIN ${prefix}users AS T1 ON s.father_id = T1.id LEFT OUTER JOIN ${prefix}users AS T2 ON s.sponsor_id = T2.id WHERE s.id IN (SELECT f.descendant FROM ${prefix}treepaths as f WHERE f.ancestor = :user_id AND f.descendant!= :user_id) AND s.created_at > '${start_date}' AND s.created_at < '${newEndDate}' LIMIT ${start},${length}`,
            {
                replacements: {
                    user_id: id,
                },
                type: QueryTypes.SELECT,
                raw: true,
                offset: start ? start : 0,
                limit: length ? length : 10,
                prefix,
            },
            {
                model: User,
                mapToModel: true,
            }
        );

        let decendantsCount = await mlm_laravel.query(
            `SELECT  COUNT(s.id) AS count FROM  ${prefix}users as s LEFT OUTER JOIN ${prefix}users AS T1 ON s.father_id = T1.id LEFT OUTER JOIN ${prefix}users AS T2 ON s.sponsor_id = T2.id WHERE s.id IN (SELECT f.descendant FROM ${prefix}treepaths as f WHERE f.ancestor = :user_id AND f.descendant!= :user_id) AND s.created_at > '${start_date}' AND s.created_at < '${newEndDate}' `,
            {
                replacements: {
                    user_id: id,
                },
                type: QueryTypes.SELECT,
                raw: true,
                offset: start ? start : 0,
                limit: length ? length : 10,
                prefix,
            },
            {
                model: User,
                mapToModel: true,
            }
        );

        var data = [];
        decendants.forEach((values, index) => {
            data[index] = {
                name: values.username,
                placement: values.father_name,
                sponsor: values.sponsorname,
                doj: values.date_of_joining,
                active: values.active,
            };
        });
        let result = {
            count: decendantsCount[0].count,
            datas: data,
        };
        let response = await successMessage({ value: result });
        return res.json(response);
    } catch (err) {
        console.log(err);
        let response = await errorMessage({ code: 1004 });
        return res.json(response);
    }
};

exports.joiningReportExport = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const { id } = req.user;

        console.log(id, User, Tree);
        let decendants = await mlm_laravel.query(
            `SELECT  s.username, s.active, s.father_id, s.sponsor_id, s.date_of_joining, T1.username AS father_name , T2.username AS sponsorname FROM  ${prefix}users as s LEFT OUTER JOIN ${prefix}users AS T1 ON s.father_id = T1.id LEFT OUTER JOIN ${prefix}users AS T2 ON s.sponsor_id = T2.id WHERE s.id IN (SELECT f.descendant FROM ${prefix}treepaths as f WHERE f.ancestor = :user_id AND f.descendant!= :user_id)`,
            {
                replacements: {
                    user_id: id,
                },
                type: QueryTypes.SELECT,
                raw: true,
                prefix,
            },
            {
                model: User,
                mapToModel: true,
            }
        );

        var data = [];
        decendants.forEach((values, index) => {
            data[index] = {
                name: values.username,
                placement: values.father_name,
                sponsor: values.sponsorname,
                doj: values.date_of_joining,
                active: values.active,
            };
            index = index + 1;
        });
        let result = {
            count: data.length,
            datas: data,
        };
        let response = await successMessage({ value: result });
        return res.json(response);
    } catch (err) {
        console.log(err);
        let response = await errorMessage({ code: 1004 });
        return res.json(response);
    }
};
