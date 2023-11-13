import mongoose from "mongoose";

const { Schema } = mongoose;

const organizationAccountRoleSchema = new Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    accountId: { type: mongoose.Schema.Types.ObjectId },

    role: {
      type: String,
      enum: ["Admin", "Owner", "Member"],
      required: true,
    },

    invitationStatus: {
      type: String,
      enum: ["pending", "accepted", "active"],
      default: "pending",
    },
    email: { type: String },
    profilePicture: { type: String },
    nameSurname: { type: String },
  },
  { timestamps: true, collection: "OrganizationAccountRoles" }
);

organizationAccountRoleSchema.methods.toJSON = function () {
  return {
    id: this._id,
    organizationId: this.organizationId,
    accountId: this.accountId,

    invitationStatus: this.invitationStatus,
    email: this.email,
    profilePicture: this.profilePicture,

    role: this.role,
    invitationStatus: this.invitationStatus,
    email: this.email,
    profilePicture: this.profilePicture,
    nameSurname: this.nameSurname,
  };
};

const OrganizationAccountRole = mongoose.model(
  "OrganizationAccountRoleSchema",
  organizationAccountRoleSchema
);

export default OrganizationAccountRole;
