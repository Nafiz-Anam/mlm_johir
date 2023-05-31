const companyDetails = (sequelize, DataTypes) => {
  const companyDetails = sequelize.define(
    "companyDetails",
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
      dark_nav_icon: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      light_nav_icon: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          companyDetails.tableName = `${options.prefix}company_profiles`;
        },
        beforeFind: (options) => {
          companyDetails.tableName = `${options.prefix}company_profiles`;
        },
      },
      timestamps: false,
      underscored: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
      ],
    }
  );
  // carts.sync({force:false})
  return companyDetails;
};

export default companyDetails;
