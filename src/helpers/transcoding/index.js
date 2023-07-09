import { TranscoderServiceClient } from "@google-cloud/video-transcoder";

var transcoderServiceClient = new TranscoderServiceClient();

const TranscodingEnum = {
  FULL_HD: {
    elementaryStream: {
      key: "video-streamFHD",
      videoStream: {
        h264: {
          heightPixels: 1080,
          widthPixels: 1920,
          bitrateBps: 8000000,
          frameRate: 60,
        },
      },
    },

    muxStream: {
      key: "pippo_480p",
      container: "mp4",
      elementaryStreams: ["video-streamFHD", "audio-stream0"],
    },
  },
  HD: {
    elementaryStream: {
      key: "video-streamHD",
      videoStream: {
        h264: {
          heightPixels: 720,
          widthPixels: 1280,
          bitrateBps: 5000000,
          frameRate: 60,
        },
      },
    },
    muxStream: {
      key: "_720p",
      container: "mp4",
      elementaryStreams: ["video-streamHD", "audio-stream0"],
    },
  },
};

const videoTranscoding = (inputUri, outputUri, trasformers) => {
  // Construct request

  const elementaryStreams = [];
  const muxStreams = [];

  trasformers.array.forEach((element) => {
    elementaryStreams.push(element.elementaryStream);
    muxStreams.push(element.muxStream);
  });

  elementaryStreams.push({
    key: "audio-stream0",
    audioStream: {
      codec: "aac",
      bitrateBps: 64000,
    },
  });

  const request = {
    parent: transcoderServiceClient.locationPath(
      process.env.GOOGLE_PROJECT_ID,
      "europe-west-1"
    ),
    job: {
      inputUri: inputUri,
      outputUri: outputUri,
      config: {
        elementaryStreams: elementaryStreams,
        muxStreams: muxStreams,
      },
    },
  };

  console.log(JSON.stringify(request, null, 2));

  return new Promise(async (resolve) => {
    console.log(request);

    const [IJob, ICreateJobRequest, result] =
      await transcoderServiceClient.createJob(request);
    resolve(result);
  });
};

const videoToSpriteSheet = (inputUri, outputUri, id) => {
  const request = {
    parent: transcoderServiceClient.locationPath(
      process.env.GOOGLE_PROJECT_ID,
      "europe-west1"
    ),
    job: {
      inputUri: inputUri,
      outputUri: outputUri,
      config: {
        elementaryStreams: [
          {
            key: "video-streamHD",
            videoStream: {
              h264: {
                heightPixels: 720,
                widthPixels: 1280,
                bitrateBps: 5000000,
                frameRate: 60,
              },
            },
          },
        ],
        muxStreams: [
          {
            key: "_720p",
            container: "mp4",
            elementaryStreams: ["video-streamHD"],
          },
        ],
        spriteSheets: [
          {
            filePrefix: `${id}_large-sprite-sheet`,
            spriteHeightPixels: 72,
            spriteWidthPixels: 128,
            columnCount: 10,
            rowCount: 10,
            totalCount: 100,
          },
        ],
      },
    },
  };

  return new Promise(async (resolve) => {
    console.log(request);

    const [IJob, ICreateJobRequest, result] =
      await transcoderServiceClient.createJob(request);
    resolve(result);
  });
};

export { videoTranscoding, TranscodingEnum, videoToSpriteSheet };
