// src/components/VideoPlayer.tsx
import React, { useEffect, useRef } from "react";

type VideoPlayerProps = {
  stream: MediaStream | null;
  muted?: boolean;
  videoEnabled?: boolean;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  stream,
  muted = false,
  videoEnabled = true,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
    if (stream) {
      stream
        .getVideoTracks()
        .forEach((track) => (track.enabled = videoEnabled));
      stream.getAudioTracks().forEach((track) => (track.enabled = !muted));
    }
  }, [stream, videoEnabled, muted]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted={muted}
      className={`w-48 h-48 bg-black ${!videoEnabled ? "hidden" : ""}`}
    />
  );
};

export default VideoPlayer;
