import mongoose from "mongoose";
import dotenv from "dotenv";

import SpaceCourse from "../models/spaceCourses/index.js";
import OrganizationSpace from "../models/organizationSpace/index.js";
import OrganizationTeam from "../models/organizationTeams/index.js";
import OrganizationTeamMember from "../models/organizationTeamMembers/index.js";
import Organization from "../models/organizations/index.js";
import TeamSpaceRole from "../models/teamSpaceRole/index.js";
import TeamCourseRole from "../models/teamCourseRole/index.js";
import User from "../models/users/index.js";

dotenv.config();

async function generateTeamData() {
  try {
    //1. Create connection
    const mongoConnection = mongoose.connect(process.env.MONGO_URI);
    mongoose.createConnection(process.env.MONGO_URI).asPromise();

    //2. Get all organizations, courses, spaces, teams and team members from the DB
    const organizations = await Organization.find();
    const courses = await SpaceCourse.find();
    const spaces = await OrganizationSpace.find();
    const teams = await OrganizationTeam.find();
    const teamMembers = await OrganizationTeamMember.find();
    const users = await User.find();
    const teamSpaceRoles = await TeamSpaceRole.find();
    const teamCourseRoles = await TeamCourseRole.find();

    const teamIds = teams.map((team) => team._id.toString());
    const teamMemberIds = teamMembers.map((member) => member._id.toString());
    const spaceRoleIds = teamSpaceRoles.map((role) => role._id.toString());
    const courseRoleIds = teamCourseRoles.map((role) => role._id.toString());

    console.log(
      `=> Found ${organizations.length} organizations in the database`
    );
    console.log(`=> Found ${courses.length} courses in the database`);
    console.log(`=> Found ${spaces.length} spaces in the database`);
    console.log(`=> Found ${teams.length} teams in the database`);
    console.log(
      `=> Found ${teamMemberIds.length} team members in the database`
    );
    console.log(
      `=> Found ${spaceRoleIds.length} team space roles in the database`
    );
    console.log(
      `=> Found ${courseRoleIds.length} team courseRoles roles in the database\n`
    );

    if (courses.length < 5) {
      throw new Error("You need to have at least 5 courses in the database");
    }

    if (spaces.length < 5) {
      throw new Error("You need to have at least 5 spaces in the database");
    }

    if (users.length < 30) {
      throw new Error("You need to have at least 30 users in the database");
    }

    //3. Delete existing teams and team members
    const deletedTeam = await OrganizationTeam.deleteMany({
      _id: { $in: teamIds },
    });
    console.log(`=> Deleted ${deletedTeam.deletedCount} Teams`);

    const deletedTeamMember = await OrganizationTeamMember.deleteMany({
      _id: { $in: teamMemberIds },
    });
    console.log(`=> Deleted ${deletedTeamMember.deletedCount} Team members`);

    const deletedSpaceRole = await TeamSpaceRole.deleteMany({
      _id: { $in: spaceRoleIds },
    });
    console.log(`=> Deleted ${deletedSpaceRole.deletedCount} Team space roles`);

    const deletedCourseRole = await TeamCourseRole.deleteMany({
      _id: { $in: courseRoleIds },
    });
    console.log(
      `=> Deleted ${deletedCourseRole.deletedCount} Team course roles\n`
    );

    for (const organization of organizations) {
      //5. Create 5 teams for 1 organization
      const teamData = [];
      for (let i = 0; i <= 4; i++) {
        teamData.push({
          organizationId: organization._id.toString(),
          name: `Team ${i + 1}`,
          picture:
            "https://storage.googleapis.com/testing_uploads/1698324926207-Elec.jpeg",
        });
      }
      const organizationTeams = await OrganizationTeam.insertMany(teamData);

      //6. Create 5 team member for each team make the first team coordinator for all spaces, second team teacher for all courses and the rest teams should be attendants in all courses
      let counter = 0;
      for (let m = 0; m < organizationTeams.length; m++) {
        const team = organizationTeams[m];

        //6.1 Create Members
        const teamMemberData = [];
        for (let k = 0; k <= 4; k++) {
          teamMemberData.push({
            teamId: team._id.toString(),
            accountId: users[counter]._id.toString(),
          });
          counter++;
        }

        const organizationTeamMembers = await OrganizationTeamMember.insertMany(
          teamMemberData
        );

        //6.2 Make the first team a coordinator for all spaces
        if (m === 0) {
          const organizationSpaces = await OrganizationSpace.find({
            organizationId: organization._id.toString(),
          });

          const teamSpaceRoleData = [];
          for (const space of organizationSpaces) {
            teamSpaceRoleData.push({
              teamId: team._id.toString(),
              spaceId: space._id.toString(),
              role: "coordinator",
            });
          }

          const teamSpaceRoleResult = await TeamSpaceRole.insertMany(
            teamSpaceRoleData
          );
        }

        const organizationCourses = await SpaceCourse.find({
          organizationId: organization._id.toString(),
        });

        //6.3 Make the second team a teacher for all courses
        if (m === 1) {
          const teachers = [];
          for (const course of organizationCourses) {
            teachers.push({
              teamId: team._id.toString(),
              courseId: course._id.toString(),
              role: "teacher",
            });
          }

          await TeamCourseRole.insertMany(teachers);
        }

        //6.4 Make the rest of the teams attendants
        if (m > 1) {
          const attendants = [];
          for (const course of organizationCourses) {
            attendants.push({
              teamId: team._id.toString(),
              courseId: course._id.toString(),
              role: "attendant",
            });
          }

          await TeamCourseRole.insertMany(attendants);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

generateTeamData();
