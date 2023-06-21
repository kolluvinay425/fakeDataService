import Course from "../src/models/courses/index.js";
import Directory from "../src/models/folders/index.js";
import { faker } from "@faker-js/faker";
async function generateFakeCourses() {
  const users = [
    "648b02f240d3ccd568cdec1c",
    "6470705f82c13d532f2f1b47",
    "64747c1662e07cf9ce6a0020",
    "64759fe432a636e04fcc9325",
    "64784093a4405a36a9ff8a67",
    "648c368c2056174932623d0e",
  ];

  try {
    for (let i = 0; i < 50; i++) {
      const course = new Course({
        title: faker.lorem.words(3),
        languages: [], // Add language IDs here if necessary
        price: faker.datatype.number({ min: 10, max: 100 }),
        currency: "USD",
        description: faker.lorem.paragraph(),
        thumbnail: faker.image.imageUrl(),
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
}
export { generateFakeCourses };
