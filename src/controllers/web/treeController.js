const { Op, Sequelize, QueryTypes } = require("sequelize");
const db = require("../../models");
const fs = require("fs");
const { mlm_laravel } = require("../../models");
const treeService = require("../../utils/web/treeService");
const common = require("../../utils/web/common");
const modStatus = require("../../utils/web/moduleStatus");
const { errorMessage, successMessage } = require("../../utils/web/response");
const { join } = require("path");
const User = db.user;
const Tree = db.treepath;
// const SpnorTree = db.sponsorTree
const Config = db.configuration;
const signUpSettings = db.signupSettings;
const Tools = db.tooltipsConfig;
const LegDetails = db.legDetails;

exports.getGenealogyTree = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        let toolsArr = {};
        let loggedId = req.user.id;
        let userId = req.user.id;
        const treeType = "tree";
        var { user_name, user_id } = req.query;
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        let rankStatus = moduleStatus.rank_status;
        let mlmPlan = moduleStatus.mlm_plan;

        console.log(
            "888888888888888888888888888888888888888888888888888888888888888"
        );
        if (user_name != "") {
            userId = await common.usernameToId(user_name, prefix);
            let downlineCheck = await common.checkDownline(
                loggedId,
                userId,
                prefix
            );
            if (!downlineCheck) {
                let response = await errorMessage({
                    code: 1043,
                });
                return res.json(response);
            }
            if (!userId) {
                let response = await errorMessage({
                    code: 1043,
                });
                return res.json(response);
            }
        }
        if (user_id != "") {
            userId = user_id;
        }
        if (userId) {
            const check = await common.userExists(userId, prefix);

            if (!check) {
                let response = await errorMessage({
                    code: 1043,
                });
                return res.json(response);
            }
        } else {
            let response = await errorMessage({
                code: 1043,
            });
            return res.json(response);
        }
        let array = await reactTree(
            mlmPlan,
            rankStatus,
            userId,
            treeType,
            prefix
        );
        // console.log("**********************************", array);
        array.filter(async (value) => {
            if (
                value.image == undefined ||
                value.image == null ||
                value.image == ""
            ) {
                value.image = "";
            } else {
                value.image = value.image;
            }
            value["user_name"] = value.username;
            value["photo"] = value.image;
            value["left"] = value.left_count;
            value["right"] = value.right_count;
            value.children = [];
        });

        for await (let [key, value] of Object.entries(array)) {
            var currentPackageSlab = await common.getSponsorPackageSlab(
                value.user_id,
                prefix
            );
            if (currentPackageSlab == "entry") {
                value.color = "#1396e3c4";
            } else {
                value.color = "#d72929c9";
            }
        }

        array.forEach(async (element) => {
            array.forEach(async (element1) => {
                if (element.user_id == element1.father_id) {
                    element.children.push(element1);
                }
            });
            if (element.children.length == 0) {
                delete element.children;
            }
        });

        let toolsTip = await Tools.findAll({
            attributes: ["name", "status", "slug"],
            prefix,
        });
        Object.entries(toolsTip).map(([key, value]) => {
            toolsArr[value.slug.replace(/-/g, "_")] = value.status
                ? true
                : false;
        });

        let data = {
            TreeData: [array[0]],
            tooltip_config: toolsArr,
        };

        if (moduleStatus.ecom_status) {
            // TODO register Url
            data = {
                ...data,
                store_url: await common.createEcomLink(
                    userId,
                    "register",
                    prefix
                ),
            };
        }

        let response = await successMessage({
            value: data,
        });
        res.json(response);
    } catch (err) {
        res.json(err.message);
    }
};

