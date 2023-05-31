const ocCustomer = (sequelize, DataTypes) => {
    const ocCustomer = sequelize.define(
        'ocCustomer',
        {
            customer_id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            customer_group_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            store_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            language_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            firstname: {
                type: DataTypes.STRING(32),
                allowNull: false
            },
            lastname: {
                type: DataTypes.STRING(32),
                allowNull: false
            },
            email: {
                type: DataTypes.STRING(96),
                allowNull: false
            },
            telephone: {
                type: DataTypes.STRING(32),
                allowNull: false
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            custom_field: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            wishlist: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            newsletter: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: 0
            },
            ip: {
                type: DataTypes.STRING(40),
                allowNull: false
            },
            status: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            },
            safe: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            },
            token: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            code: {
                type: DataTypes.STRING(40),
                allowNull: false
            },
            date_added: {
                type: DataTypes.DATE,
                allowNull: false
            },
            string_token: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            customer_type: {
                type: DataTypes.STRING(50),
                allowNull: true
            }
        },
        {
            sequelize,
            hooks: {
                beforeCreate: async function (instance, options) {
                  ocCustomer.tableName = `${options.prefix}oc_customer`;
                },
                beforeFind: async function (options) {
                  ocCustomer.tableName = `${options.prefix}oc_customer`;
                },
              },
            timestamps: false,
            underscored: true,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "customer_id" },
                    ]
                },
            ]
        }
    )
    return ocCustomer
}

export default ocCustomer