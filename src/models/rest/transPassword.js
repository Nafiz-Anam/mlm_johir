const transPassword = (sequelize, DataTypes) => {
    const transPassword = sequelize.define(
        'transPassword', {
            id: {
                autoIncrement: true,
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true
            },
            user_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            password: {
                type: DataTypes.TEXT,
                allowNull: false
            }
        }, {
            sequelize,
            hooks: {
                beforeCreate: async function (instance, options) {
                    transPassword.tableName = `${options.prefix}transaction_passwords`;
                },
                beforeFind: async function (options) {
                    transPassword.tableName = `${options.prefix}transaction_passwords`;
                },
            },
            // tableName: `${Prefix}transaction_passwords`,
            timestamps: true,
            underscored: true,
            indexes: [{
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [{
                        name: "id"
                    }, ]
                },
                {
                    name: "transaction_passwords_user_id_foreign",
                    using: "BTREE",
                    fields: [{
                        name: "user_id"
                    }, ]
                },
            ]
        }
    )
    transPassword.associate = (models) => {
        transPassword.belongsTo(models.user, {
            foreignKey: 'user_id',
            as: 'transPass'
        })
    }

    // transPassword.sync({
    //     force: false
    // })
    return transPassword
}

export default transPassword