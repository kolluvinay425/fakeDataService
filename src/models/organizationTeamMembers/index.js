import mongoose from "mongoose";

const { Schema } = mongoose;

const organizationTeamMemberSchema = new Schema(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "OrganizationTeams",
      required: true,
    },
    accountId: {
      type: Schema.Types.ObjectId,
    },
  },
  { timestamps: true, collection: "OrganizationTeamMembers" }
);

organizationTeamMemberSchema.methods.toJSON = function () {
  return {
    id: this._id,
    teamId: this.teamId,
    accountId: this.accountId,
  };
};

const OrganizationTeamMember = mongoose.model(
  "OrganizationTeamMemberSchema",
  organizationTeamMemberSchema
);

export default OrganizationTeamMember;
