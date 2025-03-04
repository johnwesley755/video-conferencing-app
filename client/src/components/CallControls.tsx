// src/components/CallControls.tsx
import React from "react";

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
    <div className="flex gap-4 mt-4">
      <button
        onClick={onToggleMute}
        className={`px-4 py-2 rounded ${muted ? "bg-red-500" : "bg-green-500"}`}
      >
        {muted ? "Unmute" : "Mute"}
      </button>

      <button
        onClick={onToggleVideo}
        className={`px-4 py-2 rounded ${
          videoEnabled ? "bg-green-500" : "bg-red-500"
        }`}
      >
        {videoEnabled ? "Disable Video" : "Enable Video"}
      </button>

      <button onClick={onEndCall} className="px-4 py-2 bg-gray-500 rounded">
        End Call
      </button>
    </div>
  );
};

export default CallControls;
