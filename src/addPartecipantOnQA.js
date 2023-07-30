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

async function correctQuestions() {
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
    console.log("Connected to MongoDB");

    const courses = await Course.find();
    let partecipants;
    for (let course of courses) {
      let questions = await questionAnswer.find({ course: course._id });
      for (let question of questions) {
        partecipants = [];
        partecipants.push(question.user.imageUrl);
        const answers = await questionAnswer.find({ father: question._id });

        for (let answer of answers) {
          if (!partecipants.includes(answer.user.imageUrl)) {
            partecipants.push(answer.user.imageUrl);
          }
          let answersOfAnswer = await questionAnswer.find({
            father: answer._id,
          });
          let partecipantsOfAnswer = [];
          for (let answerOfAnswer of answersOfAnswer) {
            if (!partecipants.includes(answerOfAnswer.user.imageUrl)) {
              partecipants.push(answerOfAnswer.user.imageUrl);
            }

            if (!partecipantsOfAnswer.includes(answerOfAnswer.user.imageUrl)) {
              partecipantsOfAnswer.push(answerOfAnswer.user.imageUrl);
            }
          }

          console.log(`updating answer ${answer.id}`);
          answer["peopleActive"] = partecipantsOfAnswer;
          await answer.save();
        }
        console.log(`Updating question ${question._id}`);
        question["peopleActive"] = partecipants;
        await question.save();
      }
    }
    exit(0);
  });
}

correctQuestions();
