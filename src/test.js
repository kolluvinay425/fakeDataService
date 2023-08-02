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

    await Review.deleteMany({});

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
            reviewText: reviewText,
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
            reviewText: reviewText,
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

createReviews();

// async function createReviews() {
//   const mongoConnection = mongoose.connect(process.env.MONGO_URI);

//   mongoConnection.then(async () => {
//     await Review.deleteMany({});

//     const students = await User.find({ role: "student" });

//     const courses = await Course.find();

//     for (let course of courses) {
//       let teacher = await User.findById(course.userId);

//       let requiredReviews = 15;
//       let reviewsAnsweredByTeacher = 0;

//       while (requiredReviews > 0) {
//         let user;
//         do {
//           user = students[randomNumber(0, students.length - 1)];
//         } while (
//           (await Review.count({ "user.id": user._id, course: course.id })) > 0
//         );

//         let evaluation = randomNumber(1, 5);
//         let withAnswer = reviewsAnsweredByTeacher < 10 && randomNumber(0, 1);

//         let reviewUser = {
//           id: user._id,
//           profilePicture: user.profilePicture,
//           name: user.name,
//           surname: user.surname,
//           numberOfReviews: randomNumber(1, 12),
//         };

//         let reviewText = `${course.title} is a course with ${evaluation} stars. `;
//         if (randomNumber(0, 1) === 0) {
//           reviewText += `I thoroughly enjoyed the course content and found it extremely helpful in my learning journey. The instructor's teaching style was engaging, and the course materials were well-organized. I particularly appreciated the hands-on projects and exercises that allowed me to apply what I learned. I highly recommend this course to anyone interested in the subject!
//     The course surpassed my expectations! The instructor's expertise and passion for the subject were evident in every lesson. The course content was comprehensive, and the assignments challenged me to think critically. I'm grateful for the knowledge gained.
//     The course was excellent for beginners like me. The step-by-step explanations and examples helped me grasp the concepts easily. I'm excited to apply what I learned to real-world projects. Highly recommended!`;
//         } else {
//           reviewText +=
//             "I thoroughly enjoyed the course content and found it extremely helpful in my learning journey. The instructor's teaching style was engaging, and the course materials were well-organized. I particularly appreciated the hands-on projects and exercises that allowed me to apply what I learned. I highly recommend this course to anyone interested in the subject!";
//         }

//         if (withAnswer) {
//           reviewsAnsweredByTeacher++;

//           console.log(
//             `Creating review for "${course.title}" from ${user.name} ${user.surname} with teacher's answer`
//           );

//           let review = {
//             user: reviewUser,
//             title: course.title,
//             reviewText: reviewText,
//             stars: evaluation,
//             userId: user._id,
//             course: course.id,
//             answered: true,
//             teacherAnswer: {
//               userId: teacher._id,
//               name: teacher.name,
//               text: "Thank you for your review! We are glad you enjoyed the course.,Your feedback is invaluable to us! We strive to provide the best learning experience.We appreciate your honest review and are committed to improving the course further.",
//               profilePicture: teacher.profilePicture,
//             },
//           };

//           await Review.create(review);
//         } else {
//           console.log(
//             `Creating review for "${course.title}" from ${user.name} ${user.surname} with no answer`
//           );

//           let review = {
//             user: reviewUser,
//             title: course.title,
//             reviewText: reviewText,
//             stars: evaluation,
//             userId: user._id,
//             course: course.id,
//             answered: false,
//           };

//           await Review.create(review);
//         }

//         requiredReviews--;
//       }
//     }

//     exit(0);
//   });
// }

// createReviews();
