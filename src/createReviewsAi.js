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
import { createObjectivesAndRequirements } from "./addObjectiveAndRequirements.js";

dotenv.config();

const createAiReview = async (startingIndex, elementsInProcess) => {
  // await mongoose.connect(process.env.MONGO_URI);
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
    console.log(`Creating 15 reviews of course ${course.title}`);

    try {
      const chat_completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo-16k",
        messages: [
          {
            role: "user",
            content: `create 15 distinct reviews of 3 lines  with distinct evaluation from 0 to 5 as integer number for a course titled ${course.title}  Return them in JSON like this {reviews:[{text : "review1" , evaluation: evaluation1,teacherAnswer:"answer2" },{text : "review1" , evaluation: evaluation2,teacherAnswer:"answer2" } , {text : "review3" , evaluation: evaluation3,teacherAnswer:"answer3" }]}`,
          },
        ],
      });

      reviewObject = JSON.parse(
        chat_completion.data.choices[0].message.content
      );
      reviewObject.courseId = course.id;
      reviewObject.userId = course.userId;
      reviewObject.title = course.title;

      reviews.push(reviewObject);
    } catch (error) {
      console.error("Error creating reviews for course:", course.title);
    }
  }

  let existingData = [];
  if (fs.existsSync("course_reviews.json")) {
    const existingDataContent = fs.readFileSync("course_reviews.json", "utf8");
    existingData = JSON.parse(existingDataContent);
  }

  const jsonData = JSON.stringify([...existingData, ...reviews], null, 2);
  const filePath = `course_reviews.json`;
  fs.writeFileSync(filePath, jsonData, "utf8");
};

const createAiReviews = async (data) => {
  const students = await User.find({ role: "student" });
  console.log("deleting previous reviews");
  await Review.deleteMany({});
  for (let review of data) {
    const teacher = await User.findById(review.userId);

    const requiredReviews = review.reviews.length;
    let reviewsAnsweredByTeacher = 0;

    for (let i = 0; i < requiredReviews; i++) {
      let user = students[Math.floor(Math.random() * students.length)];

      const withAnswer = reviewsAnsweredByTeacher < 10 && Math.random() < 0.5;
      const reviewUser = {
        id: user._id,
        profilePicture: user.profilePicture
          ? user.profilePicture
          : "https://www.google.com/url?sa=i&url=https%3A%2F%2Fdepositphotos.com%2Fvector-images%2Fprofile-placeholder.html&psig=AOvVaw0djR2bjgXl9r278VHFkK8o&ust=1691140976515000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCLiq55qVwIADFQAAAAAdAAAAABAE",
        name: user.name ? user.name : "name",
        surname: user.surname ? user.surname : "surname",
        numberOfReviews: Math.floor(Math.random() * 12) + 1,
      };

      const reviewText = review.reviews[i].text; // Get the review text from the generated data

      console.log(
        `Creating review for "${review.title}" from ${user.name} ${user.surname} with teacher answer`
      );
      if (withAnswer) {
        const reviewObject = {
          user: reviewUser,
          title: review.title,
          reviewText: reviewText,
          stars: review.reviews[i].evaluation,
          userId: user._id,
          course: review.courseId,
          answered: true,
          teacherAnswer: {
            userId: teacher._id,
            name: teacher.name,
            text: review.reviews[i].teacherAnswer,
            profilePicture: teacher.profilePicture,
          },
        };
        await Review.create(reviewObject);
      } else {
        console.log(
          `Creating review for "${review.title}" from ${user.name} ${user.surname} with out teacher answer`
        );

        const reviewObject = {
          user: reviewUser,
          title: review.title,
          reviewText: reviewText,
          stars: review.reviews[i].evaluation,
          userId: user._id,
          course: review.courseId,
          answered: false,
        };
        await Review.create(reviewObject);
      }
    }
  }
};

const createReviewsAndSave = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  let numberOfCourses = 3;

  if (!fs.existsSync("course_reviews.json")) {
    for (let i = 0; i < numberOfCourses; i += 2) {
      await createAiReview(i, 2);
    }
  }

  let data = JSON.parse(fs.readFileSync("course_reviews.json"));
  await createAiReviews(data);
  console.log("created reviews successfully");
  await createObjectivesAndRequirements();
  console.log("created objectives and requirements successfully");
};

createReviewsAndSave();
