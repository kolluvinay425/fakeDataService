import mongoose from "mongoose";

const { Schema, model } = mongoose;


const salesSchema = Schema(
  {
    teacherId: { type: String, required: true },
    studentId: { type: String, required: true },
    courseId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    saleDate: { type: Date, required: true },
    price: { type: Number, required: true, default: 0 },
    studentsPicture: { type: String, required: true },

  }
);

salesSchema.methods.toJSON = function () {
  return {
    id: this._id,
    teacherId: this.teacherId,
    studentId: this.studentId,
    courseId: this.courseId,
    saleDate: this.saleDate,
    price: this.price,
    studentsPicture: this.studentsPicture,
  };
};

export default model("Sales", salesSchema, "sales");
