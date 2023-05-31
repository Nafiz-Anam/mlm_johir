const currencyTable = (sequelize, DataTypes) => {
    const currencyTable = sequelize.define(
      "currencyTable",
      {
        id: {
          autoIncrement: true,
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
          primaryKey: true,
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        code: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        value: {
          type: DataTypes.DOUBLE(8, 2),
          allowNull: false,
          defaultValue: 0.0,
        },
        symbol_left: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        symbol_right: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        status: {
          type: DataTypes.TINYINT,
          allowNull: false,
          defaultValue: 0,
        },
        default: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        delete_status: {
          type: DataTypes.STRING(255),
          allowNull: false,
          defaultValue: "yes",
        },
      },
      {
        sequelize,
         tableName: `currency_details`,
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
    // currencyTable.sync({
    //     force: false
    // })
    return currencyTable;
  };
  
  export default currencyTable;
  