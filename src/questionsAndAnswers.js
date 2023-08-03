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
import questionAnswer from "./models/questionAnswer/index.js";

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

async function questionAndAnswers() {
  /*refactoring
  
  using mongoose
  generate 10 fake categories
  save the fake categories into an array
  for each category generate fake subcategories
  save the fake subcategories into an array
  randomly select a random subcategory from the subcategories array
  find the parent category from the subcategories array
  use this subcategory to generate fake courses
  for each course generate 10 fake questions
  for each question 3 answer generate fake answers
 */
  const mongoConnection = mongoose.connect(process.env.MONGO_URI);
  mongoose.createConnection(process.env.MONGO_URI).asPromise();

  mongoConnection.then(async () => {
    console.log(`Connection established`);
    const questions = await QuestionAnswer.find({ type: "question" });

    /* for (let question of questions) {
      console.log(`Updating the answer for ${question._id}`);
      await QuestionAnswer.updateMany(
        { father: question._id },
        { $set: { questionId: question._id } }
      );
    }*/
    const answers = await QuestionAnswer.find({
      type: "answer",
      questionId: { $exists: true },
    });

    for (let answer of answers) {
      console.log(`Updating the answer for answer ${answer._id}`);
      await QuestionAnswer.updateMany(
        { father: answer._id },
        { $set: { questionId: answer.questionId } }
      );
    }
  });
}

questionAndAnswers();
