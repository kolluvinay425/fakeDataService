import mongoose, { Mongoose } from "mongoose";

const attachmentSchema = mongoose.Schema({
  name: { type: String, required: true },
  file: { type: String, required: true },
  size: { type: Number, required: false },
});

attachmentSchema.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    size: this.size,
    file: this.file,
  };
};

export default mongoose.model("Attachment", attachmentSchema, "attachments");