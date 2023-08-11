import mongoose from "mongoose";

const { Schema, model } = mongoose;

const salesSchema = Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    profilePicture: { type: String, required: true },
    userId: { type: String, required: true },
    courseId: { type: String, required: true },
    paymentId: { type: String, required: true },
    teacherId: { type: String, required: true },
    price: { type: Number, required: true },
    isNew: { type: Boolean, required: false, default: false },
  },
  { timestamps: true }
);

salesSchema.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    surname: this.surname,
    userId: this.userId,
    profilePicture: this.profilePicture,
    courseId: this.courseId,
    paymentId: this.paymentId,
    price: this.price,
    createdAt: this.createdAt,
    isNew: this.isNew,
  };
};

export default model("Sales", salesSchema, "sales");