exports.getSponsorTree = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        let toolsArr = {};
        let loggedId = req.user.id;
        let userId = req.user.id;
        const treeType = "sponsor_tree";
        var { user_name, user_id } = req.query;
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        let rankStatus = moduleStatus.rank_status;
        let mlmPlan = moduleStatus.mlm_plan;

        if (user_name != "") {
            userId = await common.usernameToId(user_name, prefix);
            let downlineCheck = await common.checkDownline(
                loggedId,
                userId,
                prefix
            );
            if (!downlineCheck) {
                let response = await errorMessage({
                    code: 1043,
                });
                return res.json(response);
            }
            if (!userId) {
                let response = await errorMessage({
                    code: 1043,
                });
                return res.json(response);
            }
        } else if (user_id != "") {
            const check = await common.userExists(user_id, prefix);
            if (!check) {
                let response = await errorMessage({
                    code: 1043,
                });
                return res.json(response);
            }
            userId = user_id;
        }
        const array = await getTreeDownline(
            mlmPlan,
            rankStatus,
            userId,
            treeType,
            prefix
        );
        array.map((value) => {
            if (value.image == undefined) {
                value.image = "";
            } else {
                value.image = value.image;
            }
            value["user_name"] = value.username;
            value["photo"] = value.image;
            value["left"] = value.left_count;
            value["right"] = value.right_count;
            value.children = [];
        });

        array.forEach((element) => {
            array.forEach((element1) => {
                if (element.user_id == element1.sponsor_id) {
                    element.children.push(element1);
                }
            });
            if (element.children.length == 0) {
                delete element.children;
            }
        });
        let toolsTip = await Tools.findAll({
            attributes: ["name", "status", "slug"],
            prefix,
        });
        toolsTip.map((value) => {
            toolsArr[value.slug.replace(/-/g, "_")] = value.status
                ? true
                : false;
        });
        if (moduleStatus.ecom_status) {
            // TODO register Url
        }
        let data = {
            TreeData: [array[0]],
            tooltip_config: toolsArr,
        };
        let response = await successMessage({
            value: data,
        });
        res.json(response);
    } catch (err) {
        res.json(err.message);
    }
};

exports.getDownlineMembers = async (req, res) => {
    try {
        const prefix = process.env.PREFIX;
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const user_id = req.user.id;
        let { level, offset, limit } = req.query;
        level = level == "" ? "all" : level == "all" ? "all" : parseInt(level);
        limit = limit ? parseInt(limit) : 10;
        offset = offset ? parseInt(offset) : 0;
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        // const totalDownlineCount = await treeService.getTotalDownlineUsersCount(user_id)
        const totalLevel = await treeService.getMaxLevelUser(user_id, prefix);
        if (level != "all") {
            let levelValue =
                (await treeService.getUserLevel(user_id, prefix)) + level;
            var binary = await treeService.getDownlineDetailsBinary(
                moduleStatus,
                user_id,
                offset,
                limit,
                levelValue,
                prefix
            );
            var levelArr = binary.length;
        } else {
            var levelArr = await treeService.getTotalDownlineUsersBinary(
                user_id,
                "",
                prefix
            );
            var binary = await treeService.getDownlineDetailsBinary(
                moduleStatus,
                user_id,
                offset,
                limit,
                "",
                prefix
            );
        }
        binary.map((value) => {
            if (value.image == "undefined" || value.image == "no_photo.jpg") {
                value.image = "";
            } else {
                value.image = value.image;
            }
        });
        let data = {
            total_downline_count: levelArr,
            total_levels: totalLevel,
            tableData: binary,
        };
        let response = await successMessage({
            value: data,
        });
        return res.json(response);
    } catch (err) {
        return res.json(err.message);
    }
};

