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
    let answers = await QuestionAnswer.updateMany(
      { type: "answer" },
      { $unset: { title: "" } }
    );
    let questions = await QuestionAnswer.find({ type: "question" });
    console.log(questions[0]);
    let counterQuestion = 0;
    for (const question of questions) {
      const course = await Course.findById(question.course);
      if (course.chapters.length > 0) {
        const chapter = await Chapter.findById(course.chapters[0]);
        if (chapter.lessons.length > 0) {
          const lesson = await Lesson.findById(
            chapter.lessons[randomNumber(0, chapter.lessons.length - 1)]
          );

          question.lessonReference = `${chapter.title} Lesson: ${lesson.title}`;
          question.numberOfUsers = question.numberOfAnswers;
          question.chaperId = course.chapters[0];
          question.lessonId = lesson._id;

          let numberOfTeacherAnswers = await QuestionAnswer.count({
            type: "answer",
            father: question._id,
            "user.id": course.userId,
          });

          question["teacherAnswered"] =
            numberOfTeacherAnswers > 0 ? true : false;

          let numberOfAnswers = await QuestionAnswer.count({
            type: "answer",
            father: question._id,
          });

          console.log(numberOfAnswers);

          question["answered"] = numberOfAnswers > 0 ? true : false;
          question.save();
          console.log(
            `questions remaning: ${questions.length - counterQuestion}`
          );
          counterQuestion = counterQuestion + 1;
        }
      }
    }
    exit(0);
  });
}

correctQuestions();
