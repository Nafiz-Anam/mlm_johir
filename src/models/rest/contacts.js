const contacts = (sequelize, DataTypes) => {
  const contacts = sequelize.define(
    "contacts",
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
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      contact_info: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      owner_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      status: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      mail_added_date: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      read_msg: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "no",
        comment: "no and yes",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          contacts.tableName = `${options.prefix}contacts`;
        },
        beforeFind: async function (options) {
          contacts.tableName = `${options.prefix}contacts`;
        },
      },
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "contacts_owner_id_foreign",
          using: "BTREE",
          fields: [{ name: "owner_id" }],
        },
      ],
    }
  );
  contacts.associate = (models) => {
    contacts.belongsTo(models.user, {
      foreignKey: "owner_id",
      as: "replica",
    });
  };
  // contacts.sync({force:false})
  return contacts;
};

export default contacts;
