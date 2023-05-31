const replicaContent = (sequelize, DataTypes) => {
  const replicaContent = sequelize.define(
    "replicaContent",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      key: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      value: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      lang_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          replicaContent.tableName = `${options.prefix}replica_contents`;
        },
        beforeFind: async function (options) {
          replicaContent.tableName = `${options.prefix}replica_contents`;
          //   sequelize.models.user.tableName = `${options.prefix}_users`;
        },
      },
      timestamps: true,
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
  return replicaContent;
};

export default replicaContent;
