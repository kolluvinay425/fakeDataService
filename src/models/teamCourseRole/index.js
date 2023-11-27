import mongoose from "mongoose";

const { Schema } = mongoose;

const teamCourseRoleSchema = new Schema(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "OrganizationTeams",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "SpaceCourses",
      required: true,
    },
    role: { type: String, enum: ["teacher", "attendant"], required: true },
  },
  { timestamps: true, collection: "TeamCourseRoles" }
);

teamCourseRoleSchema.methods.toJSON = function () {
  return {
    id: this._id,
    teamId: this.teamId,
    courseId: this.spaceId,
    role: this.role,
  };
};

const TeamCourseRole = mongoose.model(
  "TeamCourseRoleSchema",
  teamCourseRoleSchema
);

export default TeamCourseRole;
