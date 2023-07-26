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

const printTime = () => {
  let date_ob = new Date();

  // current date
  // adjust 0 before single digit date
  let date = ("0" + date_ob.getDate()).slice(-2);

  // current month
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

  // current year
  let year = date_ob.getFullYear();

  // current hours
  let hours = date_ob.getHours();

  // current minutes
  let minutes = date_ob.getMinutes();

  // current seconds
  let seconds = date_ob.getSeconds();

  // prints date & time in YYYY-MM-DD HH:MM:SS format
  let time =
    year +
    "-" +
    month +
    "-" +
    date +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds;
  return time;
};

const generateFakeData = async () => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  var chat_completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-16k",
    messages: [
      {
        role: "user",
        content: `create 30 categories of courses Return them in JSON like this {categories:["category1","category2","category3"]`,
      },
    ],
  });

  const categoriesObject = JSON.parse(
    chat_completion.data.choices[0].message.content
  );

  let GeneratedObjects = {
    categories: [],
  };

  for (let category of categoriesObject.categories) {
    let categoryObject = {
      name: category,
      subcategories: [],
    };
    let subCategoriesObject = {
      subcategories: [],
    };
    try {
      var chat_completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo-16k",
        messages: [
          {
            role: "user",
            content: `create 50 course subcategories of the course ${category}  Return them in JSON like this {subcategories:["subacategory1","subcategory2","subcategory3"]}`,
          },
        ],
      });

      subCategoriesObject = JSON.parse(
        chat_completion.data.choices[0].message.content
      );
    } catch (error) {
      // doing something
    }

    for (let subcategory of subCategoriesObject.subcategories) {
      var subCategoryObject = {
        name: subcategory,
        courses: [],
      };

      let titlesObjects = {
        titles: [],
      };

      try {
        var chat_completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo-16k",
          messages: [
            {
              role: "user",
              content: `create 50 distict course title for the topic ${subcategory}  Return them in JSON like this {titles:["title1","title2","title3"]}`,
            },
          ],
        });

        titlesObjects = JSON.parse(
          chat_completion.data.choices[0].message.content
        );
      } catch (error) {
        // noting
      }

      for (let title of titlesObjects.titles) {
        try {
          var chat_completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo-16k",
            messages: [
              {
                role: "user",
                content: `create course description with 500 caracters for the ${title}`,
              },
            ],
          });
        } catch (error) {
          // error message
        }

        let longDescription = chat_completion.data.choices[0].message.content;

        try {
          var chat_completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo-16k",
            messages: [
              {
                role: "user",
                content: `create course description with 50 caracters for the ${title}`,
              },
            ],
          });
        } catch (error) {
          // error message
        }

        let description = chat_completion.data.choices[0].message.content;
        let qa = { QA: [] };
        try {
          var chat_completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo-16k",
            messages: [
              {
                role: "user",
                content: `create 3 questions  and  3 anwers for question for a course with description ${longDescription}  Return them in JSON like this {QA:[{"question" : "question1" , "answers":["answer1" "answer2" , "answer3" ]}, { "question" : "question2" , "answers":["answer1" "answer2" , "answer3" ]}]}`,
              },
            ],
          });
          qa = JSON.parse(chat_completion.data.choices[0].message.content);
        } catch (error) {
          // error message
        }

        let titleObject = {
          title: title,
          longDescription: longDescription,
          description: description,
          qa: qa.QA,
        };

        subCategoryObject.courses.push(titleObject);
        numberOfCourses++;
        console.log(`Number of course ${numberOfCourses} , ${printTime()}`);
      }
      categoryObject.subcategories.push(subCategoryObject);
    }
    GeneratedObjects.categories.push(categoryObject);

    const jsonData = JSON.stringify(GeneratedObjects, null, 2);

    // Specify the file path where you want to write the JSON data
    const filePath = `data.json`;

    // Write the JSON data to the file
    fs.writeFileSync(filePath, jsonData);
  }
};

