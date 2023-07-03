import mongoose, { Mongoose } from "mongoose";

const courseSchema = mongoose.Schema(
  {
    title: String,
    languages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Language" }],
    price: Number,
    currency: String,
    description: String,
    thumbnail: String,
    trailer: String,
    frame: String,
    objectives: [{ type: String }],
    requirements: [{ type: String }],
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    extendedDescription: String,
    teacherName: { type: String },
    teacherPicture: { type: String },
    userId: { type: String },
    status: { type: String },
    durationTime: String,
    numberOfLikes: { type: Number, required: false, default: 0 },
    numberOfVisits: { type: Number, required: false, default: 0 },
    numberOfPurchases: { type: Number, required: false, default: 0 },
    totalEarnings: { type: Number, required: false, default: 0 },
    licensesSold: { type: Number, required: false, default: 0 },
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

courseSchema.methods.toJSON = function () {
  return {
    id: this._id,
    title: this.title.trim(),
    userId: this.userId,
    currency: this.currency,
    description: this.description,
    thumbnail: this.thumbnail,
    presentation: this.presentation,
    chapters: this.chapters,
    subcategories: this.subcategories,
    price: this.price,
    languages: this.languages,
    objectives: this.objectives,
    requirements: this.requirements,
    extendedDescription: this.extendedDescription,
    durationTime: this.durationTime,
    categories: this.categories,
    status: this.status,
    numberOfLikes: this.numberOfLikes,
    numberOfVisits: this.numberOfVisits,
    totalEarnings: this.totalEarnings,
    licensesSold: this.licensesSold,
  };
};

export default mongoose.model("Course", courseSchema, "courses");
