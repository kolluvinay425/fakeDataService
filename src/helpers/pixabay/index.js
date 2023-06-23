import https from "https";
import querystring from "querystring";

const pixabayUserKey = process.env.PIXABAY_USER_KEY;
const pixabayUrl = "https://pixabay.com/api/";

const constructQueryString = (query) => {
  let queryObject = {
    key: process.env.PIXABAY_USER_KEY,
    q: query.split(" ").join("+"),
    image_type: "photo",
    orientation: "horizontal",
    per_page: 3,
  };

  return querystring.stringify(queryObject);
};

const getImage = async (query) => {
  return new Promise((resolve, reject) => {
    console.log(constructQueryString(query));
    https.get(`${pixabayUrl}?${constructQueryString(query)}`, (response) => {
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
    });
  });
};

export default getImage;
