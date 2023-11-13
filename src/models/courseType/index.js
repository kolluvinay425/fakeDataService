import mongoose from "mongoose";

const { Schema } = mongoose;

const courseTypeSchema = new Schema(
  {
    language: {
      type: String,
    },
    value: {
      type: String,
    },
  },
  { timestamps: true, collection: "CourseTypes" }
);

courseTypeSchema.methods.toJSON = function () {
  return {
    id: this._id,
    language: this.language,
    value: this.value,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const CourseType = mongoose.model("CourseTypes", courseTypeSchema);

export default CourseType;