exports.getReferralMembers = async (req, res) => {
    try {
        const prefix = req.headers["api-key"];
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        const user_id = req.user.id;
        let { level, offset, limit } = req.query;

        level = level == "" ? "all" : level == "all" ? "all" : parseInt(level);
        limit = limit ? parseInt(limit) : 10;
        offset = offset ? parseInt(offset) : 0;
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        const totalLevel = await treeService.getMaxLevelSponsor(
            user_id,
            prefix
        );
        if (level != "all") {
            let levelValue =
                (await getUserTreeLevel(user_id, "sponsor_tree", prefix)) +
                level;
            var binary = await treeService.getDownlineDetailsUnilevel(
                moduleStatus,
                user_id,
                offset,
                limit,
                "Unilevel",
                levelValue,
                prefix
            );
            var levelArr = binary.length;
        } else {
            var levelArr = await treeService.getTotalDownlineUsersUnilevel(
                user_id,
                "",
                prefix
            );
            var binary = await treeService.getDownlineDetailsUnilevel(
                moduleStatus,
                user_id,
                offset,
                limit,
                "Unilevel",
                "",
                prefix
            );
        }
        binary.map((value) => {
            if (value.image == "undefined" || value.image == "no_photo.jpg") {
                value.image = "";
            } else {
                value.image = value.image;
            }
        });
        let data = {
            total_referral_count: levelArr,
            total_levels: totalLevel,
            tableData: binary,
        };
        let response = await successMessage({
            value: data,
        });
        return res.json(response);
    } catch (err) {
        return res.json(err.message);
    }
};

exports.getTreeView = async (req, res) => {
    try {
        const prefix = process.env.PREFIX;
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        let toolsArr = {};
        let { user_name } = req.query;
        let user_id = req.user.id;
        if (user_name) {
            user_id = await common.usernameToId(user_name, prefix);
        }
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        let toolTipArray = await treeService.getTreeDownlinesTooltip(
            moduleStatus,
            user_id,
            "tree",
            prefix
        );
        let toolsTip = await Tools.findAll({
            attributes: ["name", "slug", "status"],
            prefix,
        });

        Object.entries(toolsTip).map(([key, value]) => {
            toolsArr[value.slug.replace(/-/g, "_")] = value.status
                ? true
                : false;
        });

        // toolsTip.map((value) => {
        //   toolsArr[value.name] = value.status ? true : false;
        // });
        let children = await treeService.getChildren(user_id, prefix);
        let data = {
            data: children,
            tooltip_config: toolsArr,
            tooltip_array: toolTipArray,
        };

        let response = await successMessage({
            value: data,
        });
        return res.json(response);
    } catch (err) {
        return err.message;
    }
};

exports.getStepView = async (req, res) => {
    const userId = req.user.id;
    const prefix = req.headers["api-key"];
    if (!prefix) {
        let response = await errorMessage({ code: 1001 });
        return res.json(response);
    }
    let steps = await treeService.getAllStepUsers(userId, prefix);
    let data = {
        users: steps,
    };
    let response = await successMessage({ value: data });
    return res.json(response);
};

async function reactTree(mlmPlan, rankStatus, userId, treeType, prefix) {
    let legLockingAncestor, userLockedBinaryLeg;
    const widthCeiling = await Config.findOne({
        attributes: ["width_ceiling"],
        prefix,
    });
    const adminId = await common.getAdminId(prefix);
    let treeUserDetails = await getTreeDownline(
        mlmPlan,
        rankStatus,
        userId,
        treeType,
        prefix
    );
    userLockedBinaryLeg = "any";
    if (userId != adminId && treeType == "tree" && mlmPlan == "Binary") {
        userLockedBinaryLeg = await getUserBinaryLeg(userId, prefix);
        if (userLockedBinaryLeg != "any") {
            let checkPos = userLockedBinaryLeg == "R" ? "L" : "R";
            legLockingAncestor = await User.findOne({
                attributes: ["id"],
                where: {
                    position: checkPos,
                    father_id: userId,
                },
                prefix,
            });
        }
    }
    const binaryLeg = await signUpSettings.findOne({
        attributes: ["binary_leg"],
        prefix,
    });
    Object.entries(treeUserDetails).map(async ([key, value]) => {
        if (treeType == "tree") {
            let binaryDisabledLeg = "";
            if (binaryLeg.binary_leg != "any") {
                binaryDisabledLeg = binaryLeg.binary_leg == "L" ? "R" : "L";
            } else {
                if (userLockedBinaryLeg != "any") {
                    if (userId == value.user_id) {
                        binaryDisabledLeg =
                            userLockedBinaryLeg == "L" ? "R" : "L";
                    } else {
                        if (legLockingAncestor) {
                            const checkLock = Tree.count({
                                where: {
                                    ancestor: legLockingAncestor.id,
                                    descendant: value.user_id,
                                },
                                prefix,
                            });
                            if (checkLock > 0) {
                                binaryDisabledLeg = "both";
                            }
                        }
                    }
                }
            }
            treeUserDetails[key]["disabled"] = binaryDisabledLeg;
        }
        // var currentPackageSlab = await common.getSponsorPackageSlab(
        //   treeUserDetails[key].user_id,
        //   prefix
        // );

        // treeUserDetails[key]["color"] =
        //   currentPackageSlab == "entry" ? "#09ed09" : "#f0ec0a";
    });
    return treeUserDetails;
}

