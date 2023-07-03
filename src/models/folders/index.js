import mongoose from "mongoose";

const { Schema, model } = mongoose;

const directorySchema = Schema({
  name: {
    type: String,
    required: function () {
      this.course ? false : true;
    },
  },
  type: { type: String, enum: ["folder", "course"], required: true },
  language: { type: String, required: true },
  upperFolderId: { type: Schema.Types.ObjectId, ref: "Directory" },
  userId: { type: String, required: true },
  course: { type: Schema.Types.ObjectId, ref: "Course" },
});

directorySchema.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    type: this.type,
    language: this.language,
    upperFolderId: this.upperFolderId,
    course: this.course,
  };
};

export default model("Directory", directorySchema, "directories");
