import mongoose from "mongoose";
import moment from "moment";

const { Schema, model } = mongoose;

/*missing fields
 likes : integer
 date use the insersion date
 lastActivity : date
 solvedDate : date
*/

const user = Schema({
  id: { type: String, required: true },
  imageUrl: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true },
  owner: { type: Boolean, default: false },
});

const questionAnswerSchema = Schema(
  {
    title: { type: String },
    body: { type: String, required: true },
    numberOfAnswers: { type: Number, default: 0 },
    numberOfUsers: { type: Number, default: 0 },
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
    user: { type: user, required: true },
    answeredTo: { type: user, required: false },
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
    },

    chapterId: {
      type: Schema.Types.ObjectId,
      ref: "Chapter",
    },

    lessonId: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
    },

    lessonReference: { type: String },

    answered: { type: Boolean, default: false },
    teacherAnswered: { type: Boolean, default: false },
    peopleActive: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const calculateData = (createdAt, updatedAt) => {
  let now = moment();
  let momentFromData = moment(updatedAt);
  if (now.diff(momentFromData, "years") > 0) {
    return `${now.diff(momentFromData, "years")} years`;
  }

  if (now.diff(momentFromData, "month") > 0) {
    return `${now.diff(momentFromData, "mounths")} months`;
  }

  if (now.diff(momentFromData, "weeks") > 0) {
    return `${now.diff(momentFromData, "weeks")} weeks`;
  }

  if (now.diff(momentFromData, "days") > 0) {
    return `${now.diff(momentFromData, "days")} days`;
  }

  if (now.diff(momentFromData, "hours") > 0) {
    return `${now.diff(momentFromData, "hours")} hours`;
  }

  if (now.diff(momentFromData, "minutes") > 0) {
    return `${now.diff(momentFromData, "minutes")} minutes`;
  }

  if (now.diff(momentFromData, "seconds") > 0) {
    return `just now`;
  }
};

questionAnswerSchema.methods.toJSON = function () {
  return {
    id: this._id,
    title: this.title,
    body: this.body,
    type: this.type,
    resource: this.resource,
    questionId: this.question,
    user: this.user,
    answeredTo: this.type === "answer" ? this.answeredTo : {},
    solved: this.type == "question" ? this.solved : false,
    lastActivity: calculateData(this.createdAt, this.updatedAt),
    createdAt: this.createdAt,
    parent: this.father,
    numberOfLikes: this.numberOfLikes,
    numberOfAnswers: this.numberOfAnswers,
    peopleActive: this.peopleActive,
    numberOfUsers: this.numberOfUsers,
    lessonId: this.lessonId,
    chapterId: this.chapterId,
    lessonReference: this.type == "question" ? this.lessonReference : null,
    answered: this.answered,
    teacherAnswered: this.teacherAnswered,
  };
};

export default model("QuestionAnswer", questionAnswerSchema, "questionAnswers");
