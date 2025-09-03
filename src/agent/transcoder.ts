/**
 *
 * Thanks Wes Bos!
 *
 * @see https://github.com/wesbos/R2-video-streaming/blob/main/transcode.ts
 */

import { mkdir, writeFile } from "node:fs/promises";
import ffmpeg from "fluent-ffmpeg";
import { basename, extname } from "node:path";
import {
  getResolution,
  getDuration,
  getVideoOrientation,
  VideoOrientation,
} from "./utils";

type Preset = {
  resolution: number;
  bitrate: number;
};

const PRESETS: Preset[] = [
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

async function generateThumbnail(
  input: URL,
  outputFolder: URL,
  videoId: string
): Promise<void> {
  const output_folder = new URL(`${outputFolder}/${videoId}`);
  const thumbnail_path = `${output_folder}/thumbnail.jpeg`;

  console.log(`Generating thumbnail: ${thumbnail_path}`);

  await mkdir(output_folder, { recursive: true });

  const { promise, resolve, reject } = Promise.withResolvers<void>();

  // Get source video dimensions and duration
  const [sourceWidth, sourceHeight] = await getResolution(
    decodeURI(input.pathname)
  );
  const duration = await getDuration(decodeURI(input.pathname));

  // Calculate thumbnail dimensions while preserving aspect ratio and capping at 1080p
  let width = sourceWidth;
  let height = sourceHeight;

  // Scale down if either dimension exceeds 1080p while maintaining aspect ratio
  if (width > 1920 || height > 1080) {
    const scaleX = 1920 / width;
    const scaleY = 1080 / height;
    const scale = Math.min(scaleX, scaleY);

    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  // Calculate the middle point of the video for thumbnail generation
  const middleTime = Math.max(1, Math.floor(duration / 2));

  // Format timestamp to handle any duration (HH:MM:SS)
  const hours = Math.floor(middleTime / 3600);
  const minutes = Math.floor((middleTime % 3600) / 60);
  const seconds = middleTime % 60;

  const middleTimeFormatted = `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  console.log(
    `Thumbnail dimensions: ${width}x${height} (source: ${sourceWidth}x${sourceHeight})`
  );
  console.log(
    `Video duration: ${duration}s, thumbnail at: ${middleTimeFormatted}`
  );

  ffmpeg(decodeURI(input.pathname))
    .outputOptions([
      "-vframes",
      "1", // Extract only 1 frame
      "-ss",
      middleTimeFormatted,
      "-filter:v",
      `scale=${width}:${height}`, // Scale to calculated dimensions
      "-q:v",
      "2", // High quality JPEG
      "-strict",
      "unofficial", // Allow non-standard YUV ranges for MJPEG encoding
    ])
    .output(thumbnail_path)
    .on("start", () => {
      console.log("Thumbnail generation started");
    })
    .on("end", () => {
      console.log("Thumbnail generation completed");
      resolve();
    })
    .on("error", (err, stdout, stderr) => {
      console.error("Thumbnail generation error");
      console.error(err);
      console.error(stderr);
      reject(err);
    })
    .run();

  return promise;
}

async function transcode(
  input: URL,
  preset: Preset,
  orientation: VideoOrientation,
  outputFolder: URL,
  videoId: string
): Promise<TranscodeResult> {
  const input_extension = extname(input.pathname);
  const input_filename = decodeURI(basename(input.pathname, input_extension));
  const output_folder = new URL(`${outputFolder}/${videoId}`);
  const m3u8_path = `${output_folder}/${preset.resolution}p.m3u8`;
  console.log(
    `transcoding ${input.pathname} to ${preset.resolution}p (${orientation})`
  );
  await mkdir(output_folder, { recursive: true });
  const { promise, resolve, reject } = Promise.withResolvers<TranscodeResult>();

  const scaleFilter =
    orientation === "vertical"
      ? `scale=${preset.resolution}:-2` // For vertical videos, scale by width
      : `scale=-2:${preset.resolution}`; // For horizontal videos, scale by height

  ffmpeg(decodeURI(input.pathname))
    // .videoCodec('h264_videotoolbox')
    .videoCodec("libx264")
    .audioCodec("aac")
    .videoBitrate(`${preset.bitrate}k`)
    .audioBitrate("128k")
    .outputOptions([
      "-filter:v",
      scaleFilter,
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
      "-pix_fmt",
      "yuv420p",
      "-hls_time",
      "4",
      "-hls_playlist_type",
      "vod",
      "-hls_segment_filename",
      `${output_folder}/${preset.resolution}_%03d.ts`,
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

export async function processPresets(
  input: URL,
  videoId: string,
  outputFolder: URL,
  onChange?: (message: string) => void
) {
  console.time("process_presets");
  onChange?.("Starting transcoding");

  // Ensure the base output directory exists
  await mkdir(outputFolder.pathname, { recursive: true });

  const [input_width, input_height] = await getResolution(
    decodeURI(input.pathname)
  );
  const orientation = await getVideoOrientation(input);

  // Determine the relevant resolution based on orientation
  const input_resolution =
    orientation === "vertical" ? input_width : input_height;

  const relevant_presets = PRESETS.filter(
    (preset) => preset.resolution <= input_resolution
  );
  console.log(
    `Processing ${relevant_presets.length} relevant presets out of ${PRESETS.length} total presets for ${orientation} video`
  );

  const results: TranscodeResult[] = [];
  for (const [i, preset] of relevant_presets.entries()) {
    onChange?.(
      `Transcoding ${preset.resolution}p (${i + 1} of ${
        relevant_presets.length
      })`
    );
    console.timeLog("process_presets", `transcoding ${preset.resolution}p`);
    const transcode_result = await transcode(
      input,
      preset,
      orientation,
      outputFolder,
      videoId
    );
    console.log(transcode_result);
    results.push(transcode_result);
  }

  const playlist = await generatePlaylist(results);
  onChange?.("Transcoding complete");

  // Ensure the video-specific output directory exists before writing playlist
  const videoOutputDir = `${outputFolder.pathname}/${videoId}`;
  await mkdir(videoOutputDir, { recursive: true });

  await writeFile(`${videoOutputDir}/playlist.m3u8`, playlist);

  // Generate thumbnail after transcoding is complete
  onChange?.("Generating thumbnail");
  await generateThumbnail(input, outputFolder, videoId);
  onChange?.("Thumbnail generation complete");

  console.timeEnd("process_presets");
}
