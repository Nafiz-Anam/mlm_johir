const parties = (sequelize, DataTypes) => {
  const parties = sequelize.define(
    "parties",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      host_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      from_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      from_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      to_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      to_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "Na",
      },
      country_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      state_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      zip: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      guest_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      added_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      address_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      closed_by: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "user or out_of_date",
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: "0 : close, 1 : open",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          parties.tableName = `${options.prefix}parties`;
        },
        beforeFind: async function (options) {
          parties.tableName = `${options.prefix}parties`;
        },
      },
      // tableName: '15022_parties',
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
          name: "parties_host_id_foreign",
          using: "BTREE",
          fields: [{ name: "host_id" }],
        },
        {
          name: "parties_country_id_foreign",
          using: "BTREE",
          fields: [{ name: "country_id" }],
        },
        {
          name: "parties_state_id_foreign",
          using: "BTREE",
          fields: [{ name: "state_id" }],
        },
        {
          name: "parties_added_by_foreign",
          using: "BTREE",
          fields: [{ name: "added_by" }],
        },
      ],
    }
  );
  return parties;
};

export default parties;
