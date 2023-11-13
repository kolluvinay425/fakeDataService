import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";

import { promises as fsPromises } from "fs";
import path from "path";

import Organization from "./models/organizations/index.js";
import OrganizationAccountRole from "./models/organizationAccountRoles/index.js";
import OrganizationSpace from "./models/organizationSpace/index.js";
import CourseType from "./models/courseType/index.js";
import SpaceCourse from "./models/spaceCourses/index.js";
import OrganizationSpacesAccountRole from "./models/organizationSpaceAccountRoles/index.js";
import UserCourseRole from "./models/userCourseRole/index.js";

/**
 * Get all organizations and add 2 distinct admin user roles, 30 organization members, 5 spaces to each organizatoins
 * 6 courses, 5 distinct coordinator roles for each space, a teacher for each course and one teacher for each course and the rest of the members should be attendees
 */
dotenv.config();
console.log(process.env.MONGO_URI);

async function createOrganizationData(filePath) {
  //Create connection
  const mongoConnection = mongoose.connect(process.env.MONGO_URI);
  mongoose.createConnection(process.env.MONGO_URI).asPromise();

  const memberData = {
    organizationId: "",
    nameSurname: `${faker.person.firstName()} ${faker.person.lastName()}`,
    email: faker.internet.email(),
    accountId: new mongoose.Types.ObjectId().toString(),
    role: "",
    invitationStatus: "accepted",
  };

  mongoConnection.then(async () => {
    //Create a CourseType
    const courseType = await CourseType({ language: "Englinsh" });
    //Get all organizations
    const organizations = await Organization.find();
    const mockData = [];
    const organizationMembers = [];
    const organizationSpaces = [];
    for (const organization of organizations) {
      const orgData = {
        organization: organization,
        organizationMembers: [],
        spaces: {
          coordinators: [],
          courses: { courses: [], teachers: [], attendants: [] },
        },
      };
      //Prepare 2 users with Admin role
      for (let j = 0; j <= 1; j++) {
        const memberData = {
          organizationId: organization.id,
          nameSurname: `${faker.person.firstName()} ${faker.person.lastName()}`,
          email: faker.internet.email(),
          accountId: new mongoose.Types.ObjectId().toString(),
          role: "Admin",
          invitationStatus: "accepted",
        };
        organizationMembers.push(memberData);
        orgData.organizationMembers.push(memberData);
      }
      //Prepare 30 users with `Member` role
      for (let i = 0; i <= 29; i++) {
        const memberData = {
          organizationId: organization.id,
          nameSurname: `${faker.person.firstName()} ${faker.person.lastName()}`,
          email: faker.internet.email(),
          accountId: new mongoose.Types.ObjectId().toString(),
          role: "Member",
          invitationStatus: "accepted",
        };
        organizationMembers.push(memberData);
        orgData.organizationMembers.push(memberData);
      }
      //Prepare 5 organization spaces for this organization
      const orgSpace = [];
      [
        "Computer Science",
        "Software Engineering",
        "Graphic Design",
        "Digital Marketing",
        "Social Media Management",
      ].map((space) => {
        const spaceData = { organizationId: organization.id, name: space };
        organizationSpaces.push(spaceData);
        orgSpace.push(spaceData);
      });
      //Create the spaces
      const spaces = await OrganizationSpace.insertMany(orgSpace);
      for (const space of spaces) {
        //Prepare 6 course for 1 space
        const courses = [];
        for (let n = 0; n <= 5; n++) {
          const courseData = {
            organizationId: organization.id,
            spaceId: space._id.toString(),
            name: `Course ${n + 1}`,
            typeId: courseType._id.toString(),
          };
          courses.push(courseData);
          orgData.spaces.courses.courses.push(courseData);
        }
        //Prepare 5 users for each space
        const coordinators = [];
        for (let z = 0; z <= 4; z++) {
          const coordinatorData = {
            spaceId: space._id.toString(),
            accountId: new mongoose.Types.ObjectId().toString(),
            role: "coordinator",
          };
          coordinators.push(coordinatorData);
          orgData.spaces.coordinators.push(coordinatorData);
        }
        //Create the 6 courses for this space and Create the 5 coordinators for this space
        const courseList = await SpaceCourse.insertMany(courses);
        const spaceUserList = await OrganizationSpacesAccountRole.insertMany(
          coordinators
        );
        for (const course of courseList) {
          const teacher = {
            courseId: course._id.toString(),
            accountId: new mongoose.Types.ObjectId().toString(),
            role: "teacher",
          };
          //Create 1 teacher user for this course
          await UserCourseRole.insertMany(teacher);
          //Create 4 attendant users for this course
          const attendants = [];
          for (let a; a < 3; a++) {
            const attendant = {
              courseId: course._id.toString(),
              accountId: new mongoose.Types.ObjectId().toString(),
              role: "attendant",
            };
            attendants.push(attendant);
            orgData.spaces.courses.attendants.push(attendant);
          }
          await UserCourseRole.insertMany(attendants);
        }
      }
      //Create the orgnaization users
      await OrganizationAccountRole.insertMany(organizationMembers);
      orgData.organizationMembers.push(organizationMembers);
      mockData.push(orgData);
    }
    //Write the Data to file
    const jsonData = JSON.stringify(mockData, null, 2);
    await fsPromises.writeFile(filePath, jsonData);
    process.exit(0);
  });
}

const filePath = path.join(process.cwd(), "/fakeData/organizationData.json");
createOrganizationData(filePath);
