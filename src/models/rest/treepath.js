const treepath = (sequelize, DataTypes) => {
    const treepath = sequelize.define(
        'treepath', {
            id: {
                autoIncrement: true,
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true
            },
            ancestor: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            descendant: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            level: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            }
        }, {
            sequelize,
            hooks: {
                beforeCreate: async function (instance, options) {
                    treepath.tableName = `${options.prefix}treepaths`;
                },
                beforeFind: async function (options) {
                    treepath.tableName = `${options.prefix}treepaths`;
                    sequelize.models.user.tableName = `${options.prefix}users`;
                },
            },
            // tableName: `${Prefix}treepaths`,
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
                    name: "treepaths_ancestor_foreign",
                    using: "BTREE",
                    fields: [{
                        name: "ancestor"
                    }, ]
                },
                {
                    name: "treepaths_descendant_foreign",
                    using: "BTREE",
                    fields: [{
                        name: "descendant"
                    }, ]
                },
            ]
        }
    )
    treepath.associate = (models) => {
        treepath.belongsTo(models.user,{
            foreignKey: 'descendant',
            as:'T1'
        })
        treepath.belongsTo(models.user,{
            foreignKey: 'ancestor',
            as:'T2'
        })
        treepath.belongsTo(models.treepath,{
            foreignKey:'descendant',
            targetKey:'descendant',
            as: 'tree2'
        })
    }
    // treepath.sync({force:false})
    return treepath
}

export default treepath