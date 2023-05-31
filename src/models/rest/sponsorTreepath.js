const sponsorTree = (sequelize, DataTypes) => {
  const sponsorTree = sequelize.define(
    "sponsorTree",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      ancestor: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      descendant: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          sponsorTree.tableName = `${options.prefix}sponsor_treepaths`;
        },
        beforeFind: async function (options) {
          sponsorTree.tableName = `${options.prefix}sponsor_treepaths`;
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
          fields: [
            {
              name: "id",
            },
          ],
        },
        {
          name: "sponsor_treepaths_ancestor_foreign",
          using: "BTREE",
          fields: [
            {
              name: "ancestor",
            },
          ],
        },
        {
          name: "sponsor_treepaths_descendant_foreign",
          using: "BTREE",
          fields: [
            {
              name: "descendant",
            },
          ],
        },
      ],
    }
  );
  sponsorTree.associate = (models) => {
    sponsorTree.belongsTo(models.user, {
      foreignKey: "descendant",
      as: "S1",
    });
  };
  // sponsorTree.sync({force:false})
  return sponsorTree;
};

export default sponsorTree;
