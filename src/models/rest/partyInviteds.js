const partyInviteds = (sequelize, DataTypes) => {
    const partyInviteds = sequelize.define(
      "partyInviteds",
      {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true
          },
          guest_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
          },
          party_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
          },
          added_by: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
          },
          status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            comment: "0 for false 1 true"
          }
      },
      {
        sequelize,
        hooks: {
          beforeCreate: async function (instance, options) {
            partyInviteds.tableName = `${options.prefix}party_guest_inviteds`;
          },
          beforeFind: async function (options) {
            partyInviteds.tableName = `${options.prefix}party_guest_inviteds`;
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
              name: "party_guest_inviteds_guest_id_foreign",
              using: "BTREE",
              fields: [
                { name: "guest_id" },
              ]
            },
            {
              name: "party_guest_inviteds_party_id_foreign",
              using: "BTREE",
              fields: [
                { name: "party_id" },
              ]
            },
            {
              name: "party_guest_inviteds_added_by_foreign",
              using: "BTREE",
              fields: [
                { name: "added_by" },
              ]
            },
          ]
      }
    );
  
    // address.sync({force:false})
    return partyInviteds;
  };
  
  export default partyInviteds;
  