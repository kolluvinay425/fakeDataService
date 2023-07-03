import Directory from "../../models/folders/index.js";
import { PubSub } from "@google-cloud/pubsub";

const pubsub = new PubSub({ projectId: process.env.GOOGLE_PROJECT_ID });
export const subscriberCreateRootFolder = () => {
  const topic = pubsub.topic("create-root-folder");
  console.log("subscriber create-root-folder started");

  const subscription = topic.subscription("create-root-folder-sub");

  subscription.on("message", async (message) => {
    const msg = message.data.toString();
    const data = JSON.parse(msg);

    const check = await Directory.findOne({ userId: data.userId });
    if (check) {
      console.log("root folder already exist");
      console.log(check);
      return;
    }
    const userRootFolder = await Directory.create({
      name: "root",
      type: "folder",
      language: "en",
      userId: data.userId,
    });
    console.log("root folder created", userRootFolder);
  });
};
