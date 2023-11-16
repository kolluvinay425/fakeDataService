import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import morgan from "morgan";

import routerUser from "./routers/users/index.js";
import routerTeam from "./routers/teams/index.js";

const app = express();

app.use(cookieParser());

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(
  morgan(
    '[:date[clf]] ":method :url HTTP/:http-version" :req[authorization] :status :req[content-length] req[origin]'
  )
);

app.use("/api/v1/users", routerUser);
app.use("/api/v1/teams", routerTeam);

export default app;
