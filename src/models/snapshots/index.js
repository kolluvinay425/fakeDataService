import mongoose, { Mongoose } from "mongoose";
import moment from "moment";

const snapshotSchema = mongoose.Schema({
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: false },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: false,
  },
  timerId: { type: mongoose.Schema.Types.ObjectId, ref: "Timer" },
});

snapshotSchema.methods.toJSON = function () {
  return {
    id: this._id,
    title: this.title,
    startTime: this.startTime,
    endTime: this.endTime,
    courseId: this.courseId,
    active: this.active,
    timerId: this.timerId,
  };
};

export default mongoose.model("Snapshot", snapshotSchema, "snapshots");
