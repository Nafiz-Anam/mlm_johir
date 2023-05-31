const { successMessage, errorMessage } = require("../../utils/app/response");
const { Op } = require("sequelize");
const { mlm_laravel } = require("../../models");
const fs = require("fs");
const moment = require("moment");
const uploadFile = require("../../middleware/app/bannerUpload");
const db = require("../../models");
const { join } = require("path");
const path = require("path");
const common = require("../../utils/app/common");
const News = db.news;
const Faqs = db.faqs;
const ReplicaBanner = db.replicaBanner;
const User = db.user;
const UserDetails = db.userDetails;
const leads = db.crmLeads;
const followup = db.crmFollowup;
const Document = db.documents;
const { encrypt, decrypt } = require("../../middleware/app/encryption");
const sequelize = require("sequelize");
const multer = require("multer");

exports.getAllNews = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    let newsArr = [];
    const totalNews = await News.findAll({ prefix });
    const totalNewsLength = totalNews.length;
    const news = await News.findAll({ prefix });
    Object.entries(news).map(([key, value]) => {
      newsArr[key] = {
        news_id: value.id,
        news_title: value.title,
        description: value.description,
        news_date: value.created_at,
        news_image: value.image,
      };
    });
    let data = {
      total_news_count: totalNewsLength,
      news_data: newsArr,
    };
    let response = await successMessage({
      value: data,
    });
    res.json(response);
  } catch (err) {
    console.log(err);
  }
};

exports.getViewNews = async (req, res) => {
  const prefix = req.headers["api-key"];
  if (!prefix) {
    let response = await errorMessage({ code: 1001 });
    return res.json(response);
  }
  let [news, recent, data] = [[], [], []];
  let image, data1, data2;
  const { news_id } = req.query;
  let news_data = [];
  if (news_id) {
    try {
      const newsLatest = await News.findAll({
        attributes: [
          "id",
          "description",
          "image",
          "title",
          ["created_at", "date"],
        ],
        where: {
          id: news_id,
        },
        order: ["created_at"],
        prefix,
      });
      Object.entries(newsLatest).map(([key, value]) => {
        if (value.image != "null") {
          image = value.image;
        } else {
          image = `${process.env.SITE_URL}/uploads/news/default.png`;
        }
        news_data[key] = {
          news_id: value.id,
          news_desc: value.description,
          news_date: moment(value.date).format("MMMM Do YYYY, h:mm:ss a"),
          news_image: image,
          news_title: value.title,
        };
      });
      const newsRecent = await News.findAll({
        attributes: [
          "id",
          "description",
          "image",
          "title",
          ["created_at", "date"],
        ],
        where: {
          id: {
            [Op.ne]: news_id,
          },
        },
        order: ["created_at"],
        prefix,
      });
      Object.entries(newsRecent).map(([key, value]) => {
        if (value.image != "null") {
          image = value.image;
        } else {
          image = `${process.env.SITE_URL}/uploads/news/default.png`;
        }
        recent[key] = {
          news_id: value.id,
          news_desc: value.description,
          news_date: moment(value.date).format("MMMM Do YYYY, h:mm:ss a"),
          news_image: image,
          news_title: value.title,
        };
      });
      let data = {
        active_news: news_data,
        recent_news: recent,
      };
      return res.json({
        status: true,
        data,
      });
    } catch (err) {
      res.json(err.message);
    }
  }
};

exports.getFaqs = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    let faqs = [];
    const faq = await Faqs.findAll({ order: ["sort_order"], prefix });
    Object.entries(faq).map(([key, value]) => {
      faqs[key] = {
        id: value.id,
        question: value.question,
        answer: value.answer,
        status: value.status,
        order: value.sort_order,
      };
    });
    let data = {
      faq: faqs,
    };
    return res.json({
      status: true,
      data,
    });
  } catch (err) {
    res.json(err.message);
  }
};

