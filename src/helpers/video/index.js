import ffmpeg from "fluent-ffmpeg";
import { Readable } from "stream";

const getVideoMeta = async (input) => {
  const stream = new Readable.from(input);
  const inputStream = ffmpeg().input(stream);
  return new Promise((resolve, reject) => {
    inputStream.ffprobe((err, metadata) => {
      if (err) {
        reject(err);
      }

      const checkResponse = {
        hasAudio: false,
        hasVideo: false,
        video: {
          height: 0,
          width: 0,
          diplayAspectRatio: 0,
        },
      };

      metadata.streams.forEach((stream) => {
        if (stream.codec_type === "audio") {
          checkResponse.hasAudio = true;
        }

        if (stream.codec_type === "video") {
          checkResponse.hasVideo = true;
          checkResponse.video.height = stream.height;
          checkResponse.video.width = stream.width;
          checkResponse.video.diplayAspectRatio = stream.display_aspect_ratio;
        }
      });

      resolve(checkResponse);
    });
  });
};

export default getVideoMeta;
