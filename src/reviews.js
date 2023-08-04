import tf from "@tensorflow/tfjs-node";
import pkg from "openai";
const { create, Configuration, OpenAIApi } = pkg;
import User from "./models/users/index.js";
import Course from "./models/courses/index.js";
import Review from "./models/review/index.js"; // Assuming there's a Review model
import mongoose from "mongoose";
import * as dotenv from "dotenv";

// Function to generate unique texts in batches
dotenv.config();
// async function generateUniqueTextsInBatches(openai, prompts, batchSize) {
//   try {
//     const totalIterations = prompts.length;
//     const generatedTexts = [];

//     for (let i = 0; i < totalIterations; i += batchSize) {
//       const batchPrompts = prompts.slice(i, i + batchSize);
//       const batchResults = await Promise.all(
//         batchPrompts.map((prompt) => generateUniqueText(openai, prompt))
//       );

//       generatedTexts.push(...batchResults);

//       // Add a delay between batches to avoid hitting rate limits
//       if (i + batchSize < totalIterations) {
//         await new Promise((resolve) => setTimeout(resolve, 1000)); // Adjust delay as needed
//       }
//     }

//     // Return the generated texts for all prompts
//     return generatedTexts;
//   } catch (error) {
//     console.error("Error generating unique texts in batches:", error);
//     return [];
//   }
// }

// // Function to generate unique text using GPT-3 API
// async function generateUniqueText(openai, prompt) {
//   try {
//     const response = await openai.completions.create({
//       engine: "text-davinci-002", // GPT-3 engine
//       prompt: prompt,
//       max_tokens: 200,
//       temperature: 0.7,
//       top_p: 1.0,
//     });

//     const generatedText = response.data.choices[0].text;
//     return generatedText;
//   } catch (error) {
//     console.error("Error generating unique text:", error);
//     return "";
//   }
// }

// // Function to create review text using GPT-3 API
// async function createReviewText(openai, courseTitle, isNegative = false) {
//   const prompt = isNegative
//     ? `create negative review text of 3 lines for ${courseTitle} and  Return text in JSON like this {reviewText:"review text"}`
//     : `create review text of 4 lines for ${courseTitle} and  Return text in JSON like this {reviewText:"review text"}`;

//   const reviewText = await generateUniqueText(openai, prompt);
//   return reviewText;
// }

// // Function to create teacher's answer using GPT-3 API
// async function createTeacherAnswer(openai, reviewText) {
//   const prompt = `create teacher answer text of 3 lines as a response to this text "${reviewText}" and  Return text in JSON like this {teacherReview:"review text"}`;

//   const teacherAnswer = await generateUniqueText(openai, prompt);
//   return teacherAnswer;
// }

// async function createReviews() {
//   try {
//     // MongoDB connection
//     await mongoose.connect(process.env.MONGO_URI);
//     mongoose.createConnection(process.env.MONGO_URI).asPromise();
//     console.log("Connected to MongoDB");

//     // Configure OpenAI API
//     const configuration = new Configuration({
//       apiKey: process.env.OPENAI_API_KEY,
//     });
//     const openai = new OpenAIApi(configuration);

//     // Get students and courses from the database
//     const students = await User.find({ role: "student" });
//     const courses = await Course.find();

//     for (const course of courses) {
//       const teacher = await User.findById(course.userId);

//       const requiredReviews = 15;
//       let reviewsAnsweredByTeacher = 0;

//       // Arrays to hold prompts for review texts and teacher's answers
//       const reviewTextPrompts = [];
//       const teacherAnswerPrompts = [];

//       for (let i = 0; i < requiredReviews; i++) {
//         var user;
//         do {
//           user = students[Math.floor(Math.random() * students.length)];
//         } while (
//           (await Review.countDocuments({
//             "user.id": user._id,
//             course: course.id,
//           })) > 0
//         );

//         var evaluation = Math.floor(Math.random() * 5) + 1;
//         const withAnswer = reviewsAnsweredByTeacher < 10 && Math.random() < 0.5;

//         var reviewUser = {
//           id: user._id,
//           profilePicture: user.profilePicture,
//           name: user.name,
//           surname: user.surname,
//           numberOfReviews: Math.floor(Math.random() * 12) + 1,
//         };

//         const reviewTextPrompt = await createReviewText(
//           openai,
//           course.title,
//           i % 2 === 1
//         );
//         reviewTextPrompts.push(reviewTextPrompt);

//         if (withAnswer) {
//           reviewsAnsweredByTeacher++;

//           const teacherReviewPrompt = await createTeacherAnswer(
//             openai,
//             reviewTextPrompt
//           );
//           teacherAnswerPrompts.push(teacherReviewPrompt);
//         }
//       }