exports.getReplicaBanner = async (req, res) => {
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const id = req.user.id;
    data = {
      replica_banner: "",
    };
    let banner = await ReplicaBanner.findOne({
      attributes: ["image"],
      raw: true,
      where: {
        user_id: id,
      },
      prefix,
    });
    if (banner?.hasOwnProperty("image")) {
      let bannerImage = await common.convertToIpUrl(banner.image)
      data = {
        ...data,
        replica_banner: bannerImage,
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

exports.replicaBanner = async (req, res) => {
  let t = await mlm_laravel.transaction();
  var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  try {
    const prefix = req.headers["api-key"];
    if (!prefix) {
      let response = await errorMessage({ code: 1001 });
      return res.json(response);
    }
    const id = req.user.id;
    await uploadFile(req, res, async function (err) {
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
        if (req.file == undefined) {
          let response = await errorMessage({
            code: 1032,
          });
          return res.json(response);
        }
        const banner = await ReplicaBanner.findOne({
          attributes: ["id", "image"],
          where: {
            user_id: id,
          },
          prefix,
        });
        if (banner) {
          const oldImageUrl = join(
            __dirname,
            "/../../../uploads/images/banner/",
            banner.image ? banner.image : ""
          );
          if (banner.image != "default_banner.jpg") {
            if (fs.existsSync(oldImageUrl)) {
              fs.unlinkSync(oldImageUrl);
            }
          }
          await banner.update(
            {
              image: `${process.env.image_url}banner/${req.file.filename}`,
            },
            { transaction: t },
            prefix
          );
        } else {
          await ReplicaBanner.create(
            {
              user_id: id,
              image: `${process.env.image_url}banner/${req.file.filename}`,
            },
            {
              transaction: t,
              prefix,
            }
          );
        }
        // user Activity

        await common.insertUserActivity(
          "Replica Banner",
          id,
          "Replica Banner uploaded by user",
          "",
          t,
          ip,
          prefix
        );
        await t.commit();
        let response = await successMessage({
          message: "Top banner updated",
        });
        return res.json(response);
      }
    });
  } catch (err) {
    await t.rollback();
    return res.json(err.message);
  }
};

exports.getLeads = async (req, res) => {
  let leads = [];
  const userId = req.user.id;
  let username = req.user.username;
  const prefix = req.headers["api-key"];
  if (!prefix) {
    let response = await errorMessage({
      code: 1001,
    });
    return res.json(response);
  }
  let { keyword, start, order, length } = req.query;

  const commentsData = async (id) => {
    return await followup.findAll({
      raw: true,
      nest: true,
      attributes: [
        "id",
        "lead_id",
        "followup_entered_by",
        "description",
        "image",
        "followup_date",
        "updated_at",
      ],
      where: {
        lead_id: id,
      },
      prefix,
    });
  };

  try {
    const leadsDetails = await getLeadDetails(
      userId,
      keyword,
      start,
      length,
      prefix
    );
    let adminUsername = await common.getAdminUsername(prefix);
    for await (let [key, value] of Object.entries(leadsDetails)) {
      leads[key] = {
        id: value.id,
        sponser_name: value.user.username,
        first_name: value.first_name,
        last_name: value.last_name,
        email: value.email_id,
        skype_id: value.skype_id,
        country: value.country,
        phone: value.mobile_no,
        date: value.date,
        status:
          value.lead_status == 2
            ? "Accepted"
            : value.lead_status == 0
            ? "Rejected"
            : "Ongoing",
        user_detail_name: value.user.details.name,
        user_detail_second_name: value.user.details.second_name,
        description: value.description,
        comments: await commentsData(value.id),
      };
    }
    let data = {
      leads: leads,
      count: leadsDetails.length,
      lead_url: `${process.env.LCP_URL}/lcp/${username}/${adminUsername}`,
    };

    return res.json({
      status: true,
      data,
    });
  } catch (err) {
    return res.json(err.message);
  }
};

exports.leads = async (req, res) => {
  const prefix = req.headers["api-key"];
  if (!prefix) {
    let response = await errorMessage({ code: 1001 });
    return res.json(response);
  }
  const userId = req.user.id;
  let id = req.params.id;
  let { comment, status } = req.body;
  let t = await mlm_laravel.transaction();

  try {
    if (comment.trim() == "") {
      let response = await errorMessage({ code: 406 });
      return res.status(422).json(response);
    }
    await followup.create(
      {
        description: comment,
        lead_id: id,
        followup_entered_by: userId,
        followup_date: new Date(),
      },
      {
        transaction: t,
        prefix,
      }
    );
    const leadsDetails = await leads.findOne({
      where: {
        id: id,
      },
      prefix,
    });
    await leadsDetails.update(
      {
        lead_status: status == "Rejected" ? 0 : status == "Accepted" ? 2 : 1,
      },
      {
        transaction: t,
      },
      prefix
    );
    await t.commit();
    let response = await successMessage({
      code: 204,
    });
    return res.json(response);
  } catch (err) {
    await t.rollback();
    console.log(err);
    return res.json(err.message);
  }
};

exports.downloadProduct = async (req, res) => {
  const prefix = req.headers["api-key"];
  if (!prefix) {
    let response = await errorMessage({ code: 1001 });
    return res.json(response);
  }
  const { id } = req.user.id;
  const documentData = await Document.findAll({
    raw: true,
    nest: true,
    order: [["created_at", "DESC"]],
    prefix,
  });
  let newdata = [];
  if (documentData.length > 0) {
    for await (let [key,value] of Object.entries(documentData)){
      newdata[key]={
        id:value.id,
        file_title:value.file_title,
        doc_file_name:value.file_name,
        uploaded_date:value.createdAt.toISOString().slice(0, 10),
        doc_desc:value.file_description,
        ctgry:value.cat_id,
        read_status	:0,
        doc_icone: ''
      }
      var ext = path.extname(value.file_name);
      if (ext == ".png" || ext == ".jpg" || ext == ".pdf" || ext == ".jpeg") {
        newdata[key]['doc_icone'] = `${process.env.ADMIN_URL}assets/images/logos/jpg.jpg`
      }
      if (ext == ".pdf" || ext == ".xlsx" || ext == ".word" || ext == ".docx" || ext == "ods") {
        newdata[key]['doc_icone'] = `${process.env.ADMIN_URL}assets/images/logos/doc.jpg`
      }
      if (ext == ".mp4" || ext == ".avi" || ext == ".flv" || ext == ".mpg" || ext == "wmv" || ext == "3gp" || ext == "rm") {
        newdata[key]['doc_icone'] = `${process.env.ADMIN_URL}assets/images/logos/mp4.jpg`
      }
    }
  }
  res.json({
    status: true,
    data: {
      documen_data: newdata,
    },
  });
};

exports.inviteEmails = async (req, res) => {
  return res.json({
    status: true,
    data: {
      social_emails: [],
      banners: [],
      invite_history: [],
      text_invite: [],
      social_invite: [],
    },
  });
};
async function getLeadDetails(userId, keyword, start, length, prefix) {
  let whereStatement = [];
  if (userId) {
    let condition1 = {
      added_by: userId,
    };
    whereStatement.push(condition1);
  }
  if (keyword) {
    let condition2 = {
      [Op.or]: {
        first_name: {
          [Op.like]: keyword,
        },
        last_name: {
          [Op.like]: keyword,
        },
        email_id: {
          [Op.like]: keyword,
        },
        mobile_no: {
          [Op.like]: keyword,
        },
        skype_id: {
          [Op.like]: keyword,
        },
      },
    };
    whereStatement.push(condition2);
  }
  const details = await leads.findAll({
    include: [
      {
        model: User,
        attributes: ["username"],
        include: [
          {
            model: UserDetails,
            as: "details",
            attributes: ["name", "second_name"],
          },
        ],
      },
      // {
      //   model: followup,
      //   attributes: [
      //     "id",
      //     "lead_id",
      //     "followup_entered_by",
      //     "description",
      //     "image",
      //     "followup_date",
      //     "updated_at",
      //     [sequelize.fn('GROUP_CONCAT',sequelize.col('description')),'description']
      //   ],
      //   group:['lead_id']
      // },
    ],
    where: whereStatement,
    offset: parseInt(start),
    limit: parseInt(length),
    prefix,
  });
  return details;
}
