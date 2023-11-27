import mongoose from "mongoose";
import app from "./app.js";

import config from "./config/index.js";

const mongoConnection = mongoose.connect(config.mongoUri);

mongoose.createConnection(config.mongoUri).asPromise();
mongoConnection.then(() => {
  app.listen(config.port, () => {
    console.log(`Connected with mongoDB at ${config.mongoUri}`);
    console.log(`Server running on port ${config.port}`);
  });
});
