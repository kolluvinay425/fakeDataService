import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: {
    id: { type: String, required: true },

    profilePicture: { type: String, required: true },

    name: { type: String, required: true },

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

  answer: String,
});
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
    answer: this.answer,
    courseId: this.course,
  };
};
const Review = mongoose.model("Review", reviewSchema);

export default Review;
