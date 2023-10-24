import mongoose from "mongoose";
const roleSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  authorizations: [
    {
      type: String,
      required: true,
    },
  ],
});

roleSchema.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.roles,
    authorizations: this.authorizations,
  };
};

const Role = mongoose.model("roles", roleSchema);

export default Role;
