// src/components/VideoPlayer.tsx
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaMicrophoneSlash, FaVideoSlash } from "react-icons/fa";

type VideoPlayerProps = {
  stream: MediaStream | null;
  muted?: boolean;
  videoEnabled?: boolean;
  isLocal?: boolean;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  stream,
  muted = false,
  videoEnabled = true,
  isLocal = false,
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

    // Cleanup stream on unmount
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [stream, videoEnabled, muted]);

  return (
    <motion.div
      className="relative w-64 h-64 bg-gray-900 rounded-lg overflow-hidden shadow-md border border-gray-700"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {videoEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-contain bg-black"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-gray-800 text-gray-400">
          <FaVideoSlash size={48} />
        </div>
      )}

      {!videoEnabled && (
        <div className="absolute top-2 right-2 text-white bg-red-600 rounded-full p-1">
          <FaVideoSlash size={20} />
        </div>
      )}
      {muted && (
        <div className="absolute bottom-2 left-2 text-white bg-red-600 rounded-full p-1">
          <FaMicrophoneSlash size={20} />
        </div>
      )}

      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-transparent to-transparent p-2">
        <span className="text-sm text-white">
          {isLocal ? "You" : "Participant"}
        </span>
      </div>
    </motion.div>
  );
};

export default VideoPlayer;