async function getTreeDownline(mlmPlan, rankStatus, userId, treeType, prefix) {
    let selectQuery = [];
    let joinQuery = [];
    const level = await getUserTreeLevel(userId, treeType, prefix);
    if (level) {
        selectQuery = `SELECT f.id user_id, f.username as user_name , f.active, f.position, f.father_id, f.sponsor_id, f.user_level, f.sponsor_level, f.date_of_joining join_date, f.user_rank_id rank_id, u.name first_name, u.second_name last_name, CONCAT(u.name, u.second_name) full_name, u.image `;
        joinQuery = `FROM ${prefix}users f LEFT JOIN ${prefix}user_details u ON f.id = u.user_id `;
    }
    if (mlmPlan == "Binary") {
        selectQuery += `,l.total_left_count as  left_count,l.total_right_count right_count,l.total_left_carry left_carry,l.total_right_carry right_carry `;
        joinQuery += `LEFT JOIN ${prefix}leg_details l ON l.user_id = f.id `;
    }
    if (mlmPlan == "Stair_Step") {
        selectQuery += `,p.total_pv personal_pv,p.total_gpv group_pv `;
        joinQuery += `LEFT JOIN ${prefix}userpv_details p ON p.user_id = f.id `;
    } else {
        selectQuery += `,f.personal_pv,f.group_pv `;
    }
    if (mlmPlan == "Donation") {
        selectQuery += ` ,dr.name donation_level `;
        joinQuery += `LEFT JOIN ${prefix}donation_levels dl ON dl.user = f.id `;
        joinQuery += `LEFT JOIN ${prefix}donation_rates dr ON dr.id = dl.level `;
    }
    if (rankStatus) {
        selectQuery += `,r.name as rank_name,r.color as rank_color`;
        joinQuery += `LEFT JOIN ${prefix}ranks r ON r.id = f.user_rank_id `;
    }
    if (treeType == "tree") {
        selectQuery += `,(f.user_level - :level) depth, f.id, f.username, GROUP_CONCAT(DISTINCT CONCAT(f2.user_level - :level, LPAD(f2.leg_position, 8, '0'))  ORDER BY f2.user_level SEPARATOR '') as br,f3.position child_position `;
        joinQuery += ` LEFT JOIN ${prefix}users f3 ON f3.father_id = f.id JOIN ${prefix}treepaths t ON t.descendant = f.id JOIN ${prefix}treepaths crumbs ON crumbs.descendant = t.descendant JOIN ${prefix}users f2 ON f2.id = crumbs.ancestor AND f2.user_level >= :level WHERE f.user_level - :level <  :tree_level AND t.ancestor = :userId GROUP BY f.id ORDER BY br;`;
    }
    if (treeType == "sponsor_tree") {
        selectQuery += `,(f.sponsor_level - :level) depth, f.id, f.username, GROUP_CONCAT(DISTINCT CONCAT(f2.sponsor_level - :level, LPAD(f2.leg_position, 8, '0'), crumbs.ancestor)  ORDER BY f2.sponsor_level SEPARATOR '') as br `;
        joinQuery += `JOIN ${prefix}sponsor_treepaths t ON t.descendant = f.id JOIN ${prefix}sponsor_treepaths crumbs ON crumbs.descendant = t.descendant JOIN ${prefix}users f2 ON f2.id = crumbs.ancestor AND f2.sponsor_level >= :level WHERE f.sponsor_level - :level <  :tree_level AND t.ancestor = :userId GROUP BY f.id HAVING depth < :tree_level ORDER BY br`;
    }
    let result = await mlm_laravel.query(selectQuery + joinQuery, {
        replacements: {
            level: level,
            userId: userId,
            tree_level: 4,
        },
        type: QueryTypes.SELECT,
        raw: true,
        prefix,
    });

    return result;
}

