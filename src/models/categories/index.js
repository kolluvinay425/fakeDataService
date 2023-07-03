import mongoose, { Mongoose } from "mongoose";

const categorySchema = mongoose.Schema({
  name: { type: String, required: true },
  language: {
    type: String,
    required: true,
    default: "en",
  },
  image: {
    type: String,
    required: true,
  },
  categoryFatherId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  proposedUserId: { type: String, required: false },
  status: {
    type: String,
    enum: ["active", "proposed"],
    default: "active",
    required: true,
  },
});

categorySchema.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    image: this.image,
    categoryFatherId: this.categoryFatherId,
    language: this.language,
  };
};

export default mongoose.model("Category", categorySchema, "categories");
