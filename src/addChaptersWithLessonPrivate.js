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

async function createChaptersAndLessons() {
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
    const courses = await Course.find({});
    await Chapter.deleteMany({});
    await Lesson.deleteMany({});

    for (let course of courses) {
      let createdChapter = await Chapter.create({
        title: "Introduction",
        public: true,
      });

      for (let i = 0; i < 5; i++) {
        console.log(`creating lessons for counse ${course.title}`);
        let createdLesson = await Lesson.create({
          title: `Lesson number ${i}`,
          thumbnail: course.thumbnail,
          video: {
            url: "https://storage.googleapis.com/testing_uploads/generic_video.mp4",
            duration: randomNumber(10, 60),
            public: true,
          },
        });
        createdChapter.lessons.push(createdLesson.id);
        console.log(createdChapter.duration);
        console.log(createdChapter.duration + createdLesson.duraration);
        createdChapter.duration =
          createdChapter.duration + createdLesson.video.duration;
      }

      createdChapter.save();
      course.chapters.push(createdChapter.id);

      for (let j = 1; j < 11; j++) {
        let createdChapter = await Chapter.create({
          title: `Chapter ${j}`,
          public: true,
        });

        for (let i = 0; i < 10; i++) {
          console.log(`creating lessons for counse ${course.title}`);
          let createdLesson = await Lesson.create({
            title: `Lesson number ${i}`,
            public: false,
            thumbnail: course.thumbnail,
            video: {
              url: "https://storage.googleapis.com/testing_uploads/generic_video.mp4",
              duration: randomNumber(10, 60),
              public: false,
            },
          });
          createdChapter.lessons.push(createdLesson.id);
          createdChapter.duration =
            createdChapter.duration + createdLesson.video.duration;
        }

        createdChapter.save();

        course.chapters.push(createdChapter.id);
      }
      await course.save();
    }
  });
}

createChaptersAndLessons();
