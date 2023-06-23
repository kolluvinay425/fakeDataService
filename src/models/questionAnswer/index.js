import mongoose from "mongoose";

const { Schema, model } = mongoose;

/*missing fields
 likes : integer
 date use the insersion date
 lastActivity : date
 solvedDate : date
*/

const questionAnswerSchema = Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ["answer", "question"],
      required: true,
    },
    resource: {
      type: String,
      enum: ["course", "lesson"],
      required: function () {
        this.type === "question" ? true : false;
      },
    },
    user: {
      id: { type: String, required: true },
      imageUrl: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      username: { type: String, required: true },
    },
    numberOfLikes: { type: Number, required: false, default: 0 },
    solved: {
      type: Boolean,
      required: false,
      default: function () {
        this.type === "answer" ? false : null;
      },
    },
    solvedDate: {
      type: Date,
      required: [false, "Please add solvedInDate value (string)"],
    },
    lastActivity: {
      type: Date,
      required: [false, "Please add lastActivity value (string)"],
    },
    father: { type: Schema.Types.ObjectId, ref: "QuestionAnswer" },

    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: function () {
        this.resource === "course" ? true : false;
      },
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: function () {
        this.resource === "lesson" ? true : false;
      },
    },
  },
  {
    timestamps: true,
  }
);

questionAnswerSchema.methods.toJSON = function () {
  return {
    id: this._id,
    title: this.title,
    body: this.body,
    type: this.type,
    resource: this.resource,
    questionId: this.question,
  };
};

export default model("QuestionAnswer", questionAnswerSchema, "questionAnswers");
