const siteInfo = (sequelize, DataTypes) => {
  const siteInfo = sequelize.define(
    "siteInfo",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      logo: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "default.png",
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      phone: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      favicon: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "favicon.ico",
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      fb_link: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      twitter_link: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      insta_link: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      gplus_link: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      fb_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      insta_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      gplus_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      login_logo: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "login.png",
      },
      logo_shrink: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "logo_icon.png",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          siteInfo.tableName = `${options.prefix}company_profiles`;
        },
        beforeFind: async function (options) {
          siteInfo.tableName = `${options.prefix}company_profiles`;
        },
      },
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [
            {
              name: "id",
            },
          ],
        },
      ],
    }
  );
  // siteInfo.sync({
  //     force: false
  // })
  return siteInfo;
};

export default siteInfo;
