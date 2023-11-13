import mongoose from "mongoose";

import date from "../../helpers/date/index.js";

const { Schema } = mongoose;

//Embedded object for the organization schema
const personAddressSchema = new Schema(
  {
    address: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "States",
      required: true,
    },
  },
  { _id: false }
);

const ownerDetailSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    professionalTitle: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    personAddress: { type: personAddressSchema },
  },
  { _id: false }
);

const legalAddressSchema = new Schema(
  {
    address: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "States",
      required: true,
    },
  },
  { _id: false }
);

const businessDetailSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    registrationNumber: {
      type: String,
      required: true,
    },
    vatNumber: {
      type: String,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    websiteUrl: {
      type: String,
      required: true,
    },

    legalAddress: { type: legalAddressSchema },
  },
  { _id: false }
);

const positionSchema = new Schema(
  {
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false }
);

const organizationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    industryType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IndustryTypes",
    },
    spokenLanguage: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SpokenLanguages",
      },
    ],
    numberOfEmployees: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NumberOfEmployees",
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "States",
    },
    profileLogo: { type: String },
    profilePicture: { type: String },
    websiteUrl: { type: String, default: "" },
    contactEmail: { type: String, default: "" },

    address: { type: String, default: "" },
    description: { type: String, default: "" },
    ownerDetails: {
      type: ownerDetailSchema,
    },
    businessDetails: { type: businessDetailSchema },
    position: { type: positionSchema },
    status: {
      type: String,
      enum: ["draft", "active", "suspended"],
      default: "draft",
    },
    statusChangeDate: {
      type: Date,
      default: date.toLocalString(date.currentDate()),
    },
  },
  { timestamps: true, collection: "Organizations" }
);

organizationSchema.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    industryType: this.industryType,
    spokenLanguage: this.spokenLanguage,
    numberOfEmployees: this.numberOfEmployees,
    profileLogo: this.profileLogo,
    profilePicture: this.profilePicture,
    websiteUrl: this.websiteUrl,
    contactEmail: this.contactEmail,
    state: this.state,
    address: this.address,
    description: this.description,
    ownerDetails: {
      name: this.ownerDetails?.name || "",
      surname: this.ownerDetails?.surname || "",
      professionalTitle: this.ownerDetails?.professionalTitle || "",
      email: this.ownerDetails?.email || "",
      dateOfBirth:
        (this.ownerDetails?.dateOfBirth &&
          date.toLocalString(this.ownerDetails?.dateOfBirth)) ||
        "",
      phoneNumber: this.ownerDetails?.phoneNumber || "",
      personAddress: {
        address: this.ownerDetails?.personAddress?.address || "",
        city: this.ownerDetails?.personAddress?.city || "",
        zip: this.ownerDetails?.personAddress?.zip || "",
        state: this.ownerDetails?.personAddress?.state || "",
      },
    },
    businessDetails: {
      name: this.businessDetails?.name || "",
      registrationNumber: this.businessDetails?.registrationNumber || "",
      vatNumber: this.businessDetails?.vatNumber || "",
      phoneNumber: this.businessDetails?.phoneNumber || "",
      websiteUrl: this.businessDetails?.websiteUrl || "",
      legalAddress: {
        address: this.businessDetails?.legalAddress?.address || "",
        city: this.businessDetails?.legalAddress?.city || "",
        zip: this.businessDetails?.legalAddress?.zip || "",
        state: this.businessDetails?.legalAddress?.state || "",
      },
    },
    position: {
      lat: this.position?.lat,
      lng: this.position?.lng,
    },
    status: this.status,
    statusChangeDate: this.statusChangeDate,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Organization = mongoose.model("Organizations", organizationSchema);

export default Organization;
