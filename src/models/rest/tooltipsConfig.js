const tooltipsConfig = (sequelize, DataTypes) => {
    const tooltipsConfig = sequelize.define(
        'tooltipsConfig', {
            id: {
                autoIncrement: true,
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: "tooltips_config_name_unique"
            },
            status: {
                type: DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 1,
                comment: "0 : disabled 1 : enabled"
            },
            view_status: {
                type: DataTypes.TINYINT,
                allowNull: true,
                defaultValue: 1
            },
            slug: {
                type: DataTypes.STRING(255),
                allowNull: false
            }
        }, {
            sequelize,
            hooks: {
                beforeCreate: async function (instance, options) {
                    tooltipsConfig.tableName = `${options.prefix}tooltips_config`;
                },
                beforeFind: async function (options) {
                    tooltipsConfig.tableName = `${options.prefix}tooltips_config`;
                },
            },
            // tableName: `${Prefix}tooltips_config`,
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
                    name: "tooltips_config_name_unique",
                    unique: true,
                    using: "BTREE",
                    fields: [{
                        name: "name"
                    }, ]
                },
            ]
        }
    )
    // tooltipsConfig.sync({force:false})
    return tooltipsConfig
}

export default tooltipsConfig