const ticketFaqs = (sequelize, DataTypes) => {
  const ticketFaqs = sequelize.define(
    "ticketFaqs",
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
        comment: "0: inactive 1 : active",
      },
      category_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "ticket_categories",
          key: "id",
        },
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
            ticketFaqs.tableName = `${options.prefix}ticket_faqs`;
        },
        beforeFind: async function (options) {
            ticketFaqs.tableName = `${options.prefix}ticket_faqs`;
        },
    },
      timestamps: true,
      underscored : true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "ticket_faqs_category_id_foreign",
          using: "BTREE",
          fields: [{ name: "category_id" }],
        },
      ],
    }
  );
  return ticketFaqs
};

export default ticketFaqs