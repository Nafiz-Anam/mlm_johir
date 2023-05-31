const stairstep = (sequelize, DataTypes) => {
  const stairstep = sequelize.define(
    "stairstep",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      leader_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      step_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      breakaway_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: "0 : false 1 true",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          stairstep.tableName = `${options.prefix}stair_steps`;
        },
        beforeFind: async function (options) {
          stairstep.tableName = `${options.prefix}stair_steps`;
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
          fields: [{ name: "id" }],
        },
        {
          name: "15012_stair_steps_user_id_foreign",
          using: "BTREE",
          fields: [{ name: "user_id" }],
        },
        {
          name: "15012_stair_steps_leader_id_foreign",
          using: "BTREE",
          fields: [{ name: "leader_id" }],
        },
        {
          name: "15012_stair_steps_step_id_foreign",
          using: "BTREE",
          fields: [{ name: "step_id" }],
        },
      ],
    }
  );
  stairstep.associate = (models) => {
    stairstep.belongsTo(models.user, {
      foreignKey: "user_id",
      sourceKey: "user_id",
    });
  };
  return stairstep;
};

export default stairstep;
