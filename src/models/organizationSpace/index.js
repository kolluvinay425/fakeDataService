import mongoose from "mongoose";

const { Schema } = mongoose;

const organizationSpace = new Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organizations",
      required: true,
    },
    name: { type: String, required: true },
    spacePicture: { type: String, default: "" },
  },
  { timestamps: true, collection: "OrganizationSpaces" }
);

organizationSpace.methods.toJSON = function () {
  return {
    id: this._id,
    organizationId: this.organizationId,
    name: this.name,
    spacePicture: this.spacePicture,
  };
};

const OrganizationSpace = mongoose.model(
  "OrganizationSpace",
  organizationSpace
);

export default OrganizationSpace;
