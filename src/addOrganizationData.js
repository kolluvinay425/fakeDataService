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

import mock from "./mock.js";

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

  mongoConnection.then(async () => {
    //Create courseType
    const courseType = await CourseType({ language: "Englinsh" });

    //Get all organizations
    const organizations = await Organization.find();
    console.log(`=> Got ${organizations.length} organizations from the DB \n`);

    const result = [];
    for (const organization of organizations) {
      console.log(`Processing Organization ${organization.name}\n`);

      const orgData = {
        organization: organization,
        members: [],
        spaces: [],
        courses: [],
        coordinators: [],
        teachers: [],
        attendants: [],
      };

      //Create 5 spaces for each organization
      for (const space of mock.spaces) {
        const spaceData = {
          organizationId: organization.id,
          name: space.name,
        };

        const spaceResult = await OrganizationSpace.create(spaceData);
        orgData.spaces.push(spaceResult);

        //Create 6 courses for this space
        for (const course of space.courses) {
          const courseData = {
            organizationId: organization.id,
            spaceId: spaceResult._id.toString(),
            name: course,
            typeId: courseType._id.toString(),
          };

          const courseResult = await SpaceCourse.create(courseData);
          orgData.courses.push(courseResult);
        }
      }

      console.log(
        `=> Created ${orgData.spaces.length} spaces for each organization`
      );
      console.log(
        `=> Created ${orgData.courses.length} courses for ${orgData.spaces.length} space`
      );

      //Create 30 members for this organization
      for (let i = 0; i <= 29; i++) {
        const userId = new mongoose.Types.ObjectId().toString();

        const memberData = {
          organizationId: organization.id,
          nameSurname: `${faker.person.firstName()} ${faker.person.lastName()}`,
          email: faker.internet.email(),
          accountId: userId,
          role: i == 0 ? "Admin" : "Member",
          invitationStatus: "accepted",
        };

        const memberResult = await OrganizationAccountRole.create(memberData);
        orgData.members.push(memberResult);

        //Make the first 5 members coordinators for all spaces
        if (i <= 4) {
          for (const space of orgData.spaces) {
            const coordinatorData = {
              spaceId: space._id.toString(),
              accountId: userId,
              role: "coordinator",
            };

            const coordinatorResult =
              await OrganizationSpacesAccountRole.create(coordinatorData);
            orgData.coordinators.push(coordinatorResult);
          }
        }

        //Make the sixth member a teacher for all courses
        if (i === 5) {
          for (const course of orgData.courses) {
            const teacherData = {
              courseId: course._id.toString(),
              accountId: userId,
              role: "teacher",
            };

            const teacherResult = await UserCourseRole.create(teacherData);
            orgData.teachers.push(teacherResult);
          }
        }

        //Make the rest 24 members attendants for all courses
        if (i > 5) {
          for (const course of orgData.courses) {
            const attendantData = {
              courseId: course._id.toString(),
              accountId: userId,
              role: "attendant",
            };

            const attendantResult = await UserCourseRole.create(attendantData);
            orgData.attendants.push(attendantResult);
          }
        }
      }

      console.log(
        `=> Created ${orgData.members.length} members for each organization`
      );
      console.log(
        `=> Created ${orgData.coordinators.length} coordinators for ${orgData.spaces.length} spaces`
      );

      console.log(
        `=> Created ${orgData.teachers.length} teachers for ${orgData.courses.length} courses`
      );

      console.log(
        `=> Created ${orgData.attendants.length} attendants for ${orgData.courses.length} courses\n`
      );

      result.push(orgData);
    }

    //Write the Data to file
    const jsonData = JSON.stringify(result, null, 2);
    await fsPromises.writeFile(filePath, jsonData);

    console.log("=> Creating fake data completed");
    process.exit(0);
  });
}

const filePath = path.join(process.cwd(), "/fakeData/organizationData.json");
createOrganizationData(filePath);
