import mongoose from "mongoose";

const { Schema, model } = mongoose;

const SpaceCourseSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: "true",
    },
    spaceId: {
      type: Schema.Types.ObjectId,
      ref: "OrganizationSpace",
    },
    name: {
      type: String,
      required: "true",
    },
    typeId: {
      type: Schema.Types.ObjectId,
      ref: "CourseType",
    },
    coursePicture: {
      type: String,
    },
  },
  { timestamps: true, collection: "SpaceCourses" }
);

SpaceCourseSchema.methods.toJSON = function () {
  return {
    id: this._id,
    organizationId: this.organizationId,
    spaceId: this.spaceId,
    name: this.name,
    typeId: this.typeId,
    coursePicture: this.coursePicture,
  };
};

const SpaceCourse = model("SpaceCourses", SpaceCourseSchema);

export default SpaceCourse;
