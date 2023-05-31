const ocAddress = (sequelize, DataTypes) => {
    const ocAddress = sequelize.define(
        'ocAddress',
        {
            address_id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            customer_id: {
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
            company: {
                type: DataTypes.STRING(60),
                allowNull: false
            },
            address_1: {
                type: DataTypes.STRING(128),
                allowNull: false
            },
            address_2: {
                type: DataTypes.STRING(128),
                allowNull: false
            },
            city: {
                type: DataTypes.STRING(128),
                allowNull: false
            },
            postcode: {
                type: DataTypes.STRING(10),
                allowNull: false
            },
            country_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            zone_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            custom_field: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            default: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            }
        },
        {
            sequelize,
            hooks: {
                beforeCreate: async function (instance, options) {
                  ocAddress.tableName = `${options.prefix}oc_address`;
                },
                beforeFind: async function (options) {
                  ocAddress.tableName = `${options.prefix}oc_address`;
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
                        { name: "address_id" },
                    ]
                },
                {
                    name: "customer_id",
                    using: "BTREE",
                    fields: [
                        { name: "customer_id" },
                    ]
                },
            ]
        }
    )
    return ocAddress
}

export default ocAddress