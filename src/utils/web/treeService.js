const { Op, Sequelize, QueryTypes } = require("sequelize");
const db = require("../../models");
var _ = require("lodash");
const config = require("../../config/config");
const { mlm_laravel } = require("../../models");
const Prefix = config.DB_PREFIX;
const User = db.user;
const Tree = db.treepath;
const UserDetails = db.userDetails;
const sponsorTree = db.sponsorTree;
const StairStep = db.stairstep

exports.getTotalDownlineUsersCount = async (user_id) => {
  const totalDownline = await Tree.findAll({
    include: [
      {
        model: User,
        as: "T1",
        where: {
          id: {
            [Op.ne]: user_id,
          },
        },
      },
    ],
    where: {
      ancestor: user_id,
    },
  });
  const totalDownlineCount = totalDownline.length;
  return totalDownlineCount;
};

exports.getMaxLevelUser = async (user_id, prefix) => {
  const userLevel = await User.findOne({
    attributes: ["user_level"],
    where: {
      id: user_id,
    },
    prefix,
  });
  const maxLevel = await Tree.findAll({
    attributes: [[Sequelize.fn("MAX", Sequelize.col("user_level")), "level"]],
    include: [
      {
        model: User,
        as: "T1",
      },
    ],
    where: {
      ancestor: user_id,
    },
    prefix,
  });
  const level = maxLevel[0].level - userLevel.user_level;

  return level;
};

exports.getMaxLevelSponsor = async (user_id, prefix) => {
  const levels = await User.findOne({
    attributes: ["sponsor_level"],
    where: {
      id: user_id,
    },
    prefix,
  });
  const maxLevel = await Tree.findAll({
    attributes: [
      [Sequelize.fn("MAX", Sequelize.col("sponsor_level")), "level"],
    ],
    include: [
      {
        model: User,
        as: "T1",
      },
    ],
    where: {
      ancestor: user_id,
    },
    prefix,
  });
  let total = maxLevel[0].level - levels.sponsor_level;
  return total;
};

exports.getUserLevel = async (user_id, prefix) => {
  const userLevel = await User.findOne({
    attributes: ["user_level"],
    where: {
      id: user_id,
    },
    prefix,
  });
  return userLevel.user_level;
};

exports.getTotalDownlineUsersBinary = async (user_id, levelValue, prefix) => {
  let whereStatement = [];
  if (levelValue != '') {
    let condition1 = {
      level: levelValue,
    };
    whereStatement.push(condition1);
  }
  let condition2 = {
    ancestor: user_id,
  };
  whereStatement.push(condition2);
  const totalDownlineBinary = await Tree.findAll({
    include: [
      {
        model: User,
        as: "T1",
        where: {
          id: {
            [Op.ne]: user_id,
          },
        },
      },
    ],
    where: whereStatement,
    prefix,
  });
  let count = totalDownlineBinary.length;
  return count;
};

exports.getDownlineDetailsBinary = async (
  moduleStatus,
  user_id,
  page,
  limit,
  levelValue,
  prefix
) => {
  let selectQuery = [];
  let joinQuery = [];
  let level = await User.findOne({
    attributes: ["user_level"],
    where: {
      id: user_id,
    },
    prefix,
  });
  selectQuery = `SELECT f.user_level - :level as ref_level, f.username, f.active, u.name first_name, u.second_name last_name, u.image,ft3.username sponsor `;
  //TODO Check query
  joinQuery = ` FROM ${prefix}users f JOIN ${prefix}treepaths t ON t.descendant = f.id JOIN ${prefix}user_details u ON f.id = u.user_id LEFT JOIN ${prefix}users ft3 ON ft3.id = f.sponsor_id `;
  if (_.includes(["Binary", "Matrix"], moduleStatus.mlm_plan)) {
    console.log("module is matrix")
    selectQuery += `,ft2.username placement`;
    joinQuery += `LEFT JOIN ${prefix}users ft2 ON ft2.id = f.father_id `;
  }
  if (moduleStatus.product_status) {
    selectQuery += `,p.name current_package`;
    joinQuery += `LEFT JOIN ${prefix}packages p ON f.product_id = p.id `;
  }
  if (moduleStatus.rank_status) {
    selectQuery += `,r.name current_rank`;
    joinQuery += `LEFT JOIN ${prefix}ranks r ON f.user_rank_id = r.id `;
  }
  if (levelValue != '') {
    if (_.includes(["Binary", "Matrix"], moduleStatus.mlm_plan)) {
      joinQuery += `WHERE t.ancestor = :userId AND f.id != :userId AND f.user_level = :user_level ORDER BY ref_level ASC LIMIT :page,:limit;`;
    }
    if (moduleStatus.mlm_plan == "Unilevel") {
      joinQuery += `WHERE t.ancestor = :userId AND f.id != :userId AND f.sponser_level = :user_level ORDER BY ref_level ASC LIMIT :page,:limit;`;
    }
    //TODO add plan based level search query
  } else {
    joinQuery += `WHERE t.ancestor = :userId AND f.id != :userId   ORDER BY ref_level ASC LIMIT :page,:limit;`;
  }
  let result = await mlm_laravel.query(selectQuery + joinQuery, {
    replacements: {
      level: level.user_level,
      userId: user_id,
      user_level: levelValue,
      limit: limit,
      page: page,
    },
    type: QueryTypes.SELECT,
    raw: true,
    prefix,
  });
  return result;
};

