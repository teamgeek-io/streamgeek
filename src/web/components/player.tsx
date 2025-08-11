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
  MediaPlayerCaptions,
  MediaPlayerSettings,
  MediaPlayerPiP,
  MediaPlayerFullscreen,
} from "@/web/components/ui/media-player";
import HlsVideoElementType from "hls-video-element";
import React, { useEffect } from "react";

export const VideoPlayer = ({
  video,
  className,
}: {
  video: Video;
  className?: string;
}) => {
  const hlsRef = React.useRef<HlsVideoElementType>(null);

  useEffect(() => {
    if (hlsRef.current) {
      hlsRef.current.api?.levels.forEach((level) => {
        console.log(level);
      });
    }
  }, [hlsRef.current]);

  return (
    <MediaPlayer autoHide className={className}>
      <MediaPlayerVideo asChild>
        <HlsVideoElement
          src={video.playlistUrl!}
          // slot="media"
          preload="auto"
          suppressHydrationWarning
          ref={hlsRef}
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
            <MediaPlayerSeekBackward />
            <MediaPlayerSeekForward />
            <MediaPlayerVolume expandable />
            <MediaPlayerTime />
          </div>
          <div className="flex items-center gap-2">
            <MediaPlayerCaptions />
            <MediaPlayerSettings />
            <MediaPlayerPiP />
            <MediaPlayerFullscreen />
          </div>
        </div>
      </MediaPlayerControls>
    </MediaPlayer>
  );
};

//   return (
//     <MediaController className={className}>
//       <HlsVideoElement
//         src={video.playlistUrl!}
//         slot="media"
//         preload="auto"
//         suppressHydrationWarning
//       />
//       <MediaControlBar>
//         <MediaPlayButton></MediaPlayButton>
//         <MediaSeekBackwardButton></MediaSeekBackwardButton>
//         <MediaSeekForwardButton></MediaSeekForwardButton>
//         <MediaTimeRange></MediaTimeRange>
//         <MediaTimeDisplay showDuration remaining></MediaTimeDisplay>
//         <MediaMuteButton></MediaMuteButton>
//         <MediaVolumeRange></MediaVolumeRange>

//         <MediaFullscreenButton></MediaFullscreenButton>
//         <MediaPlaybackRateButton></MediaPlaybackRateButton>
//       </MediaControlBar>
//       <MediaLoadingIndicator
//         slot="centered-chrome"
//         noAutohide
//       ></MediaLoadingIndicator>
//     </MediaController>
//   );
// };
