import Course from "./models/courses/index.js";
import Category from "./models/categories/index.js";
import Directory from "./models/folders/index.js";
import { saveObjectToGoogleBucket } from "./helpers/bucket/index.js";

import { Configuration, OpenAIApi } from "openai";

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
  mongoose.createConnection(process.env.MONGO_URI).asPromise();

  mongoConnection.then(async () => {
    console.log("Connected to MongoDB");

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    var chat_completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content:
            "example of json array of string with ten elements containing fake course categories",
        },
      ],
    });
    const categorieArray = JSON.parse(
      chat_completion.data.choices[0].message.content
    );
    console.log(categorieArray);

    for (let category of categorieArray) {
      let prompt =
        `The photo showcases for the comcepts of ${category}`.toLowerCase();

      console.log(prompt);

      let responseImage = await openai.createImage({
        prompt: prompt,
        size: "256x256",
        response_format: "b64_json",
      });

      let file = {
        originalname: `${category.replaceAll(" ", "_")}.png`,
        buffer: Buffer(responseImage.data.data[0].b64_json, "base64"),
      };

      let photo = await saveObjectToGoogleBucket(
        file,
        process.env.GOOGLE_CATEGORIES_BUCKET_NAME
      );

      console.log(photo);

      const newCategory = await Category.create({
        name: category,
        language: "en",
        photo: photo,
        status: "active",
      });

      let questionToChat = `example of json array of string with ten elements containing fake course subcategories from the main category ${category}`;
      console.log(questionToChat);
      chat_completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: questionToChat,
          },
        ],
      });

      let subCategorieArray = JSON.parse(
        chat_completion.data.choices[0].message.content
      );

      console.log(subCategorieArray);

      for (let subcategory of subCategorieArray) {
        let prompt =
          `The photo showcases for the comcepts of ${subcategory}`.toLowerCase();

        console.log(prompt);

        let responseImage = await openai.createImage({
          prompt: prompt,
          size: "256x256",
          response_format: "b64_json",
        });

        let file = {
          originalname: `${subcategory.replaceAll(" ", "_")}.png`,
          buffer: Buffer(responseImage.data.data[0].b64_json, "base64"),
        };

        let photo = await saveObjectToGoogleBucket(
          file,
          process.env.GOOGLE_CATEGORIES_BUCKET_NAME
        );

        console.log(photo);

        const newSubcategory = await Category.create({
          name: subcategory,
          language: "en",
          photo: photo,
          categoryFatherId: newCategory._id,
          status: "active",
        });

        let questionToChat = `create an course title for the subcategory ${subcategory}`;

        console.log(questionToChat);

        chat_completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: questionToChat,
            },
          ],
        });
        let title = chat_completion.data.choices[0].message.content.replaceAll(
          '"',
          ""
        );

        questionToChat = `return 2  the most significant keywords separated by coma ${chat_completion.data.choices[0].message.content} ignoring Master and Mastering`;

        let chat_keywords = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: questionToChat,
            },
          ],
        });

        let keywords = chat_keywords.data.choices[0].message.content.split(",");

        prompt =
          `The photo showcases for the comcepts of ${category} and ${subcategory} and ${keywords[0]}`.toLowerCase();

        console.log(prompt);

        responseImage = await openai.createImage({
          prompt: prompt,
          size: "256x256",
          response_format: "b64_json",
        });

        file = {
          originalname: `${title.replaceAll(" ", "_")}.png`,
          buffer: Buffer(responseImage.data.data[0].b64_json, "base64"),
        };

        photo = await saveObjectToGoogleBucket(
          file,
          process.env.GOOGLE_CATEGORIES_BUCKET_NAME
        );

        console.log(photo);

        questionToChat = `create an course description maximum 500 caracters for course with title  ${chat_completion.data.choices[0].message.content}`;
        console.log(questionToChat);
        chat_completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: questionToChat,
            },
          ],
        });
        let extendedDescription =
          chat_completion.data.choices[0].message.content;

        questionToChat = `create an course description maximum 67 caracters for course with title  ${chat_completion.data.choices[0].message.content}`;
        console.log(questionToChat);
        chat_completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: questionToChat,
            },
          ],
        });

        let description = chat_completion.data.choices[0].message.content;

        const courseSchema = await Course.create({
          title: title,
          price: 10.35,
          currency: "USD",
          description: description,
          thumbnail: photo,
          categories: newCategory._id,
          subcategories: newSubcategory._id,
          extendedDescription: extendedDescription,
          numberOfLikes: Math.floor(Math.random() * (20 - 2)) + 8,
          numberOfVisits: Math.floor(Math.random() * (200 - 10)) + 8,
          numberOfPurchases: Math.floor(Math.random() * (20 - 8)) + 8,
        });
      }
    }
  });
}

generateFakeCourses();

export { generateFakeCourses };