exports.getTotalDownlineUsersUnilevel = async (user_id, levelValue, prefix) => {
  let whereStatement = [];
  if (levelValue != "") {
    let condition1 = {
      sponsor_level: levelValue,
    };
    whereStatement.push(condition1);
  }
  let condition2 = {
    id: {
      [Op.ne]: user_id,
    },
  };
  whereStatement.push(condition2);
  const totalDownlineUnilevel = await sponsorTree.findAll({
    include: [
      {
        model: User,
        as: "S1",
        where: whereStatement,
      },
    ],
    where: {
      ancestor: user_id,
    },
    prefix,
  });
  let count = totalDownlineUnilevel.length;
  return count;
};

exports.getDownlineDetailsUnilevel = async (
  moduleStatus,
  user_id,
  page,
  limit,
  plan,
  levelValue,
  prefix
) => {
  let selectQuery = [];
  let joinQuery = [];
  let level = await User.findOne({
    attributes: ["sponsor_level"],
    where: {
      id: user_id,
    },
    prefix,
  });
  selectQuery = `SELECT f.sponsor_level - :level as ref_level, f.username, f.active, f.date_of_joining, u.name first_name, u.second_name last_name, u.image,ft3.username sponsor`;
  joinQuery = ` FROM ${prefix}users f JOIN ${prefix}sponsor_treepaths t ON t.descendant = f.id JOIN ${prefix}user_details u ON f.id = u.user_id LEFT JOIN ${prefix}users ft3 ON ft3.id = f.sponsor_id `;
  // TODO opencart
  if (moduleStatus.product_status) {
    selectQuery += `, p.name current_package`;
    joinQuery += `LEFT JOIN ${prefix}packages p ON f.product_id = p.id `;
  }
  if (moduleStatus.rank_status) {
    selectQuery += `, r.name current_rank`;
    joinQuery += `LEFT JOIN ${prefix}ranks r ON f.user_rank_id = r.id `;
  }
  if (levelValue != "") {
    joinQuery += `WHERE t.ancestor = :userId AND f.id != :userId `;
    if (plan == "Unilevel") {
      joinQuery += `AND f.sponsor_level = :level_value `;
    }
    joinQuery += `ORDER BY ref_level ASC LIMIT :page,:limit;`;
  } else {
    joinQuery += `WHERE t.ancestor = :userId AND f.id != :userId   ORDER BY ref_level ASC LIMIT :page,:limit;`;
  }

  // return  typeof level.user_level
  let result = await mlm_laravel.query(selectQuery + joinQuery, {
    replacements: {
      level: level.sponsor_level,
      userId: user_id,
      level_value: levelValue,
      limit: limit,
      page: page,
    },
    type: QueryTypes.SELECT,
    raw: true,
    prefix,
  });
  return result;
};

exports.getChildren = async (user_id, prefix) => {
  let result = [];
  const children = await User.findAll({
    attributes: ["id", "username", "father_id", "position", "user_level"],
    include: [
      {
        model: UserDetails,
        as: "details",
        attributes: ["name", "second_name", "image"],
      },
    ],
    where: {
      father_id: user_id,
      active: {
        [Op.ne]: "server",
      },
    },
    prefix,
  });
  let child = await User.findAll({
    where: {
      father_id: user_id,
    },
    prefix,
  });
  let childCount = child.length;
  children.map((value, key) => {

    result[key] = {
      title: value.username,
      id: value.username,
      image:
        value.details.image == "no_photo.jpg" ||
        value.details.image == undefined
          ? ""
          : value.details.image,
      full_name: `${value.details.name} ${value.details.second_name}`,
      name: `${value.details.name} ${value.details.second_name}`,
      level: value.user_level,
      child: childCount,
      lazy: true,
    };
  });
  return result;
};

