import React, { useRef, useEffect } from 'react';
import { MicOff, VideoOff } from 'lucide-react';
import { Participant as ParticipantType } from '../../types/webrtc.types';

interface ParticipantProps {
  participant: ParticipantType;
  isLocal?: boolean;
}

export const Participant: React.FC<ParticipantProps> = ({ 
  participant, 
  isLocal = false 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);
  
  return (
    <div className="video-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal || !participant.audioEnabled}
      />
      
      <div className="absolute bottom-2 left-2 flex items-center space-x-1 bg-black/50 rounded-md px-2 py-1 text-white text-sm">
        <span>{isLocal ? 'You' : participant.displayName}</span>
        {!participant.audioEnabled && <MicOff className="h-3 w-3 ml-1" />}
        {!participant.videoEnabled && <VideoOff className="h-3 w-3 ml-1" />}
      </div>
    </div>
  );
};