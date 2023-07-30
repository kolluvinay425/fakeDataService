import Course from "./models/courses/index.js";
import Category from "./models/categories/index.js";
import Directory from "./models/folders/index.js";
import QuestionAnswer from "./models/questionAnswer/index.js";
import User from "./models/users/index.js";
import Chapter from "./models/chapters/index.js";
import Lesson from "./models/lessons/index.js";
import Review from "./models/review/index.js";
import { saveObjectToGoogleBucket } from "./helpers/bucket/index.js";
import { Configuration, OpenAIApi } from "openai";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { getImage, getVideo, getResorce } from "./helpers/pixam/index.js";
import { videoToSpriteSheet } from "./helpers/transcoding/index.js";
import url from "url";

import fs from "fs";
import { strictEqual } from "assert";

dotenv.config();

var numberOfCourses = 0;
const sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const randomNumber = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
};

async function updateImageInCoursesAndQA() {
  const mongoConnection = mongoose.connect(process.env.MONGO_URI);
  mongoose.createConnection(process.env.MONGO_URI).asPromise();

  mongoConnection.then(async () => {
    console.log("Connected to MongoDB");

    let users = await User.find({ role: "teacher" });

    for (const user of users) {
      console.log(
        `Updating picture in course for ${user.name} ${user.surname} ${user._id} ${user.profilePicture}`
      );

      let numberOfCoursesForTeacher = await Course.count({ userId: user._id });

      console.log(`number of courses ${numberOfCoursesForTeacher}`);

      await Course.updateMany(
        { userId: user._id },
        { teacherPicture: user.profilePicture }
      );
    }

    users = await User.find();

    for (const user of users) {
      console.log(
        `Updating picture in Q/A for ${user.name} ${user.surname} ${user._id} ${user.profilePicture}`
      );

      console.log(
        `number of questions with answeredTo : ${await QuestionAnswer.count({
          "answeredTo.id": user._id,
        })}`
      );

      await QuestionAnswer.updateMany(
        { "answeredTo.id": user._id },
        { "answeredTo.imageUrl": user.profilePicture }
      );

      console.log(
        `number of questions with user : ${await QuestionAnswer.count({
          "user.id": user._id,
        })}`
      );

      await QuestionAnswer.updateMany(
        { "user.id": user._id },
        { "user.imageUrl": user.profilePicture }
      );

      console.log(
        `number of revies with user : ${await Review.count({
          "user.id": user._id,
        })}`
      );

      await Review.updateMany(
        { "user.id": user._id },
        { "user.profilePicture": user.profilePicture }
      );
    }
    exit(0);
  });
}

updateImageInCoursesAndQA();
