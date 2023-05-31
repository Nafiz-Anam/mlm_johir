const languageTable = (sequelize, DataTypes) => {
    const languageTable = sequelize.define(
      "languageTable",
      {
        id: {
          autoIncrement: true,
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
          primaryKey: true,
        },
        code: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        name_in_english: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        status: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
      },
      {
        sequelize,
        tableName: `languages`,
        timestamps: true,
        underscored: true,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [
              {
                name: "lang_id",
              },
            ],
          },
        ],
      }
    );
    // languageTable.sync({
    //     force: false
    // })
    return languageTable;
  };
  
  export default languageTable;
  