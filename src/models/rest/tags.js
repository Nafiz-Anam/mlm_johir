const tags = (sequelize, DataTypes) => {
  const tags = sequelize.define(
    "tags",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      tag: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "0: blocked 1 : active",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          tags.tableName = `${options.prefix}tags`;
        },
        beforeFind: async function (options) {
          tags.tableName = `${options.prefix}tags`;
          sequelize.models.ticketTags.tableName = `${options.prefix}ticket_tags`;
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
      ],
    }
  );
  tags.associate = (models) => {
    tags.hasOne(models.ticketTags, {
      foreignKey: "tag_id",
    });
  };
  return tags;
};

export default tags;
