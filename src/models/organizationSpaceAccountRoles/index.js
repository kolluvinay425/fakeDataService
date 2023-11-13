import mongoose from "mongoose";

const { Schema } = mongoose;

const organizationSpacesAccountRoleSchema = new Schema(
  {
    spaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizationSpace",
      required: true,
    },
    accountId: { type: mongoose.Schema.Types.ObjectId, required: true },
    role: {
      type: String,
      enum: ["coordinator"],
      required: true,
    },

    setByTeam: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "OrganizationSpacesAccountRoles" }
);

organizationSpacesAccountRoleSchema.methods.toJSON = function () {
  return {
    id: this._id,
    spaceId: this.spaceId,
    accountId: this.accountId,
    role: this.role,
  };
};

const OrganizationSpacesAccountRole = mongoose.model(
  "OrganizationSpacesAccountRoleSchema",
  organizationSpacesAccountRoleSchema
);

export default OrganizationSpacesAccountRole;
