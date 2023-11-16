import mongoose from "mongoose";

const { Schema } = mongoose;

const teamSpaceRoleSchema = new Schema(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "OrganizationTeams",
      required: true,
    },
    spaceId: {
      type: Schema.Types.ObjectId,
      ref: "OrganizationSpaces",
      required: true,
    },
    role: { type: String, enum: ["coordinator"], required: true },
  },
  { timestamps: true, collection: "TeamSpaceRoles" }
);

teamSpaceRoleSchema.methods.toJSON = function () {
  return {
    id: this._id,
    teamId: this.teamId,
    spaceId: this.spaceId,
    role: this.role,
  };
};

const TeamSpaceRole = mongoose.model(
  "TeamSpaceRoleSchema",
  teamSpaceRoleSchema
);

export default TeamSpaceRole;
