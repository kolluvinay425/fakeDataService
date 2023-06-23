import mongoose, { Mongoose } from "mongoose";
import  moment from'moment';

const timerSchema = mongoose.Schema({
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: false },
  userId: { type: String, required: true },
  active: { type: Boolean, required: true },
});




timerSchema.methods.toJSON = function () {
  return {
    id: this._id,
    startTime: this.startTime,
    endTime: this.endTime,
    currentTime: moment.utc(),
    active: this.active
  };
};

export default mongoose.model("Timer", timerSchema, "timers");