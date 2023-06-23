import mongoose from "mongoose";


const videoSchema = mongoose.Schema({
  url: String , 
  duration: { type: Number },
  durationTime: String,
})


const lessonSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
   video: videoSchema,
    cover: { type: String, required: false },
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attachment" }],
    questionAndAnswers: {
      totalQuestions: {
        type: Number,
        default: 0,
        required: [false, "Please add totalQuestions value (Number)"],
      },
      teacherAnswers: {
        type: Number,
        default: 0,
        required: [false, "Please add teacherAnswers value (Number)"],
      },
      totalQuestionSolved: {
        type: Number,
        default: 0,
        required: [false, "Please add totalQuestionSolved value (Number)"],
      },
    },
  },
  { timestamps: true }
);



lessonSchema.methods.toJSON = function () {
  return {
    id: this._id,
    title: this.title.trim(),
    video: this.video,
    cover: this.cover,
    duration: this.duration,
    durationTime: this.durationTime,
    attachments: this.attachments,
  };
};

export default mongoose.model("Lesson", lessonSchema, "lessons");
