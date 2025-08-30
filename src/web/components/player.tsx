"use client";

import HlsVideoElement from "hls-video-element/react";
import { Video } from "../../db";
import {
  MediaPlayer,
  MediaPlayerVideo,
  MediaPlayerLoading,
  MediaPlayerError,
  MediaPlayerVolumeIndicator,
  MediaPlayerControls,
  MediaPlayerControlsOverlay,
  MediaPlayerSeek,
  MediaPlayerPlay,
  MediaPlayerSeekBackward,
  MediaPlayerSeekForward,
  MediaPlayerVolume,
  MediaPlayerTime,
  MediaPlayerSettings,
  MediaPlayerPiP,
  MediaPlayerFullscreen,
} from "@/web/components/ui/media-player";

export const VideoPlayer = ({
  video,
  className,
}: {
  video: Video;
  className?: string;
}) => {
  return (
    <MediaPlayer autoHide className={className}>
      <MediaPlayerVideo asChild>
        <HlsVideoElement
          src={video.playlistUrl!}
          preload="auto"
          suppressHydrationWarning
          className="w-full h-full my-auto mx-auto object-contain"
        />
      </MediaPlayerVideo>
      <MediaPlayerLoading />
      <MediaPlayerError />
      <MediaPlayerVolumeIndicator />
      <MediaPlayerControls className="flex-col items-start gap-2.5">
        <MediaPlayerControlsOverlay />
        <MediaPlayerSeek />
        <div className="flex w-full items-center gap-2">
          <div className="flex flex-1 items-center gap-2">
            <MediaPlayerPlay />
            <MediaPlayerSeekBackward className="hidden sm:block" />
            <MediaPlayerSeekForward className="hidden sm:block" />
            <MediaPlayerVolume expandable />
            <MediaPlayerTime />
          </div>
          <div className="flex items-center gap-2">
            <MediaPlayerSettings />
            <MediaPlayerPiP className="hidden sm:block" />
            <MediaPlayerFullscreen />
          </div>
        </div>
      </MediaPlayerControls>
    </MediaPlayer>
  );
};
