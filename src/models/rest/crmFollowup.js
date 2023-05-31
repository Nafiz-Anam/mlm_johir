const crmFollowup = (sequelize, DataTypes) => {
  const crmFollowup = sequelize.define(
    "crmFollowup",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      lead_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "crm_leads",
          key: "id",
        },
      },
      followup_entered_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      followup_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          crmFollowup.tableName = `${options.prefix}crm_followups`;
        },
        beforeFind: async function (options) {
          crmFollowup.tableName = `${options.prefix}crm_followups`;
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
          name: "crm_followups_lead_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "lead_id",
            },
          ],
        },
        {
          name: "crm_followups_followup_entered_by_foreign",
          using: "BTREE",
          fields: [
            {
              name: "followup_entered_by",
            },
          ],
        },
      ],
    }
  );
  crmFollowup.associate = (models) => {
    crmFollowup.belongsTo(models.crmLeads, {
      foreignKey: "lead_id",
    });
  };
  // crmFollowup.sync({force:false})
  return crmFollowup;
};

export default crmFollowup;
