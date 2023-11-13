import mongoose from "mongoose";

const { Schema } = mongoose;

const userCourseRoleSchema = new Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, required: true },
    accountId: { type: mongoose.Schema.Types.ObjectId, required: true },
    role: {
      type: String,
      enum: ["teacher", "attendant"],
      required: true,
    },
  },
  { timestamps: true, collection: "UserCourseRoles" }
);

userCourseRoleSchema.methods.toJSON = function () {
  return {
    id: this._id,
    courseId: this.courseId,
    accountId: this.accountId,
    role: this.role,
  };
};

const UserCourseRole = mongoose.model(
  "UserCourseRoleSchema",
  userCourseRoleSchema
);

export default UserCourseRole;
