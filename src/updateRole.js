import Role from "./models/roles/index.js";

import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

async function updateRole() {
  const mongoConnection = mongoose.connect(process.env.MONGO_URI);
  mongoose.createConnection(process.env.MONGO_URI).asPromise();

  mongoConnection.then(async () => {
    console.log("Connected to MongoDB");

    const newAuthorizationStrings = [
      "post:industryTypes:own",
      "put:industryTypes:own",
      "get:industryTypes:own",
      "delete:industryTypes:own",
      "post:numberOfEmployees:own",
      "put:numberOfEmployees:own",
      "get:numberOfEmployees:own",
      "delete:numberOfEmployees:own",
      "post:states:own",
      "put:states:own",
      "get:states:own",
      "delete:states:own",
      "post:spokenLanguages:own",
      "put:spokenLanguages:own",
      "get:spokenLanguages:own",
      "delete:spokenLanguages:own",
    ]; // An array of strings to add

    // Update the document's authorization array using Mongoose
    const updatedDocument = await Role.findOneAndUpdate(
      { _id: "653623ea49ee39f56321b92c" },
      { $push: { authorizations: { $each: newAuthorizationStrings } } },
      { new: true } // Return the updated document
    );

    if (updatedDocument) {
      console.log({
        message: "Authorization updated successfully",
        updatedDocument,
      });
    } else {
      console.log({ message: "Document not found" });
    }
  });
}

updateRole();
