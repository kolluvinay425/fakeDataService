import Course from "./models/courses/index.js";
import Category from "./models/categories/index.js";
import { saveObjectToGoogleBucket } from "./helpers/bucket/index.js";
import { Configuration, OpenAIApi } from "openai";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { getImage, getVideo, getResorce } from "./helpers/pixam/index.js";

dotenv.config();

console.log("I am here");

const sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const randomNumber = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
};

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

    await mongoose.connection.dropDatabase();

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
            "JSON array of string with ten elements containing course categories in format []",
        },
      ],
    });

    const categoriesObject = JSON.parse(
      chat_completion.data.choices[0].message.content
    );
    console.log(categoriesObject);

    for (let category of categoriesObject) {
      try {
        const categoriesImageSearch = await getImage(category);
        console.log(JSON.stringify(categoriesImageSearch, null, 2));

        let imageCategory =
          "https://storage.googleapis.com/testing_uploads/app-6702045_1280.png";

        if (categoriesImageSearch.totalHits > 0) {
          let imageBuffer = await getResorce(
            categoriesImageSearch.hits[0].webformatURL
          );
          let fileName = categoriesImageSearch.hits[0].webformatURL.substring(
            categoriesImageSearch.hits[0].webformatURL.lastIndexOf("/") + 1
          );
          let file = {
            originalname: fileName,
            buffer: imageBuffer,
          };

          imageCategory = await saveObjectToGoogleBucket(
            file,
            process.env.GOOGLE_CATEGORIES_BUCKET_NAME
          );
        }

        const newCategory = await Category.create({
          name: category,
          language: "en",
          image: imageCategory,
          status: "active",
        });

        let questionToChat = `JSON array of string with five elements containing fake course subcategories from the main category ${category} in format []`;
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

        let subCategoriesObject = JSON.parse(
          chat_completion.data.choices[0].message.content
        );

        console.log(subCategoriesObject);

        let videoCourse =
          "https://s3.eu-west-1.amazonaws.com/eu-west-1.vimeo.com/videos/660/147/660147298.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAZRUUNWVAWWO32QM7%2F20230702%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Date=20230702T234415Z&X-Amz-Expires=172800&X-Amz-SignedHeaders=host&X-Amz-Signature=6a67109c04ec93984bd692a49139f1f591510ab86dedce2040ac7e2ff42dd716";

        for (let subcategory of subCategoriesObject) {
          var titles = [];
          const subCategoriesImageSearch = await getImage(subcategory);
          console.log(JSON.stringify(subCategoriesImageSearch, null, 2));

          const subCategoriesVideoSearch = await getVideo(subcategory);
          console.log(JSON.stringify(subCategoriesVideoSearch, null, 2));

          /* if (subCategoriesVideoSearch.totalHits > 0) {
            let maxRandom =
              subCategoriesVideoSearch.totalHits > 10
                ? 9
                : subCategoriesVideoSearch.totalHits - 1;

            let randomIndex = randomNumber(0, maxRandom);
            console.log("Radom INDEX >>>>>>", randomIndex);
            let videoBuffer = await getResorce(
              subCategoriesVideoSearch.hits[randomIndex].videos.small.url
            );
            let fileName = subCategoriesVideoSearch.hits[
              randomIndex
            ].videos.small
              .urlsubstring(
                subCategoriesVideoSearch.hits[
                  randomIndex
                ].videos.small.url.lastIndexOf("/") + 1
              )
              .split("?")[0];
            console.log(fileName);

            let file = {
              originalname: fileName,
              buffer: videoBuffer,
            };

             = await saveObjectToGoogleBucket(
              file,
              process.env.GOOGLE_CATEGORIES_BUCKET_NAME
            );
          }*/

          console.log(JSON.stringify(subCategoriesVideoSearch, null, 2));

          let trailer = subCategoriesVideoSearch.hits[0].videos.small.url
            ? subCategoriesVideoSearch.hits[0].videos.small.url
            : "https://s3.eu-west-1.amazonaws.com/eu-west-1.vimeo.com/videos/660/147/660147298.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAZRUUNWVAWWO32QM7%2F20230702%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Date=20230702T234415Z&X-Amz-Expires=172800&X-Amz-SignedHeaders=host&X-Amz-Signature=6a67109c04ec93984bd692a49139f1f591510ab86dedce2040ac7e2ff42dd716";

          let imageSubCategory =
            "https://storage.googleapis.com/testing_uploads/app-6702045_1280.png";

          if (subCategoriesImageSearch.totalHits > 0) {
            let maxRandom =
              subCategoriesImageSearch.totalHits > 10
                ? 9
                : subCategoriesImageSearch.totalHits - 1;

            let randomIndex = randomNumber(0, maxRandom);
            console.log("Random INDEX >>>>>>", randomIndex);
            let imageBuffer = await getResorce(
              subCategoriesImageSearch.hits[randomIndex].webformatURL
            );
            let fileName = subCategoriesImageSearch.hits[
              randomIndex
            ].webformatURL.substring(
              subCategoriesImageSearch.hits[
                randomIndex
              ].webformatURL.lastIndexOf("/") + 1
            );
            let file = {
              originalname: fileName,
              buffer: imageBuffer,
            };

            imageSubCategory = await saveObjectToGoogleBucket(
              file,
              process.env.GOOGLE_CATEGORIES_BUCKET_NAME
            );
          }

          const newSubcategory = await Category.create({
            name: subcategory,
            language: "en",
            image: imageSubCategory,
            categoryFatherId: newCategory._id,
            status: "active",
          });

          for (let i = 0; i < 3; i++) {
            let questionToChat = `create an course title maximum 50 caracters for the subcategory ${subcategory} different not in  ${titles}`;

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

            let title =
              chat_completion.data.choices[0].message.content.replaceAll(
                '"',
                ""
              );
            console.log(title);

            titles.push(title);

            await sleep(5000);

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

            await sleep(5000);

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

            const titleImageSearch = await getImage(`${subcategory}+teaching`);

            console.log(JSON.stringify(titleImageSearch, null, 2));

            let imageCourse =
              "https://storage.googleapis.com/testing_uploads/app-6702045_1280.png";

            if (titleImageSearch.totalHits > 0) {
              let maxRandom =
                titleImageSearch.totalHits > 10
                  ? 9
                  : titleImageSearch.totalHits - 1;

              let randomIndex = randomNumber(0, maxRandom);

              let imageBuffer = await getResorce(
                categoriesImageSearch.hits[randomIndex].webformatURL
              );
              let fileName = titleImageSearch.hits[0].webformatURL.substring(
                titleImageSearch.hits[randomIndex].webformatURL.lastIndexOf(
                  "/"
                ) + 1
              );
              let file = {
                originalname: fileName,
                buffer: imageBuffer,
              };

              imageCourse = await saveObjectToGoogleBucket(
                file,
                process.env.GOOGLE_CATEGORIES_BUCKET_NAME
              );
            }

            const courseSchema = await Course.create({
              title: title,
              price: 10.35,
              currency: "USD",
              description: description,
              thumbnail: imageCourse,
              categories: newCategory._id,
              subcategories: newSubcategory._id,
              extendedDescription: extendedDescription,
              trailer: trailer,
              numberOfLikes: Math.floor(Math.random() * (20 - 2)) + 8,
              numberOfVisits: Math.floor(Math.random() * (200 - 10)) + 10,
              numberOfPurchases: Math.floor(Math.random() * (20 - 8)) + 8,
            });
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  });
}

generateFakeCourses();

export { generateFakeCourses };
