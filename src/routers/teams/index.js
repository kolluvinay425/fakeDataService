import express from "express";

import { generateTeamData } from "../../controllers/teams/index.js";
import { authMiddleware } from "../../helpers/auth/auth.js";

const routerTeam = express.Router();

routerTeam.post("/", authMiddleware, generateTeamData);

export default routerTeam;
