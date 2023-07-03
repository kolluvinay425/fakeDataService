import https from "https";
import querystring from "querystring";
import * as followRedirect from "follow-redirects";

const pixabayUserKey = process.env.PIXABAY_USER_KEY;
const pixabayUrl = "https://pixabay.com/api/";

const constructPictureQueryString = (query) => {
  let queryObject = {
    key: process.env.PIXABAY_USER_KEY,
    q: query.split(" ").join("+").toLowerCase(),
    image_type: "all",
    orientation: "all",
    per_page: 10,
  };

  return querystring.stringify(queryObject);
};

const constructVideoQueryString = (query) => {
  let queryObject = {
    key: process.env.PIXABAY_USER_KEY,
    q: query.split(" ").join("+").toLowerCase(),
    video_type: "film",
    per_page: 10,
  };

  return querystring.stringify(queryObject);
};

const getImage = async (query) => {
  return new Promise((resolve, reject) => {
    console.log(
      "getPicture",
      `${pixabayUrl}?${constructPictureQueryString(query)}`
    );
    https.get(
      `${pixabayUrl}?${constructPictureQueryString(query)}`,
      (response) => {
        let data = "";
        response.on("data", (fragments) => {
          data += fragments;
        });

        response.on("end", () => {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        });

        response.on("error", (error) => {
          reject(error);
        });
      }
    );
  });
};

const getVideo = async (query) => {
  return new Promise((resolve, reject) => {
    console.log(`${pixabayUrl}video/?${constructVideoQueryString(query)}`);
    https.get(
      `${pixabayUrl}videos/?${constructVideoQueryString(query)}`,
      (response) => {
        let data = "";
        response.on("data", (fragments) => {
          data += fragments;
        });

        response.on("end", () => {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        });

        response.on("error", (error) => {
          reject(error);
        });
      }
    );
  });
};

const getResorce = async (fileUrl) => {
  console.log("file  ", fileUrl);
  return new Promise((resolve, reject) => {
    https
      .get(fileUrl, (response) => {
        if (response.statusCode !== 200) {
          console.error(`Error: ${response.statusCode}`);
          return;
        }

        // Create a buffer to store the file data
        const buffers = [];

        // Read the response data
        response.on("data", (chunk) => {
          buffers.push(chunk);
        });

        // File download is complete
        response.on("end", () => {
          // Concatenate all the chunks into a single buffer
          const fileBuffer = Buffer.concat(buffers);
          resolve(fileBuffer);
        });
      })
      .on("error", (error) => {
        console.log(`Error: ${error}`);
        console.error(`Error: ${error.message}`);
        reject(error);
      });
  });
};

export { getImage, getVideo, getResorce };
