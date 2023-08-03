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

// async function createRewiews() {
//   /*refactoring

//   using mongoose
//   generate 10 fake categories
//   save the fake categories into an array
//   for each category generate fake subcategories
//   save the fake subcategories into an array
//   randomly select a random subcategory from the subcategories array
//   find the parent category from the subcategories array
//   use this subcategory to generate fake courses
//   for each course generate 10 fake questions
//   for each question 3 answer generate fake answers
//  */
//   const mongoConnection = mongoose.connect(process.env.MONGO_URI);
//   mongoose.createConnection(process.env.MONGO_URI).asPromise();

//   mongoConnection.then(async () => {
//     await Review.deleteMany({});

//     const students = await User.find({ role: "student" });

//     const courses = await Course.find();

//     for (let course of courses) {
//       let teacher = await User.findById(
//         new mongoose.Types.ObjectId(course.userId)
//       );

//       for (let i = 0; i < randomNumber(5, 10); i++) {
//         let user;
//         let numberOfReviewForUser = 1;
//         do {
//           user = students[randomNumber(0, students.length - 1)];
//           numberOfReviewForUser = await Review.count({
//             "user.id": user._id,
//             course: course.id,
//           });
//         } while (numberOfReviewForUser > 0);

//         let reviewUser = {
//           id: user._id,
//           profilePicture: user.profilePicture,
//           name: user.name,
//           surname: user.surname,
//           numberOfReviews: randomNumber(1, 12),
//         };

//         let evaluation = randomNumber(1, 5);

//         let withAnswer = randomNumber(0, 1);

//         if (withAnswer == 0) {
//           console.log(
//             `Creating review for "${course.title}" from ${user.name} ${user.surname} with no answer`
//           );

//           let review = {
//             user: reviewUser,
//             title: course.title,
//             reviewText: `${course.title}  is a course of ${evaluation} starts`,
//             stars: evaluation,
//             userId: user._id,
//             course: course.id,
//             answered: false,
//           };

//           await Review.create(review);
//         } else {
//           console.log(
//             `Creating review for "${course.title}" from ${user.name} ${user.surname} `
//           );
//           let review = {
//             user: reviewUser,
//             title: course.title,
//             reviewText: `${course.title}  is a course of ${evaluation} starts`,
//             stars: evaluation,
//             userId: user._id,
//             course: course.id,
//             answered: true,

//             teacherAnswer: {
//               userId: teacher._id,
//               name: teacher.name,
//               text: "Thank you for your review!",
//               profilePicture: teacher.profilePicture,
//             },
//           };

//           await Review.create(review);
//         }
//       }
//     }

//     exit(0);
//   });
// }

// createRewiews();

async function createReviewText(openai, courseTitle, isNegative = false) {
  const prompt = isNegative
    ? `create negative review text of 3 lines for ${courseTitle} and  Return text in JSON like this {reviewText:"review text"}`
    : `create review text of 4 lines for ${courseTitle} and  Return text in JSON like this {reviewText:"review text"}`;

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-16k",
    messages: [{ role: "user", content: prompt }],
  });

  const reviewData = JSON.parse(response.data.choices[0].message.content);
  return reviewData.reviewText;
}

async function createTeacherAnswer(openai, reviewText) {
  const prompt = `create teacher answer text of 3 lines as a response to this text "${reviewText}" and  Return text in JSON like this {teacherReview:"review text"}`;

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-16k",
    messages: [{ role: "user", content: prompt }],
  });

  const teacherAnswerData = JSON.parse(
    response.data.choices[0].message.content
  );
  return teacherAnswerData.teacherReview;
}

async function createReviews() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // await Review.deleteMany({});

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const students = await User.find({ role: "student" });
    const courses = await Course.find();

    for (const course of courses) {
      const teacher = await User.findById(course.userId);

      const requiredReviews = 15;
      let reviewsAnsweredByTeacher = 0;

      for (let i = 0; i < requiredReviews; i++) {
        let user;
        do {
          user = students[Math.floor(Math.random() * students.length)];
        } while (
          (await Review.countDocuments({
            "user.id": user._id,
            course: course.id,
          })) > 0
        );

        const evaluation = Math.floor(Math.random() * 5) + 1;
        const withAnswer = reviewsAnsweredByTeacher < 10 && Math.random() < 0.5;

        const reviewUser = {
          id: user._id,
          profilePicture: user.profilePicture,
          name: user.name,
          surname: user.surname,
          numberOfReviews: Math.floor(Math.random() * 12) + 1,
        };

        const reviewText = await createReviewText(
          openai,
          course.title,
          i % 2 === 1
        );

        if (withAnswer) {
          reviewsAnsweredByTeacher++;
          const teacherReview = await createTeacherAnswer(openai, reviewText);

          console.log(
            `Creating review for "${course.title}" from ${user.name} ${user.surname} with teacher's answer`
          );
          const review = {
            user: reviewUser,
            title: course.title,
            reviewText: reviewText ? reviewText : "",
            stars: evaluation,
            userId: user._id,
            course: course.id,
            answered: true,
            teacherAnswer: {
              userId: teacher._id,
              name: teacher.name,
              text: teacherReview,
              profilePicture: teacher.profilePicture,
            },
          };
          await Review.create(review);
        } else {
          console.log(
            `Creating review for "${course.title}" from ${user.name} ${user.surname} with no answer`
          );

          const review = {
            user: reviewUser,
            title: course.title,
            reviewText: reviewText ? reviewText : "",
            stars: evaluation,
            userId: user._id,
            course: course.id,
            answered: false,
          };

          await Review.create(review);
        }
      }
    }

    console.log("Reviews creation completed.");
  } catch (error) {
    console.error("Error creating reviews:", error);
  }
}

const createAiReview = async (startingIndex, elementsInProcess) => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const courses = await Course.find({})
    .sort({ createdAt: 1 })
    .skip(startingIndex)
    .limit(elementsInProcess);
  let reviews = [];
  for (let course of courses) {
    let reviewObject = {};

    /* call to AI */

    console.log(`Creating in 15 reviews of course ${course.title} `);
    var chat_completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-16k",
      messages: [
        {
          role: "user",
          content: `create 15 distict reviews of 500 caracters  with distinct evaluation from 0 to 5 as integer number for a course titled ${course.title}  Return them in JSON like this {reviews:[{text : "review1" , evaluation: evaluation1 },{text : "review2" , evaluation: evaluation2 } , {text : "review3" , evaluation: evaluation3 }]}`,
        },
      ],
    });

    reviewObject = JSON.parse(chat_completion.data.choices[0].message.content);
    reviewObject.courseId = course.id;

    reviews.push(reviewObject);
  }
  let jsonReviews = JSON.stringify(reviews, null, 2);
  // Specify the file path where you want to write the JSON data
  const filePath = `reviews_${startingIndex}_${elementsInProcess}.json`;
  // Write the JSON data to the file
  fs.writeFileSync(filePath, jsonReviews);
};

const createReviewsAndSave = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  let numberOfCourses = await Course.count();

  for (let i = 0; i < 100; i + 20) {
    await createAiReview(i, 20);
  }
};

createReviewsAndSave();
