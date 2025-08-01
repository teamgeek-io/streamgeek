import ffmpeg from "fluent-ffmpeg";

type Resolution = [width: number, height: number];
export async function getResolution(input: string): Promise<Resolution> {
  const { promise, resolve, reject } = Promise.withResolvers<Resolution>();
  ffmpeg.ffprobe(input, (err, metadata) => {
    if (err) {
      reject(err);
    } else {
      const video_stream = metadata.streams.find(
        (stream) => stream.codec_type === "video"
      );
      resolve([video_stream!.width as number, video_stream!.height as number]);
    }
  });
  return promise;
}