async function getUserBinaryLeg(id, prefix) {
    const userBinaryLeg = await User.findOne({
        attributes: ["binary_leg"],
        where: {
            id: id,
        },
        prefix,
    });
    let result = userBinaryLeg.binary_leg;
    if (userBinaryLeg.binary_leg == "weak_leg") {
        const totalleg = await LegDetails.findOne({
            attributes: [
                ["total_left_count", "left"],
                ["total_right_count", "right"],
            ],
            where: {
                id: id,
            },
            prefix,
        });
        if (totalleg.left > totalleg.right) {
            result = "R";
        } else if (totalleg.left < totalleg.right) {
            result = "L";
        } else {
            result = "any";
        }
    }
    return result;
}

async function getUserTreeLevel(userId, treeType, prefix) {
    let treeAttr = [];
    if (treeType == "tree") {
        treeAttr = ["user_level"];
    }
    if (treeType == "sponsor_tree") {
        treeAttr = ["sponsor_level"];
    }
    const levels = await User.findOne({
        attributes: treeAttr,
        where: {
            id: userId,
        },
        prefix,
    });

    return levels[treeAttr];
}

exports.newGenealogyTree = async (req, res) => {
    try {
        // const prefix = req.headers["api-key"];
        const prefix = process.env.PREFIX;
        if (!prefix) {
            let response = await errorMessage({ code: 1001 });
            return res.json(response);
        }
        let toolsArr = {};
        let loggedId = req.user.id;
        let userId = req.user.id;
        const treeType = "tree";
        var { user_name, user_id } = req.query;
        const moduleStatus = await modStatus.getModuleStatus(prefix);
        let rankStatus = moduleStatus.rank_status;
        let mlmPlan = moduleStatus.mlm_plan;

        if (user_name != "") {
            userId = await common.usernameToId(user_name, prefix);
            let downlineCheck = await common.checkDownline(
                loggedId,
                userId,
                prefix
            );
            if (!downlineCheck) {
                let response = await errorMessage({
                    code: 1043,
                });
                return res.json(response);
            }
            if (!userId) {
                let response = await errorMessage({
                    code: 1043,
                });
                return res.json(response);
            }
        }
        if (user_id != "") {
            userId = user_id;
        }
        if (userId) {
            const check = await common.userExists(userId, prefix);
            if (!check) {
                let response = await errorMessage({
                    code: 1043,
                });
                return res.json(response);
            }
        } else {
            let response = await errorMessage({
                code: 1043,
            });
            return res.json(response);
        }
        let array = await reactTree1(
            mlmPlan,
            rankStatus,
            userId,
            treeType,
            prefix
        );
        var treeWidth = await Config.findOne({
            attributes: ["width_ceiling"],
            prefix,
        });
        let result = [];
        array.forEach((value, key) => {
            result[key] = {
                name: value.user_name,
                attributes: value,
                children: [],
                isLoader: false,
            };
        });
        result.forEach((element) => {
            result.forEach((element1) => {
                if (
                    element.attributes.user_id == element1.attributes.father_id
                ) {
                    if (moduleStatus.mlm_plan == "Binary") {
                        if (element1.attributes.position == "L") {
                            element.children.splice(0, 0, element1);
                        } else if (element1.attributes.position == "R") {
                            element.children.splice(1, 0, element1);
                        }
                    } else {
                        element.children.push(element1);
                    }
                }
            });
        });
        result.filter((value) => {
            if (value.attributes.depth != 3) {
                if (moduleStatus.mlm_plan == "Binary") {
                    if (value.children.length == 0) {
                        let newData1 = {
                            attributes: {
                                count: 0,
                                leg: "L",
                                user_name: value.attributes.user_name,
                            },
                            children: [],
                        };
                        let newData2 = {
                            attributes: {
                                count: 0,
                                leg: "R",
                                user_name: value.attributes.user_name,
                            },
                            children: [],
                        };

                        value.children.push(newData1);
                        value.children.push(newData2);
                    } else if (value.children.length == 1) {
                        if (value.children[0].attributes.position == "R") {
                            let newData = {
                                attributes: {
                                    count: 0,
                                    leg: "L",
                                    user_name: value.attributes.user_name,
                                },
                                children: [],
                            };
                            value.children.splice(0, 0, newData);
                        } else if (
                            value.children[0].attributes.position == "L"
                        ) {
                            let newData = {
                                attributes: {
                                    count: 0,
                                    leg: "R",
                                    user_name: value.attributes.user_name,
                                },
                                children: [],
                            };
                            value.children.splice(1, 0, newData);
                        }
                    }
                } else if (moduleStatus.mlm_plan == "Unilevel") {
                    // if (value.children.length == 0) {
                    //   let newData = {
                    //     attributes: {
                    //       count: 0,
                    //       disable: 1,
                    //     },
                    //     children: [],
                    //   };
                    //   value.children.push(newData);
                    // }
                    if (value.attributes.depth == "0" && user_name == "") {
                        let newData = {
                            attributes: {
                                count: 0,
                                leg: value.children.length + 1,
                                user_name: value.attributes.user_name,
                            },
                            children: [],
                        };
                        value.children.push(newData);
                    }
                } else if (moduleStatus.mlm_plan == "Matrix") {
                    if (value.children.length < treeWidth.width_ceiling) {
                        let newData = {
                            attributes: {
                                count: 0,
                                leg: value.children.length + 1,
                                user_name: value.attributes.user_name,
                            },
                            children: [],
                        };
                        value.children.push(newData);
                    }
                }
            }
        });
        let toolsTip = await Tools.findAll({
            attributes: ["name", "status", "slug"],
            prefix,
        });
        Object.entries(toolsTip).map(([key, value]) => {
            toolsArr[value.slug.replace(/-/g, "_")] = value.status
                ? true
                : false;
        });
        let data = {
            ...result[0],
            tooltip_config: toolsArr,
        };
        let response = await successMessage({
            value: data,
        });
        res.json(response);
    } catch (err) {
        res.json(err.message);
    }
};

