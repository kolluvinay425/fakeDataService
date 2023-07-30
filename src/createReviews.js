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

async function createRewiews() {
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
    await Review.deleteMany({});

    const students = await User.find({ role: "student" });

    const courses = await Course.find();

    for (let course of courses) {
      let teacher = await User.findById(
        new mongoose.Types.ObjectId(course.userId)
      );

      for (let i = 0; i < randomNumber(5, 10); i++) {
        let user;
        let numberOfReviewForUser = 1;
        do {
          user = students[randomNumber(0, students.length - 1)];
          numberOfReviewForUser = await Review.count({
            "user.id": user._id,
            course: course.id,
          });
        } while (numberOfReviewForUser > 0);

        let reviewUser = {
          id: user._id,
          profilePicture: user.profilePicture,
          name: user.name,
          surname: user.surname,
          numberOfReviews: randomNumber(1, 12),
        };

        let evaluation = randomNumber(1, 5);

        let withAnswer = randomNumber(0, 1);

        if (withAnswer == 0) {
          console.log(
            `Creating review for "${course.title}" from ${user.name} ${user.surname} with no answer`
          );

          let review = {
            user: reviewUser,
            title: course.title,
            reviewText: `${course.title}  is a course of ${evaluation} starts`,
            stars: evaluation,
            userId: user._id,
            course: course.id,
            answered: false,
          };

          await Review.create(review);
        } else {
          console.log(
            `Creating review for "${course.title}" from ${user.name} ${user.surname} `
          );
          let review = {
            user: reviewUser,
            title: course.title,
            reviewText: `${course.title}  is a course of ${evaluation} starts`,
            stars: evaluation,
            userId: user._id,
            course: course.id,
            answered: true,

            teacherAnswer: {
              userId: teacher._id,
              name: teacher.name,
              text: "Thank you for your review!",
              profilePicture: teacher.profilePicture,
            },
          };

          await Review.create(review);
        }
      }
    }

    exit(0);
  });
}

createRewiews();
