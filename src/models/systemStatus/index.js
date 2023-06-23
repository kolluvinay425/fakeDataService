import mongoose, { Mongoose } from "mongoose";
import  moment from'moment';

const systemStatusSchema = mongoose.Schema({
  userId: { type: String, required: true },
  phase: { type: String, required: true },
  objectId: { type: String, required: false },
});




systemStatusSchema.methods.toJSON = function () {
  return {
    id: this._id,
    userId: this.userId,
    phase: this.phase,
    objectId: this.objectId
  };
};

export default mongoose.model("SystemStatus", systemStatusSchema, "sistemStatus");