async function reactTree1(mlmPlan, rankStatus, userId, treeType, prefix) {
    let legLockingAncestor, userLockedBinaryLeg;
    const widthCeiling = await Config.findOne({
        attributes: ["width_ceiling"],
        prefix,
    });
    const adminId = await common.getAdminId(prefix);
    let treeUserDetails = await getTreeDownline1(
        mlmPlan,
        rankStatus,
        userId,
        treeType,
        prefix
    );
    userLockedBinaryLeg = "any";
    if (userId != adminId && treeType == "tree" && mlmPlan == "Binary") {
        userLockedBinaryLeg = await getUserBinaryLeg(userId, prefix);
        if (userLockedBinaryLeg != "any") {
            let checkPos = userLockedBinaryLeg == "R" ? "L" : "R";
            legLockingAncestor = await User.findOne({
                attributes: ["id"],
                where: {
                    position: checkPos,
                    father_id: userId,
                },
                prefix,
            });
        }
    }
    const binaryLeg = await signUpSettings.findOne({
        attributes: ["binary_leg"],
        prefix,
    });
    Object.entries(treeUserDetails).map(([key, value]) => {
        if (treeType == "tree") {
            let binaryDisabledLeg = "";
            if (binaryLeg.binary_leg != "any") {
                binaryDisabledLeg = binaryLeg.binary_leg == "L" ? "R" : "L";
            } else {
                if (userLockedBinaryLeg != "any") {
                    if (userId == value.user_id) {
                        binaryDisabledLeg =
                            userLockedBinaryLeg == "L" ? "R" : "L";
                    } else {
                        if (legLockingAncestor) {
                            const checkLock = Tree.count({
                                where: {
                                    ancestor: legLockingAncestor.id,
                                    descendant: value.user_id,
                                },
                                prefix,
                            });
                            if (checkLock > 0) {
                                binaryDisabledLeg = "both";
                            }
                        }
                    }
                }
            }
            treeUserDetails[key]["disabled"] = binaryDisabledLeg;
        }
    });
    return treeUserDetails;
}

