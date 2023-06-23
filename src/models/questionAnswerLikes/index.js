import mongoose from "mongoose";

const { Schema, model } = mongoose;

const questionAnswerLikes = Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  profilePicture: { type: String, required: true },
  userId: { type: String, required: true },
  question: {
    type: Schema.Types.ObjectId,
    ref: "QuestionAnswer",
    default: null,
  },
  answer: { type: Schema.Types.ObjectId, ref: "QuestionAnswer", default: null },
});

questionAnswerLikes.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    surname: this.surname,
    userId: this.userId,
    profilePicture: this.profilePicture,
    course: this.course,
  };
};

export default model(
  "QuestionAnswerLikes",
  questionAnswerLikes,
  "QuestionAnswerLikes"
);
