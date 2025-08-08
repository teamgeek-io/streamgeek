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

export const VideoPlayer = ({ video }: { video: Video }) => {
  return (
    <MediaController>
      <HlsVideoElement
        src={video.playlistUrl!}
        // className="absolute top-0 right-0 left-0"
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
