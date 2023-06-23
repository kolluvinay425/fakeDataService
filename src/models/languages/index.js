import mongoose, { Mongoose } from "mongoose";


const languageSchema = mongoose.Schema({
  value : String,
  languageKey:String,

});

languageSchema.methods.toJSON = function () {
  return {
    id: this._id,
    value: this.value,
    languageKey: this.languageKey,
  };
};

export default mongoose.model("Language", languageSchema, "languages");