// src/components/CallControls.tsx
import React from "react";
import { motion } from "framer-motion";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
  FaUserPlus,
  FaCog,
} from "react-icons/fa";

type CallControlsProps = {
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  muted: boolean;
  videoEnabled: boolean;
};

const CallControls: React.FC<CallControlsProps> = ({
  onEndCall,
  onToggleMute,
  onToggleVideo,
  muted,
  videoEnabled,
}) => {
  return (
    <motion.div
      className="flex gap-4 p-4 rounded-md shadow-lg mt-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Mute/Unmute Button */}
      <button
        onClick={onToggleMute}
        className={`flex items-center justify-center w-12 h-12 rounded-full text-white focus:outline-none transition ${
          muted ? "bg-red-500" : "bg-green-500"
        }`}
        title={muted ? "Unmute" : "Mute"}
      >
        {muted ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
      </button>

      {/* Enable/Disable Video Button */}
      <button
        onClick={onToggleVideo}
        className={`flex items-center justify-center w-12 h-12 rounded-full text-white focus:outline-none transition ${
          videoEnabled ? "bg-green-500" : "bg-red-500"
        }`}
        title={videoEnabled ? "Disable Video" : "Enable Video"}
      >
        {videoEnabled ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
      </button>

      {/* End Call Button */}
      <button
        onClick={onEndCall}
        className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full text-white focus:outline-none transition hover:bg-red-600"
        title="End Call"
      >
        <FaPhoneSlash size={20} />
      </button>

      {/* Add Participant Button */}
      <button
        onClick={() => alert("Invite participant feature coming soon!")}
        className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full text-white focus:outline-none transition hover:bg-blue-600"
        title="Add Participant"
      >
        <FaUserPlus size={20} />
      </button>

      {/* Settings Button */}
      <button
        onClick={() => alert("Settings feature coming soon!")}
        className="flex items-center justify-center w-12 h-12 bg-gray-500 rounded-full text-white focus:outline-none transition hover:bg-gray-600"
        title="Settings"
      >
        <FaCog size={20} />
      </button>
    </motion.div>
  );
};

export default CallControls;
