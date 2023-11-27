import express from "express";
import { body, param, query } from "express-validator";

import { login } from "../../controllers/users/index.js";
import { validateRequest } from "../../helpers/validator/index.js";

const routerUser = express.Router();

routerUser.post(
  "/:userId/tokens",
  param("userId").isMongoId().exists(),
  body("password").exists().isString(),
  validateRequest,

  login
);

export default routerUser;
