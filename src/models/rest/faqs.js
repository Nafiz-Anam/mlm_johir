const faqs = (sequelize, DataTypes) => {
  const faqs = sequelize.define(
    "faqs",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      answer: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          faqs.tableName = `${options.prefix}faqs`;
        },
        beforeFind: async function (options) {
          faqs.tableName = `${options.prefix}faqs`;
        },
      },
      // tableName: `${Prefix}faqs`,
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
  // faqs.sync({force:false})
  return faqs;
};

export default faqs;
