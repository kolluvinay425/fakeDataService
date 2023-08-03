import mongoose, { Mongoose } from "mongoose";

const chapterSchema = mongoose.Schema({
  title: { type: String, required: true },
  public: { type: Boolean, required: true },
  duration: { type: Number, default: 0 },
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
  totalLessonDuration: { type: Number },
});

export const minuteToHour = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = remainingMinutes.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}`;
};

chapterSchema.methods.toJSON = function () {
  return {
    id: this._id,
    title: this.title.trim(),
    duration: minuteToHour(this.duration),
    public: this.public,
    lessons: this.lessons,
  };
};

export default mongoose.model("Chapter", chapterSchema, "chapters");
