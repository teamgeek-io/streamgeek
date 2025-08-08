"use client";

import HlsVideoElement from "hls-video-element/react";
import { Video } from "../../../../db";
import {
  MediaControlBar,
  MediaController,
  MediaFullscreenButton,
  MediaLoadingIndicator,
  MediaMuteButton,
  MediaPlaybackRateButton,
  MediaPlayButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
} from "media-chrome/react";

export const VideoPlayer = ({
  video,
  className,
}: {
  video: Video;
  className?: string;
}) => {
  return (
    <MediaController className={className}>
      <HlsVideoElement
        src={video.playlistUrl!}
        slot="media"
        preload="auto"
        suppressHydrationWarning
      />
      <MediaControlBar>
        <MediaPlayButton></MediaPlayButton>
        <MediaSeekBackwardButton></MediaSeekBackwardButton>
        <MediaSeekForwardButton></MediaSeekForwardButton>
        <MediaTimeRange></MediaTimeRange>
        <MediaTimeDisplay showDuration remaining></MediaTimeDisplay>
        <MediaMuteButton></MediaMuteButton>
        <MediaVolumeRange></MediaVolumeRange>

        <MediaFullscreenButton></MediaFullscreenButton>
        <MediaPlaybackRateButton></MediaPlaybackRateButton>
      </MediaControlBar>
      <MediaLoadingIndicator
        slot="centered-chrome"
        noAutohide
      ></MediaLoadingIndicator>
    </MediaController>
  );
};