const getVideoAndPictures = async (data) => {
  for (let category of data.categories) {
    let categoryImage = await getImage(category.name);

    let image =
      categoryImage.totalHits > 0
        ? categoryImage.hits[
            randomNumber(
              0,
              categoryImage.totalHits > 10 ? 9 : categoryImage.totalHits - 1
            )
          ].largeImageURL
        : "";
    category["image"] =
      "https://storage.googleapis.com/testing_uploads/generic_picture.png";
    if (image) {
      const parsedUrl = new URL(image);
      const pathParts = parsedUrl.pathname.split("/");
      const lastPart = pathParts[pathParts.length - 1];
      let file = {
        originalname: lastPart,
        buffer: await getResorce(image),
      };

      category["image"] = await saveObjectToGoogleBucket(
        file,
        process.env.GOOGLE_CATEGORIES_BUCKET_NAME
      );
    }

    for (let subcategory of category.subcategories) {
      let subCategoryImage = await getImage(subcategory.name);
      let subCategoryVideo = await getVideo(subcategory.name);

      let image =
        subCategoryImage.totalHits > 0
          ? subCategoryImage.hits[
              randomNumber(
                0,
                subCategoryImage.totalHits > 10
                  ? 9
                  : subCategoryImage.totalHits - 1
              )
            ].largeImageURL
          : "";
      subcategory["image"] =
        "https://storage.googleapis.com/testing_uploads/generic_picture.png";
      if (image) {
        const parsedUrl = new URL(image);
        const pathParts = parsedUrl.pathname.split("/");
        const lastPart = pathParts[pathParts.length - 1];
        let file = {
          originalname: lastPart,
          buffer: await getResorce(image),
        };

        subcategory["image"] = await saveObjectToGoogleBucket(
          file,
          process.env.GOOGLE_CATEGORIES_BUCKET_NAME
        );
      }
      for (let course of subcategory.courses) {
        let image =
          subCategoryImage.totalHits > 0
            ? subCategoryImage.hits[
                randomNumber(
                  0,
                  subCategoryImage.totalHits > 10
                    ? 9
                    : subCategoryImage.totalHits - 1
                )
              ].largeImageURL
            : "";
        course["image"] =
          "https://storage.googleapis.com/testing_uploads/generic_picture.png";
        if (image) {
          const parsedUrl = new URL(image);
          const pathParts = parsedUrl.pathname.split("/");
          const lastPart = pathParts[pathParts.length - 1];
          let file = {
            originalname: lastPart,
            buffer: await getResorce(image),
          };

          course["image"] = await saveObjectToGoogleBucket(
            file,
            process.env.GOOGLE_CATEGORIES_BUCKET_NAME
          );
        }

        let video =
          subCategoryVideo.totalHits > 0
            ? subCategoryVideo.hits[
                randomNumber(
                  0,
                  subCategoryVideo.totalHits > 10
                    ? 9
                    : subCategoryVideo.totalHits - 1
                )
              ].videos.small.url
            : "";

        course["video"] =
          "https://storage.googleapis.com/testing_uploads/generic_video.mp4";
        course["frame"] =
          "https://storage.googleapis.com/course-frame/64a2724d6e735a6f0f4b227e_large-sprite-sheet0000000000.jpeg";
        if (video) {
          const parsedUrl = new URL(video);
          const pathParts = parsedUrl.pathname.split("/");
          const lastPart = pathParts[pathParts.length - 1];

          let file = {
            originalname: lastPart,
            buffer: await getResorce(course.video),
          };

          course["video"] = await saveObjectToGoogleBucket(
            file,
            process.env.GOOGLE_CATEGORIES_BUCKET_NAME
          );

          sleep(5000);

          /* videoToSpriteSheet(
            course["video"].replace("https://storage.googleapis.com/", "gs://"),
            "gs://course-frame/",
            lastPart
          );
          course[
            "frame"
          ] = `https://storage.googleapis.com/course-frame/${lastPart}_large-sprite-sheet0000000000.jpeg`;*/
        }
      }
    }
  }

  const jsonData = JSON.stringify(data, null, 2);

  // Specify the file path where you want to write the JSON data
  const filePath = `data_and_images.json`;

  // Write the JSON data to the file
  fs.writeFileSync(filePath, jsonData);
  return data;
};

