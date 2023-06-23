import Course from "./models/courses/index.js";
import Category from "./models/categories/index.js";
import Directory from "./models/folders/index.js";

import mongoose from "mongoose";

import { faker } from "@faker-js/faker";

import getImage from "./helpers/pixabay/index.js";

import * as dotenv from "dotenv";

dotenv.config();

console.log("I am here");

async function generateFakeCourses() {
  const users = [
    "648b02f240d3ccd568cdec1c",
    "6470705f82c13d532f2f1b47",
    "64747c1662e07cf9ce6a0020",
    "64759fe432a636e04fcc9325",
    "64784093a4405a36a9ff8a67",
    "648c368c2056174932623d0e",
  ];

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

  const categories = [
    "Web Development",
    "Data Science",
    "Digital Marketing",
    "Graphic Design",
    "Mobile App Development",
    "Project Management",
    "Photography",
    "Business Administration",
    "Language Learning",
    "Music Production",
  ];

  const subcategories = {
    "Web Development": ["Node.js", "CSS", "HTML"],
    "Data Science": ["Machine Learning", "Data Analysis", "Big Data"],
    "Digital Marketing": [
      "Search Engine Optimization (SEO)",
      "Social Media Marketing",
      "Content Marketing",
    ],
    "Graphic Design": ["Logo Design", "Illustration", "Typography"],
    "Mobile App Development": [
      "iOS Development",
      "Android Development",
      "Cross-Platform Development",
    ],
    "Project Management": ["Agile Methodology", "Scrum", "Project Planning"],
    Photography: [
      "Portrait Photography",
      "Landscape Photography",
      "Product Photography",
    ],
    "Business Administration": [
      "Marketing Strategy",
      "Finance and Accounting",
      "Operations Management",
    ],
    "Language Learning": ["English", "Spanish", "French"],
    "Music Production": [
      "Music Composition",
      "Audio Engineering",
      "Sound Design",
    ],
  };

  // Accessing subcategories for a specific category
  const webDevSubcategories = subcategories["Web Development"];
  console.log("Subcategories of Web Development:", webDevSubcategories);

  mongoose.createConnection(process.env.MONGO_URI).asPromise();
  mongoConnection.then(async () => {
    console.log("Connected to MongoDB");

    for (let category of categories) {
      console.log(category);
      let results = await getImage(category);
      let categoryImageURL = results["hits"][0]["webformatURL"];
      for (let subcategory of subcategories[category]) {
        let results = await getImage(subcategory);
        let subImageURL;
        if (results["totalHits"] > 0) {
          subImageURL = results["hits"][0]["webformatURL"];
        } else {
          subImageURL = categoryImageURL;
        }
      }
    }
  });

  /* try {
    for (let i = 0; i < 50; i++) {
      const course = new Course({
        title: faker.lorem.words(3),
        languages: [], // Add language IDs here if necessary
        price: faker.datatype.number({ min: 10, max: 100 }),
        currency: "USD",
        description: faker.lorem.paragraph(),
        thumbnail: generateRandomImageURL(),
        presentation: faker.lorem.paragraphs(2),
        objectives: [faker.lorem.sentence(), faker.lorem.sentence()],
        requirements: [faker.lorem.sentence(), faker.lorem.sentence()],
        chapters: [], // Add chapter IDs here if necessary
        categories: [], // Add category IDs here if necessary
        subcategories: [], // Add subcategory IDs here if necessary
        extendedDescription: faker.lorem.paragraphs(3),
        userId: "648b02f240d3ccd568cdec1c",
        status: "published",
        durationTime: `${faker.datatype.number({ min: 1, max: 10 })}h`,
        numberOfLikes: faker.datatype.number({ min: 0, max: 1000 }),
        numberOfVisits: faker.datatype.number({ min: 0, max: 10000 }),
        questionAndAnswers: {
          totalQuestions: faker.datatype.number({ min: 0, max: 100 }),
          teacherAnswers: faker.datatype.number({ min: 0, max: 100 }),
          totalQuestionSolved: faker.datatype.number({ min: 0, max: 100 }),
        },
      });

      const folder = await Directory.findOne({
        userId: course.userId,
      });
      const fakeDirectory = new Directory({
        name: course.title,
        type: "course",
        language: "en",
        userId: course.userId,
        course: course._id,
        folderFatherId: folder._id,
      });

      await course.save();
      await fakeDirectory.save();
    }

    console.log("Fake courses created successfully!");
  } catch (error) {
    console.error("Error creating fake courses:", error);
  }
}*/
}
function generateRandomImageURL() {
  return faker.image.imageUrl();
}

generateFakeCourses();

export { generateFakeCourses };
