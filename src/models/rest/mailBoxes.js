const mailBoxes = (sequelize, DataTypes) => {
  const mailBoxes = sequelize.define(
    "mailBoxes",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      from_user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      to_user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      to_all: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      subject: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      inbox_delete_status: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      sent_delete_status: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      deleted_by: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      parent_user_mail_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      thread: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      read_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          mailBoxes.tableName = `${options.prefix}mail_boxes`;
        },
        beforeFind: async function (options) {
          mailBoxes.tableName = `${options.prefix}mail_boxes`;
          sequelize.models.userDetails.tableName = `${options.prefix}user_details`;
          sequelize.models.user.tableName = `${options.prefix}users`;
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
        {
          name: "mail_boxes_from_user_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "from_user_id",
            },
          ],
        },
        {
          name: "mail_boxes_to_user_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "to_user_id",
            },
          ],
        },
      ],
    }
  );
  mailBoxes.associate = (models) => {
    mailBoxes.belongsTo(models.userDetails, {
      foreignKey: "from_user_id",
      targetKey: "user_id",
      as: "from user",
    });
    mailBoxes.belongsTo(models.userDetails, {
      foreignKey: "to_user_id",
      targetKey: "user_id",
      as: "to user",
    });
  };
  // mailBoxes.sync({force:false})
  return mailBoxes;
};

export default mailBoxes;
