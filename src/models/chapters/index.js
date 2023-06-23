import mongoose, { Mongoose } from "mongoose";

const chapterSchema = mongoose.Schema({
  title: { type: String, required: true },
  public: { type: Boolean, required: true },
  lessons:[{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
  totalLessonDuration: { type: Number },
});

chapterSchema.methods.toJSON = function () {
  return {
    id: this._id,
    title: this.title.trim(),
    public: this.public,
    lessons: this.lessons,
  };
};

export default mongoose.model("Chapter", chapterSchema, "chapters");
