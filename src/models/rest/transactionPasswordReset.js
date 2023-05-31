const transPassReset = (sequelize, DataTypes) => {
    const transPassReset = sequelize.define(
        'transPassReset', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        token: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            comment: "0 for false 1 for true"
        }
    }, {
        sequelize,
        hooks: {
            beforeCreate: async function (instance, options) {
                transPassReset.tableName = `${options.prefix}transaction_password_resets`;
            },
            beforeFind: async function (options) {
                transPassReset.tableName = `${options.prefix}transaction_password_resets`;
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
                    { name: "id" },
                ]
            },
        ]
    }
    )
    return transPassReset
}

export default transPassReset