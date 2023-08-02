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

// async function updateCourseWIthRequirements() {
//   const mongoConnection = mongoose.connect(process.env.MONGO_URI);
//   mongoose.createConnection(process.env.MONGO_URI).asPromise();

//   mongoConnection.then(async () => {
//     console.log("Connected to MongoDB");
//     const courses = await Course.find({});
//     for (const course of courses) {
//       //   const requirements = getRealUniqueRequirements(course);
//       const requirements = [
//         `A basic understanding of ${course.title} concepts is recommended.`,
//         `Familiarity with ${course.title} terminology will be helpful.`,
//         `An interest in ${course.title} and related fields is encouraged.`,
//       ];
//       await course.updateOne(
//         { _id: course._id }, // Filter by course's _id
//         { $set: { requirements } } // Update the requirements field
//       );
//     }
//   });
// }
const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

async function updateCourseWithRequirements() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const courses = await Course.find({});
    console.log(courses[0]);

    for (let course of courses) {
      if (course.requirements.length === 0) {
        const chat_completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo-16k",
          messages: [
            {
              role: "user",
              content: `create 3 requirements of a course titled ${course.title}. Return them in JSON like this {requirements:["requirement1","requirement2","requirement3","requirement4","requirement5"]}`,
            },
          ],
        });
        const messageContent =
          chat_completion.data.choices[0]?.message?.content;

        if (messageContent) {
          try {
            const requirements = JSON.parse(messageContent);
            await Course.updateOne(
              { _id: course._id },
              { $set: { requirements: requirements.requirements } }
            );
            console.log(`${requirements.requirements} saved in ${course._id}`);
          } catch (jsonParseError) {
            console.error("JSON Parse Error:", jsonParseError);
            continue;
          }
        } else {
          console.error("Empty or invalid JSON response from OpenAI.");
          continue;
        }
      }
    }

    await mongoose.disconnect();
    console.log("Updated all courses with requirements.");
  } catch (error) {
    console.error("Error updating requirements:", error);
  }
}
updateCourseWithRequirements();