//       // Use batch processing to generate review texts and teacher's answers
//       const batchSize = 5; // Batch size for parallel processing
//       const reviewTexts = await generateUniqueTextsInBatches(
//         openai,
//         reviewTextPrompts,
//         batchSize
//       );
//       const teacherAnswers = await generateUniqueTextsInBatches(
//         openai,
//         teacherAnswerPrompts,
//         batchSize
//       );

//       // Create and save reviews to the database
//       for (let i = 0; i < requiredReviews; i++) {
//         const reviewText = reviewTexts[i];
//         const teacherAnswer = teacherAnswers[i];

//         const review = new Review({
//           user: reviewUser,
//           title: course.title,
//           stars: evaluation,
//           reviewText: reviewText,
//           course: course.id,
//           userId: user._id,
//           answered: withAnswer,
//           teacherAnswer: withAnswer
//             ? {
//                 userId: teacher._id,
//                 name: teacher.name,
//                 text: teacherAnswer,
//                 profilePicture: teacher.profilePicture,
//               }
//             : undefined,
//         });

//         // Save the review to the database
//         await review.save();
//       }
//     }

//     console.log("Reviews creation completed.");
//   } catch (error) {
//     console.error("Error creating reviews:", error);
//   }
// }

// // Call the createReviews function to start generating reviews
// createReviews();
// Assuming the Review model and other required dependencies are included

// Function to generate unique random review text
function generateUniqueRandomReviewText(courseTitle, isNegative = false) {
  const reviewTemplates = isNegative
    ? [
        `I don't like the course "${courseTitle}".`,
        `The course "${courseTitle}" was disappointing.`,
        `I expected more from "${courseTitle}".`,
      ]
    : [
        `I enjoyed the course "${courseTitle}".`,
        `The course "${courseTitle}" was informative and engaging.`,
        `I would recommend "${courseTitle}" to others.`,
      ];

  const shuffledTemplates = reviewTemplates.sort(() => Math.random() - 0.5);
  return shuffledTemplates[0];
}

function generateUniqueRandomTeacherAnswer(existingAnswers) {
  const teacherAnswerTemplates = [
    "Thank you for your feedback!",
    "We appreciate your review and are glad you enjoyed the course.",
    "We're sorry to hear that you didn't find the course to your liking. We'll take your feedback into consideration.",
  ];

  const shuffledTemplates = teacherAnswerTemplates.sort(
    () => Math.random() - 0.5
  );
  const uniqueAnswer = shuffledTemplates[0];

  if (existingAnswers.includes(uniqueAnswer)) {
    return generateUniqueRandomTeacherAnswer(existingAnswers);
  }

  return uniqueAnswer;
}

async function createReviews() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    mongoose.createConnection(process.env.MONGO_URI).asPromise();
    console.log("Connected to MongoDB");
    const students = await User.find({ role: "student" });
    const courses = await Course.find();
    for (const course of courses) {
      const teacher = await User.findById(course.userId);

      const requiredReviews = 15;
      const existingTeacherAnswers = [];
      const existingReviewTexts = [];

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
        let reviewsAnsweredByTeacher = 0;
        const evaluation = Math.floor(Math.random() * 5) + 1;
        const withAnswer = reviewsAnsweredByTeacher < 10 && Math.random() < 0.5;
        console.log(user);
        const reviewUser = {
          id: user._id,
          profilePicture: user.profilePicture,
          name: user.name,
          surname: user.surname,
          numberOfReviews: Math.floor(Math.random() * 12) + 1,
        };

        let reviewText, teacherAnswer;

        do {
          reviewText = generateUniqueRandomReviewText(
            course.title,
            i % 2 === 1
          );
        } while (existingReviewTexts.includes(reviewText));
        existingReviewTexts.push(reviewText);

        if (withAnswer) {
          reviewsAnsweredByTeacher++;

          do {
            teacherAnswer = generateUniqueRandomTeacherAnswer(
              existingTeacherAnswers
            );
          } while (existingTeacherAnswers.includes(teacherAnswer));
          existingTeacherAnswers.push(teacherAnswer);
        }

        const review = new Review({
          user: reviewUser,
          title: course.title,
          stars: evaluation,
          reviewText: reviewText,
          course: course.id,
          userId: user._id,
          answered: withAnswer,
          teacherAnswer: withAnswer
            ? {
                userId: teacher._id,
                name: teacher.name,
                text: teacherAnswer,
                profilePicture: teacher.profilePicture,
              }
            : undefined,
        });

        // Save the review to the database
        await review.save();
      }
      console.log("review created");
    }

    console.log("Reviews creation completed.");
  } catch (error) {
    console.error("Error creating reviews:", error);
  }
}

createReviews();