const saveDataVideoAndPictures = async (data) => {
  await Category.deleteMany({});
  await Course.deleteMany({});
  await Directory.deleteMany({});

  const teachers = await User.find({ role: "teacher" });
  const students = await User.find({ role: "student" });
  for (let category of data.categories) {
    console.log(`Creating ${category.name}`);
    const newCategory = await Category.create({
      name: category.name,
      language: "en",
      image: category.image,
      status: "active",
    });

    for (let subcategory of category.subcategories) {
      console.log(`Creating ${subcategory.name}`);
      const newSubCategory = await Category.create({
        name: subcategory.name,
        language: "en",
        image: subcategory.image,
        status: "active",
        categoryFatherId: newCategory._id,
      });

      for (let course of subcategory.courses) {
        console.log(`Creating ${course.title}`);
        let teacher = teachers[randomNumber(0, teachers.length - 1)];
        const newCourse = await Course.create({
          title: course.title,
          languages: ["64a2709642a325cc3a2942a1"],
          price: randomNumber(100, 200),
          duration: randomNumber(60, 6000),
          currency: "USD",
          extendedDescription: course.longDescription
            ? course.longDescription
            : "some decription because AI failed even more ",
          description: course.description
            ? course.description
            : "some description because AI failed...",
          teacherName: teacher.surname + " " + teacher.name,
          teacherPicture: teacher.profilePicture,
          userId: teacher._id,
          status: "published",
          categories: [newCategory._id],
          subcategories: [newSubCategory._id],

          numberOfLikes: randomNumber(100, 200),
          numberOfVisits: randomNumber(500, 1000),
          numberOfPurchases: randomNumber(10, 100),
          raanking: randomNumber(0, 5),
          customerPictures: [
            "https://cdn.pixabay.com/photo/2019/12/16/14/46/black-man-4699505_1280.jpg",
            "https://cdn.pixabay.com/photo/2017/03/21/01/17/asian-2160794_1280.jpg",
            "https://cdn.pixabay.com/photo/2018/08/18/16/23/indian-man-3615047_1280.jpg",
            "https://cdn.pixabay.com/photo/2019/06/30/07/34/lgbt-4307493_1280.jpg",
            "https://cdn.pixabay.com/photo/2022/01/07/01/21/girl-6920626_1280.jpg",
          ],
          trailer: course.video,
          frame: course.frame,
          thumbnail: course.image,
        });

        course["id"] = newCourse._id;

        let directory = await Directory.findOne({ userId: teacher._id });

        if (!directory) {
          directory = await Directory.create({
            name: "root",
            type: "folder",
            language: "en",
            userId: teacher._id,
          });
        }

        await Directory.create({
          name: newCourse.title,
          type: "course",
          language: "en",
          userId: teacher._id,
          upperFolderId: directory._id,
          course: newCourse._id,
        });
      }
    }
  }

  const jsonData = JSON.stringify(data, null, 2);

  // Specify the file path where you want to write the JSON data
  const filePath = `data_and_images_and_id.json`;

  // Write the JSON data to the file
  fs.writeFileSync(filePath, jsonData);
  return data;
};

