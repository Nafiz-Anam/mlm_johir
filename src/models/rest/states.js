const states = (sequelize, DataTypes) => {
  const states = sequelize.define(
    "states",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      country_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "countries",
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "0 for disable 1 for enable",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          states.tableName = `${options.prefix}states`;
        },
        beforeFind: async function (options) {
          states.tableName = `${options.prefix}states`;
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
              name: "state_id",
            },
          ],
        },
        {
          name: "states_country_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "country_id",
            },
          ],
        },
      ],
    }
  );
  states.associate = (models) => {
    states.belongsTo(models.countries, {
      foriegnKey: "country_id",
    });
  };
  // states.sync({
  //     force: false
  // });
  return states;
};

export default states;
