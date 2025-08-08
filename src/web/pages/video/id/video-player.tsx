"use client";

import HlsVideoElement from "hls-video-element/react";
import { Video } from "../../../../db";

export const VideoPlayer = ({ video }: { video: Video }) => {
  return (
    <HlsVideoElement
      src={video.playlistUrl!}
      // className="absolute top-0 right-0 left-0"
      // slot="media"
      // suppressHydrationWarning
      autoplay
      muted
      loop
    />
  );
};
