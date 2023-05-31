const partyHosts = (sequelize, DataTypes) => {
  const partyHosts = sequelize.define(
    "partyHosts",
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
        allowNull: true,
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
      party_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      guest: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
      user: {
        type: DataTypes.TINYINT,
        allowNull: true,
        comment: "0 for false 1 true",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          partyHosts.tableName = `${options.prefix}party_hosts`;
        },
        beforeFind: async function (options) {
          partyHosts.tableName = `${options.prefix}party_hosts`;
          sequelize.models.countries.tableName = `${options.prefix}countries`;
          sequelize.models.states.tableName = `${options.prefix}states`;
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
          name: "party_hosts_country_id_foreign",
          using: "BTREE",
          fields: [{ name: "country_id" }],
        },
        {
          name: "party_hosts_state_id_foreign",
          using: "BTREE",
          fields: [{ name: "state_id" }],
        },
        {
          name: "party_hosts_added_by_foreign",
          using: "BTREE",
          fields: [{ name: "added_by" }],
        },
      ],
    }
  );
  partyHosts.associate = (models) => {
    partyHosts.belongsTo(models.countries, {
      foreignKey: "country_id",
      as: "country",
    });
    partyHosts.belongsTo(models.states, {
      foreignKey: "state_id",
      as: "state",
    });
  };
  // address.sync({force:false})
  return partyHosts;
};

export default partyHosts;
