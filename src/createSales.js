import Sale from "./models/sales/index.js";
import Course from "./models/courses/index.js";
import User from "./models/users/index.js";
import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const generateRandomPaymentId = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let paymentId = "";
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    paymentId += characters.charAt(randomIndex);
  }
  return paymentId;
};

const sales = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const users = await User.find();
    const courses = await Course.find().limit(500);

    for (const user of users) {
      let salesCounter = 0;
      for (let i = 0; i < 10; i++) {
        const randomCourseIndex = Math.floor(Math.random() * courses.length);
        const course = courses[randomCourseIndex];

        if (user._id.toString() === course.userId.toString()) {
          continue;
        }
        const randomPrice = Math.floor(Math.random() * 500) + 100;

        const now = new Date();
        const startTimestamp = new Date("2021-01-01").getTime();
        const endTimestamp = now.getTime();
        const randomTimestamp =
          Math.floor(Math.random() * (endTimestamp - startTimestamp)) +
          startTimestamp;

        const randomDate = new Date(randomTimestamp);
        const randomPaymentId = generateRandomPaymentId();
        await Sale.create({
          name: user.name,
          surname: user.surname,
          profilePicture: user.profilePicture
            ? user.profilePicture
            : "https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg",
          userId: user._id,
          courseId: course._id,
          paymentId: randomPaymentId,
          teacherId: course.userId,
          price: randomPrice,
          createdAt: randomDate,
          updatedAt: randomDate,
        });
        console.log("sale created successfully");
        salesCounter++;

        if (salesCounter >= 10) {
          break;
        }
      }
    }

    console.log("Sales created successfully");
  } catch (error) {
    console.error("Error creating sales:", error);
  }
};

sales();
