const partyGuests = (sequelize, DataTypes) => {
  const partyGuests = sequelize.define(
    "partyGuests",
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
      second_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      country_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      state_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      zip: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      added_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: "0 for false 1 true",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          partyGuests.tableName = `${options.prefix}party_guests`;
        },
        beforeFind: async function (options) {
          partyGuests.tableName = `${options.prefix}party_guests`;
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
          name: "party_guests_country_id_foreign",
          using: "BTREE",
          fields: [{ name: "country_id" }],
        },
        {
          name: "party_guests_state_id_foreign",
          using: "BTREE",
          fields: [{ name: "state_id" }],
        },
        {
          name: "party_guests_added_by_foreign",
          using: "BTREE",
          fields: [{ name: "added_by" }],
        },
      ],
    }
  );

  // address.sync({force:false})
  return partyGuests;
};

export default partyGuests;
