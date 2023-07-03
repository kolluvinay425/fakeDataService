import * as followRedirect from "follow-redirects";

const https = followRedirect.https;

const getImageFromFreePik = async (query) => {
  var options = {
    method: "GET",
    hostname: "api.freepik.com",
    path: `/v1/resources?locale=en-GB&page=1&limit=2&order=latest&filters[license][freemium]=1&term=${query}`,
    headers: {
      "Accept-Language": "en-GB",
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Freepik-API-Key": "00000000-0000-0000-0000-000000000000",
    },
    maxRedirects: 20,
  };
  return new Promise((resolve, reject) => {
    var req = https.request(options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        console.log(body.toString());
      });

      res.on("error", function (error) {
        console.error(error);
      });
    });
  });
};

export default getImageFromFreePik;
