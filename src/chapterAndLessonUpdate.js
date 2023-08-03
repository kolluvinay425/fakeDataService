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

    for (let course of courses) {
      let reviews = await Review.find({ course: course.id });

      let rating = 0;

      let buyers = [];

      for (let review of reviews) {
        buyers.push(review.user.profilePicture);
        rating += review.stars;
      }
      rating = parseFloat(rating / reviews.length).toFixed(1);

      console.log(buyers.slice(0, 5));

      course.ranking = rating != "NaN" ? rating : 0;
      course.licensesSold = reviews.length;
      course["customerPictures"] = buyers.slice(0, 5);
      try {
        course.save();
      } catch (err) {
        console.log("Upps error");
      }
      console.log(`Updating ${course.title}`);
    }
  });
}

createChaptersAndLessons();