const updateCourse = async (data) => {
  await QuestionAnswer.deleteMany({});
  await Chapter.deleteMany({});
  await Lesson.deleteMany({});
  await Review.deleteMany({});
  const teachers = await User.find({ role: "teacher" });
  const students = await User.find({ role: "student" });
  let coursesUpdated = 0;
  for (let category of data.categories) {
    for (let subcategory of category.subcategories) {
      for (let course of subcategory.courses) {
        coursesUpdated++;
        console.log(`Course Updated number ${coursesUpdated}`);
        let courseDB = await Course.findById(course.id);

        console.log(`creating chapter for courseId ${courseDB._id}`);
        const createdChapter = await Chapter.create({
          title: "Introduction",
          public: true,
        });

        for (let i = 0; i < 5; i++) {
          console.log(`creating lessons for counse ${courseDB._id}`);
          let createdLesson = await Lesson.create({
            title: `Lesson number ${i}`,
            thumbnail:
              "https://storage.googleapis.com/testing_uploads/generic_picture.png",
            video: {
              url: "https://storage.googleapis.com/testing_uploads/generic_video.mp4",
              duraration: randomNumber(10, 60),
            },
          });
          createdChapter.lessons.push(createdLesson.id);
        }

        createdChapter.save();

        courseDB.chapters.push(createdChapter.id);
        await courseDB.save();

        const reviews = [];

        /*

{
  user: {
    id: { type: String, required: true },

    profilePicture: { type: String, required: true },

    name: { type: String, required: true },

    numberOfReviews: { type: Number, required: true, default: 0 },
  },

  title: { type: String, required: true },

  stars: { type: Number, required: true, min: 1, max: 5 },

  reviewText: { type: String, required: true },

  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },

  userId: {
    type: String,
    required: true,
  },

  answer: String,
})

       */
        for (let i = 0; i < randomNumber(5, 10); i++) {
          console.log(`Writing review for ${course.id}`);
          let user = students[randomNumber(0, students.length - 1)];
          let reviewUser = {
            id: user._id,
            profilePicture: user.profilePicture,
            name: user.name,
            numberOfReviews: randomNumber(1, 12),
          };

          let evaluation = randomNumber(1, 5);
          let review = {
            user: reviewUser,
            title: course.title,
            reviewText: `${course.title}  is a course of ${evaluation} starts`,
            stars: evaluation,
            userId: user._id,
            course: course.id,
          };

          await Review.create(review);
        }

        let counterQa = 0;
        for (let i = 0; i < randomNumber(0, 7); i++) {
          for (let qa of course.qa) {
            try {
              console.log(`Updating ${course.id}`);

              let student = students[randomNumber(0, students.length - 1)];

              let teacher = await User.findById(courseDB.userId);
              console.log(`Creating question  for course ${course.id}`);

              let newQuestion = await QuestionAnswer.create({
                title: qa.question ? qa.question : "Ai does not work",
                body: qa.question ? qa.question : "Ai does not work",
                type: "question",
                resource: "course",
                solved: counterQa == 0 ? true : false,
                user: {
                  id: student._id,
                  imageUrl: student.profilePicture,
                  firstName: student.name,
                  lastName: student.surname,
                  username: `@${student.name}_@${student.surname}`,
                },
                course: course.id,
              });

              if (qa.answers) {
                let counterAnswers = 0;

                for (let i = 0; i < randomNumber(1, 5); i++) {
                  for (let answer of qa.answers) {
                    console.log(`Creating answer for course ${course.id}`);
                    const newAnswer = await QuestionAnswer.create({
                      title: answer ? answer : "AI does not work ",
                      body: answer ? answer : "AI does not work ",
                      type: "answer",
                      user: {
                        id: teacher._id,
                        imageUrl: teacher.profilePicture,
                        firstName: teacher.name,
                        lastName: teacher.surname,
                        username: `@${teacher.name}_@${teacher.surname}`,
                      },
                      solved: Boolean(randomNumber(0, 1)),
                      father: newQuestion._id,
                    });
                    for (let j = 0; j < randomNumber(1, 5); j++) {
                      console.log(`Creating answer for answer ${newAnswer.id}`);
                      const dataUser =
                        students[randomNumber(0, students.length - 1)];
                      await QuestionAnswer.create({
                        title: answer ? `${answer}  ${j}` : "AI does not work ",
                        body: answer ? `${answer}  ${j}` : "AI does not work ",
                        type: "answer",
                        user: {
                          id: dataUser._id,
                          imageUrl: dataUser.profilePicture,
                          firstName: dataUser.name,
                          lastName: dataUser.surname,
                          username: `@${dataUser.name}_@${dataUser.surname}`,
                        },
                        solved: Boolean(randomNumber(0, 1)),
                        father: newAnswer._id,
                      });
                      counterAnswers++;
                    }
                    counterAnswers++;
                  }
                }

                newQuestion.numberOfAnswers = counterAnswers;
                newQuestion.save();
              }
              counterQa++;
            } catch (error) {
              console.log("error in uploading ", error);
            }
          }
        }
      }
    }
  }
};

async function generateFakeCourses() {
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
    if (!fs.existsSync("data.json")) {
      await generateFakeData();
    }

    let data = JSON.parse(fs.readFileSync("data.json", "utf-8"));
    if (!fs.existsSync("data_and_images.json")) {
      await getVideoAndPictures(data);
    }
    data = JSON.parse(fs.readFileSync("data_and_images_and_id.json", "utf-8"));

    //if (fs.existsSync("data_and_images_and_id.json")) {
    await saveDataVideoAndPictures(data);
    //}

    data = JSON.parse(fs.readFileSync("data_and_images_and_id.json"));

    await updateCourse(data);

    exit(0);
  });
}

generateFakeCourses();