async function getTreeDownline1(mlmPlan, rankStatus, userId, treeType, prefix) {
    let selectQuery = [];
    let joinQuery = [];
    const level = await getUserTreeLevel(userId, treeType, prefix);
    if (level) {
        selectQuery = `SELECT f.id user_id, f.username as user_name , f.active, f.position, f.father_id, f.sponsor_id, f.user_level, f.sponsor_level,f.date_of_joining join_date, f.user_rank_id rank_id, u.name first_name, u.second_name last_name, CONCAT(u.name, u.second_name) full_name,u.image as photo`;
        joinQuery = `FROM ${prefix}users f LEFT JOIN ${prefix}user_details u ON f.id = u.user_id `;
    }
    if (mlmPlan == "Binary") {
        selectQuery += `,l.total_left_count as  left_count,l.total_right_count right_count,l.total_left_carry left_carry,l.total_right_carry right_carry `;
        joinQuery += `LEFT JOIN ${prefix}leg_details l ON l.user_id = f.id `;
    }
    if (mlmPlan == "Stair_Step") {
        selectQuery += `,p.total_pv personal_pv,p.total_gpv group_pv `;
        joinQuery += `LEFT JOIN ${prefix}userpv_details p ON p.user_id = f.id `;
    } else {
        selectQuery += `,f.personal_pv,f.group_pv `;
    }
    if (mlmPlan == "Donation") {
        selectQuery += ` ,dr.name donation_level `;
        joinQuery += `LEFT JOIN ${prefix}donation_levels dl ON dl.user = f.id `;
        joinQuery += `LEFT JOIN ${prefix}donation_rates dr ON dr.id = dl.level `;
    }
    if (rankStatus) {
        selectQuery += `,r.name as rank_name,r.color as rank_color`;
        joinQuery += `LEFT JOIN ${prefix}ranks r ON r.id = f.user_rank_id `;
    }
    if (treeType == "tree") {
        selectQuery += `,(f.user_level - :level) depth, GROUP_CONCAT(DISTINCT CONCAT(f2.user_level - :level, LPAD(f2.leg_position, 8, '0'))  ORDER BY f2.user_level SEPARATOR '') as br,f3.position child_position `;
        joinQuery += ` LEFT JOIN ${prefix}users f3 ON f3.father_id = f.id JOIN ${prefix}treepaths t ON t.descendant = f.id JOIN ${prefix}treepaths crumbs ON crumbs.descendant = t.descendant JOIN ${prefix}users f2 ON f2.id = crumbs.ancestor AND f2.user_level >= :level WHERE f.user_level - :level <  :tree_level AND t.ancestor = :userId GROUP BY f.id ORDER BY br;`;
    }
    if (treeType == "sponsor_tree") {
        selectQuery += `,(f.sponsor_level - :level) depth,GROUP_CONCAT(DISTINCT CONCAT(f2.sponsor_level - :level, LPAD(f2.leg_position, 8, '0'), crumbs.ancestor)  ORDER BY f2.sponsor_level SEPARATOR '') as br `;
        joinQuery += `JOIN ${prefix}sponsor_treepaths t ON t.descendant = f.id JOIN ${prefix}sponsor_treepaths crumbs ON crumbs.descendant = t.descendant JOIN ${prefix}users f2 ON f2.id = crumbs.ancestor AND f2.sponsor_level >= :level WHERE f.sponsor_level - :level <  :tree_level AND t.ancestor = :userId GROUP BY f.id HAVING depth < :tree_level ORDER BY br`;
    }
    let result = await mlm_laravel.query(selectQuery + joinQuery, {
        replacements: {
            level: level,
            userId: userId,
            tree_level: 4,
        },
        type: QueryTypes.SELECT,
        raw: true,
        prefix,
    });

    return result;
}
