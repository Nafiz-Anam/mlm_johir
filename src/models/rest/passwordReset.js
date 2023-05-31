const passwordReset = (sequelize, DataTypes) => {
    const passwordReset = sequelize.define(
        'passwordReset', {
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
            allowNull: false
        }
    }, {
        sequelize,
        hooks: {
            beforeCreate: async function (instance, options) {
                passwordReset.tableName = `${options.prefix}password_resets`;
            },
            beforeFind: async function (options) {
                passwordReset.tableName = `${options.prefix}password_resets`;
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
            {
                name: "14963_password_resets_email_index",
                using: "BTREE",
                fields: [
                    { name: "user_id" },
                ]
            },
        ]
    }
    )
    return passwordReset
}

export default passwordReset