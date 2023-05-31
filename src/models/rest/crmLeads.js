const crmLeads = (sequelize, DataTypes) => {
  const crmLeads = sequelize.define(
    "crmLeads",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      first_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      added_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
      },
      email_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      skype_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      mobile_no: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      country_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: "countries",
          key: "id",
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      interest_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "0: Not That Interested 1 : Interested 2: Very Interested",
      },
      followup_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      lead_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "0: rejected 1 : ongoing 2: accepted",
      },
      confirmation_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          crmLeads.tableName = `${options.prefix}crm_leads`;
        },
        beforeFind: async function (options) {
          crmLeads.tableName = `${options.prefix}crm_leads`;
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
          name: "crm_leads_added_by_foreign",
          using: "BTREE",
          fields: [
            {
              name: "added_by",
            },
          ],
        },
        {
          name: "crm_leads_country_id_foreign",
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

  crmLeads.associate = (models) => {
    crmLeads.belongsTo(models.user, {
      foreignKey: "added_by",
    });
    crmLeads.hasOne(models.crmFollowup, {
      foreignKey: "lead_id",
    });
  };

  // crmLeads.sync({force:false})
  return crmLeads;
};

export default crmLeads;
