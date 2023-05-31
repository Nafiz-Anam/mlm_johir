const performanceBonus = (sequelize, DataTypes) => {
  const performanceBonus = sequelize.define(
    "performanceBonus",
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
      personal_pv: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      group_pv: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      bonus_percent: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          performanceBonus.tableName = `${options.prefix}performance_bonuses`;
        },
        beforeFind: async function (options) {
          performanceBonus.tableName = `${options.prefix}performance_bonuses`;
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
  // performanceBonus.sync({force:false})
  return performanceBonus;
};

export default performanceBonus;
