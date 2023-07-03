import mongoose from "mongoose";

const { Schema, model } = mongoose;

const courseLikes = Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  profilePicture: { type: String, required: true },
  userId: { type: String, required: true },
  courseId: { type: Schema.Types.ObjectId, ref: "Course" },
});

courseLikes.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    surname: this.surname,
    userId: this.userId,
    profilePicture: this.profilePicture,
    course: this.course,
  };
};

export default model("CourseLikes", courseLikes, "CourseLikes");
