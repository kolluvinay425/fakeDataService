import { Storage } from "@google-cloud/storage";
import { join } from "path";

const credentials = join(
  process.cwd(),
  "google_key/backend-test-aladia-686c75a478c9.json"
);
// const bucketName = process.env.GOOGLE_BUCKET_NAME;

const gcStorage = new Storage();

export const saveObjectToGoogleBucket = (objectFile, bucketName) => {
  return new Promise((resolve, reject) => {
    const bucket = gcStorage.bucket(bucketName);
    const { originalname, buffer } = objectFile;

    // Upload the file to Google Cloud Storage
    const gcsFileName = `${Date.now()}-${originalname}`;
    const blob = bucket.file(gcsFileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });
    blobStream.on("error", (err) => {
      console.error(err);
      reject(err);
    });
    blobStream.on("finish", async () => {
      const url = `https://storage.googleapis.com/${bucketName}/${gcsFileName}`; // use the correct URL format
      await blob.makePublic();
      resolve(url);
    });
    console.log(buffer);
    blobStream.end(buffer);
  });
};
