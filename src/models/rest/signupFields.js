const signupField = (sequelize, DataTypes) => {
  const signupField = sequelize.define(
    "signupField",
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
      type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      required: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "1:yes, 0:no",
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "1: active, 0:disabled",
      },
      editable: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "1:active, 0:disabled",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          signupField.tableName = `${options.prefix}signup_fields`;
        },
        beforeFind: async function (options) {
          signupField.tableName = `${options.prefix}signup_fields`;
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
  // signupField.sync({
  //     force: false
  // })
  return signupField;
};

export default signupField;
