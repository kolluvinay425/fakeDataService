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

// MongoDB connection setup
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function createObjectiveAndRequirements(
  startingIndex,
  elementsInProcess
) {
  try {
    const courses = await Course.find({})
      .sort({ createdAt: 1 })
      .skip(startingIndex)
      .limit(elementsInProcess);

    var rAndO = [];

    for (let course of courses) {
      let data = {};

      try {
        var chat_completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo-16k",
          messages: [
            {
              role: "user",
              content: `create 5 requirements of a course titled ${course.title} Return them in JSON like this { "requirements": ["requirement1", "requirement2", "requirement3", "requirement4", "requirement5"] }`,
            },
          ],
        });
        const requirements = JSON.parse(
          chat_completion.data.choices[0].message.content
        );

        data.courseId = course.id;
        data.requirements = requirements.requirements;
      } catch (error) {
        console.error(
          `Error creating requirements for course ${course.title}:`,
          error
        );
        continue;
      }

      try {
        var chat_completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo-16k",
          messages: [
            {
              role: "user",
              content: `create 5 objectives of a course titled ${course.title} Return them in JSON like this { "objectives": ["objective1", "objective2", "objective3", "objective4", "objective5"] }`,
            },
          ],
        });
        const objectives = JSON.parse(
          chat_completion.data.choices[0].message.content
        );

        data.objectives = objectives.objectives;

        rAndO.push(data);
      } catch (error) {
        console.error(
          `Error creating objectives for course ${course.title}:`,
          error
        );
        continue;
      }
    }

    let existingData = [];
    if (fs.existsSync("requirements_and_objectives.json")) {
      const existingDataContent = fs.readFileSync(
        "requirements_and_objectives.json",
        "utf8"
      );
      existingData = JSON.parse(existingDataContent);
    }

    const jsonData = JSON.stringify([...existingData, ...rAndO], null, 2);

    fs.writeFileSync("requirements_and_objectives.json", jsonData, "utf8");

    console.log("Data saved to requirements_and_objectives.json");
  } catch (error) {
    console.error("Error processing courses:", error);
  }
}

const generateCoursesWithRequirementsAndObjectives = async (courseData) => {
  for (let data of courseData) {
    try {
      const updatedCourse = await Course.findByIdAndUpdate(data.courseId, {
        requirements: data.requirements,
        objectives: data.objectives,
      });

      if (!updatedCourse) {
        console.log(`Course with ID ${data.courseId} not found.`);
      } else {
        console.log(`Course with ID ${data.courseId} updated successfully.`);
      }
    } catch (error) {
      console.error(
        `Error updating course with ID ${data.courseId}:`,
        error.message
      );
    }
  }
};

export const createObjectivesAndRequirements = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    let numberOfCourses = await Course.count();

    if (!fs.existsSync("requirements_and_objectives.json")) {
      for (let i = 0; i < numberOfCourses; i += 150) {
        await createObjectiveAndRequirements(i, 150);
      }
    }

    let data = JSON.parse(fs.readFileSync("requirements_and_objectives.json"));
    await generateCoursesWithRequirementsAndObjectives(data);
  } catch (error) {
    console.error("Error while creating data and saving:", error);
  } finally {
    mongoose.connection.close();
  }
};

// createObjectivesAndRequirements();
