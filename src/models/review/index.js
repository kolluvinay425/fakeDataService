import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  text: { type: String, required: true },
  profilePicture: { type: String, required: true },
});

const reviewSchema = new mongoose.Schema(
  {
    user: {
      id: { type: String, required: true },

      profilePicture: { type: String, required: true },

      name: { type: String, required: true },

      surname: { type: String },

      numberOfReviews: { type: Number, required: true, default: 0 },
    },

    title: { type: String, required: true },

    stars: { type: Number, required: true, min: 1, max: 5 },

    reviewText: { type: String, required: true },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    userId: {
      type: String,
      required: true,
    },
    answered: { type: Boolean, default: false },
    teacherAnswer: { type: teacherSchema, required: false },
  },
  { timestamps: true }
);
reviewSchema.methods.toJSON = function () {
  return {
    id: this._id,
    user: {
      id: this.user.id,
      profilePicture: this.user.profilePicture,
      name: this.user.name,
      numberOfReviews: this.user.numberOfReviews,
    },
    title: this.title,
    reviewText: this.reviewText,
    stars: this.stars,
    courseId: this.course,
    answered: this.answered,
    teacherAnswer: {
      userId: this.teacherAnswer.userId,
      name: this.teacherAnswer.name,
      text: this.teacherAnswer.text,
      profilePicture: this.teacherAnswer.profilePicture,
    },
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};
const Review = mongoose.model("Review", reviewSchema);

export default Review;
