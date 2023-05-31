const countryTable = (sequelize, DataTypes) => {
    const countryTable = sequelize.define(
      "countryTable",
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
        code: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        phone_code: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        iso_code: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        status: {
          type: DataTypes.TINYINT,
          allowNull: false,
          defaultValue: 1,
          comment: "0 for disable 1 for enable",
        },
      },
      {
        sequelize,
        tableName: `countries`,
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
    countryTable.associate = (models) => {
      countryTable.hasMany(models.states, {
        foreignKey: "country_id",
      });
    };
    // countryTable.sync({
    //     force: false
    // });
    return countryTable;
  };
  
  export default countryTable;
  