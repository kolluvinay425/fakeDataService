import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: "",
  },

  role: {
    type: String,
    default: "student",
  },

  name: {
    type: String,
    default: "",
  },
  surname: {
    type: String,
    default: "",
  },
  username: {
    type: String,
    default: "",
  },
  dateOfBirth: {
    type: Date,
    default: Date.now(),
  },

  code: {
    type: String,
  },
  status: {
    type: String,
    default: "pending",
  },
  blocked: {
    type: Boolean,
  },
  blockedUntil: {
    type: Date,
  },
  phone: {
    type: String,
  },
});

userSchema.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    surname: this.surname,
    email: this.email,
    phone: this.phone,
    role: this.role,
    dateOfBirth: new Date(this.dateOfBirth).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
    profilePicture: this.profilePicture,
    username: this.username,
    status: this.status,
  };
};

const User = mongoose.model("users", userSchema);

export default User;
