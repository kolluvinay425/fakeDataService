import mongoose from "mongoose";

const { Schema, model } = mongoose;

const organizationTeam = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organizations",
      required: true,
    },
    name: { type: String, required: true },
    picture: { type: String, default: "" },
  },
  { timestamps: true, collection: "OrganizationTeams" }
);

organizationTeam.methods.toJSON = function () {
  return {
    id: this._id,
    organizationId: this.organizationId,
    name: this.name,
    picture: this.picture,
  };
};

const OrganizationTeam = model("OrganizationTeams", organizationTeam);

export default OrganizationTeam;
