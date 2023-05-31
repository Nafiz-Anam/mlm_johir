const userCommissionStatus = (sequelize, DataTypes) => {
    const userCommissionStatus = sequelize.define(
        "userCommissionStatus",
        {
            id: {
                autoIncrement: true,
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true
            },
            parent_id: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            commission: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            user_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false
            },
            data: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            status: {
                type: DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 0,
                comment: "0:initiated, 1:success, 2:failed"
            },
            date: {
                type: DataTypes.DATE,
                allowNull: true
            }
        }, {
        sequelize,
        hooks: {
            beforeCreate: async function (instance, options) {
                userCommissionStatus.tableName = `${options.prefix}user_commission_status_histories`;
            },
            beforeFind: async function (options) {
                userCommissionStatus.tableName = `${options.prefix}user_commission_status_histories`;
            },
          },
        timestamps: true,
        underscored : true,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "id" },
                ]
            },
            {
                name: "14963_user_commission_status_histories_user_id_foreign",
                using: "BTREE",
                fields: [
                    { name: "user_id" },
                ]
            },
        ]
    });

    return userCommissionStatus
}

export default userCommissionStatus