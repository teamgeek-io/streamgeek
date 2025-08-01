/**
 *
 * Thanks Wes Bos!
 *
 * @see https://github.com/wesbos/R2-video-streaming/blob/main/transcode.ts
 */

import { mkdir, writeFile } from "node:fs/promises";
import ffmpeg from "fluent-ffmpeg";
import { basename, extname } from "node:path";
import { getResolution } from "./utils";

type Preset = {
  resolution: number;
  bitrate: number;
};

const presets: Preset[] = [
  { resolution: 2160, bitrate: 15000 },
  { resolution: 1440, bitrate: 10000 },
  { resolution: 1080, bitrate: 8000 },
  { resolution: 720, bitrate: 5000 },
  { resolution: 480, bitrate: 2500 },
  { resolution: 360, bitrate: 1000 },
];

async function generatePlaylist(transcode_results: TranscodeResult[]) {
  const playlist = [`#EXTM3U`, `#EXT-X-VERSION:3`];
  for (const result of transcode_results) {
    console.log(
      `generating ${result.height}p playlist. Path: ${result.m3u8_path}`
    );
    playlist.push(
      `#EXT-X-STREAM-INF:BANDWIDTH=${result.bitrate * 1000},RESOLUTION=${
        result.width
      }x${result.height}`
    );
    playlist.push(result.m3u8_filename);
  }
  return playlist.join("\n");
}

type TranscodeResult = {
  width: number;
  height: number;
  m3u8_path: string;
  m3u8_filename: string;
  bitrate: number;
};

async function transcode(input: URL, preset: Preset): Promise<TranscodeResult> {
  const input_extension = extname(input.pathname);
  const input_filename = decodeURI(basename(input.pathname, input_extension));
  const output_folder = new URL(
    `file://${process.cwd()}/output/${input_filename}`
  );
  const m3u8_path = `${output_folder}/${input_filename}_${preset.resolution}p.m3u8`;
  console.log({ input_filename, output_folder });
  console.log(`transcoding ${input.pathname} to ${preset.resolution}p`);
  await mkdir(output_folder, { recursive: true });
  const { promise, resolve, reject } = Promise.withResolvers<TranscodeResult>();
  ffmpeg(decodeURI(input.pathname))
    // .videoCodec('h264_videotoolbox')
    .videoCodec("libx264")
    .audioCodec("aac")
    .videoBitrate(`${preset.bitrate}k`)
    .audioBitrate("128k")
    .outputOptions([
      "-filter:v",
      `scale=-2:${preset.resolution}`,
      "-preset",
      "veryfast",
      "-crf",
      "20",
      "-g",
      "48",
      "-keyint_min",
      "48",
      "-sc_threshold",
      "0",
      "-hls_time",
      "4",
      "-hls_playlist_type",
      "vod",
      "-hls_segment_filename",
      `${output_folder}/${input_filename}_${preset.resolution}_%03d.ts`,
    ])
    .output(m3u8_path)
    .on("start", (cmdline) => {
      console.log(`${preset.resolution}p start`);
      // console.log(cmdline)
    })
    .on("codecData", function (data) {
      console.log(
        "Input is " + data.audio + " audio " + "with " + data.video + " video"
      );
    })
    .on("end", async () => {
      console.log(`${preset.resolution}p done`);
      const [width, height] = await getResolution(m3u8_path);
      // Get just the filename from the path
      const m3u8_filename = basename(m3u8_path);
      resolve({
        width,
        height,
        m3u8_path,
        m3u8_filename,
        bitrate: preset.bitrate,
      });
    })
    .on("error", (err, stdout, stderr) => {
      console.error(`${preset.resolution}p error`);
      console.error(err);
      // console.error(stdout);
      console.error(stderr);
      reject(err);
    })
    .run();

  return promise;
}

export async function processPresets(input: URL) {
  console.time("process_presets");
  const input_extension = extname(input.pathname);
  const input_filename = decodeURI(basename(input.pathname, input_extension));
  const results: TranscodeResult[] = [];
  for (const preset of presets) {
    console.timeLog("process_presets", `transcoding ${preset.resolution}p`);
    const transcode_result = await transcode(input, preset);
    console.log(transcode_result);
    results.push(transcode_result);
  }
  const playlist = await generatePlaylist(results);
  await writeFile(`./output/${input_filename}/master.m3u8`, playlist);
  console.timeEnd("process_presets");
}