exports.getTreeDownlinesTooltip = async (moduleStatus, user_id, treeType, prefix) => {
  let selectQuery = [];
  let joinQuery = [];
  let level = await User.findOne({
    attributes: ["user_level"],
    where: {
      id: user_id,
    },
    prefix,
  });

  let levelValue = level.user_level + 2;
  if (level) {
    selectQuery = `SELECT f.id user_id, f.username as user_name, f.active, f.position, f.father_id, f.sponsor_id, f.user_level, f.sponsor_level, f.date_of_joining join_date, f.user_rank_id rank_id,f.personal_pv,f.group_pv, u.name first_name, u.second_name last_name, CONCAT(u.name, u.second_name) full_name, u.image `;
    joinQuery = `FROM ${prefix}users f LEFT JOIN ${prefix}user_details u ON f.id = u.user_id `;
  }
  // return level
  if (moduleStatus.mlm_plan == "Binary") {
    selectQuery += `,l.total_left_count left_count,l.total_right_count right_count,l.total_left_carry left_carry,l.total_right_carry right_carry `;
    joinQuery += `LEFT JOIN ${prefix}leg_details l ON l.user_id = f.id `;
  }
  if (moduleStatus.mlm_plan == "Stair_Step") {
    selectQuery += `,p.total_pv personal_pv,p.total_gpv group_pv `
    joinQuery   += `LEFT JOIN ${prefix}userpv_details p ON p.user_id = f.id `
  }
  if (moduleStatus.mlm_plan == "Donation") {
    selectQuery  += ` ,dr.name donation_level `
    joinQuery    += `LEFT JOIN ${prefix}donation_levels dl ON dl.user = f.id `
    joinQuery    += `LEFT JOIN ${prefix}donation_rates dr ON dr.id = dl.level `
  }
  if (moduleStatus.rank_status) {
    selectQuery += `,r.name,r.color `;
    joinQuery += `LEFT JOIN ${prefix}ranks r ON r.id = f.user_rank_id `;
  }
  if (treeType == "tree") {
    selectQuery += `,(f.user_level - :level) depth, f.id, f.username as user_name, GROUP_CONCAT(DISTINCT CONCAT(f2.user_level, LPAD(f2.leg_position, 8, '0'))  ORDER BY f2.user_level) as br,f3.position child_position `;
    joinQuery += ` LEFT JOIN ${prefix}users f3 ON f3.father_id = f.id JOIN ${prefix}treepaths t ON t.descendant = f.id JOIN ${prefix}treepaths crumbs ON crumbs.descendant = t.descendant JOIN ${prefix}users f2 ON f2.id = crumbs.ancestor WHERE f.user_level < :levelValue AND t.ancestor = :userId GROUP BY f.id ORDER BY br;`;
  }
  if (treeType == "sponsor_tree") {
    selectQuery += `,(f.sponsor_level - :level) depth, f.id, f.username, GROUP_CONCAT(DISTINCT CONCAT(f2.sponsor_level, LPAD(f2.leg_position, 8, '0')), crumbs.ancestor)  ORDER BY f2.sponsor_level) as br `;
    joinQuery += `JOIN ${prefix}sponsor_treepaths t ON t.descendant = f.id JOIN ${prefix}sponsor_treepaths crumbs ON crumbs.descendant = t.descendant JOIN ${prefix}users f2 ON f2.id = crumbs.ancestor WHERE f.sponsor_level < :levelValue AND t.ancestor = :userId GROUP BY f.id ORDER BY br`;
  }
  //    return selectQuery + joinQuery
  let result = await mlm_laravel.query(selectQuery + joinQuery, {
    replacements: {
      level: level.user_level,
      levelValue: levelValue,
      userId: user_id,
    },
    type: QueryTypes.SELECT,
    raw: true,
    prefix,
  });
  return result;
};

exports.getAllStepUsers = async (userId, prefix) => {
  let data = []
  let userData = []
  let maxStepId = await getUserStairStepId(userId,prefix)
  for (let i = 0; i < maxStepId; i++) {
    data[i] = []
  }
  let steps = await StairStep.findAll({
    attributes:['step_id','user_id'],
    include: [{
      model: User,
      attributes: ['username', 'date_of_joining', 'user_rank_id']
    }],
    where:{
      step_id :{
        [Op.ne] :0
      },
      breakaway_status: 0,
      leader_id : userId
    },
    prefix
  })
  steps.map((value,key) => {
    if(value.step_id){
      userData[value.step_id - 1] = {
        'id' : value.user_id,
        'username' : value.user.username
      } 
      data[value.step_id-1].push(userData[value.step_id - 1])
    }
  })

  return data
}

async function getUserStairStepId(userId,prefix) {
  let result = await StairStep.findOne({
    attributes:['step_id'],
    where:{
      user_id:userId
    },
    prefix
  })
  return result.step_id
}
