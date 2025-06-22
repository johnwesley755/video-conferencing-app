import React, { useEffect, useRef } from 'react';
import { Participant as ParticipantType } from '../../types/webrtc.types';
import { Avatar } from '../ui/avatar';
import { MicOff, VideoOff } from 'lucide-react';

interface ParticipantProps {
  participant: ParticipantType;
  isCurrentUser: boolean;
}

export const Participant: React.FC<ParticipantProps> = ({ participant, isCurrentUser }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (participant.stream && videoRef.current) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  // Check if we have video tracks and they're enabled
  const hasEnabledVideo = participant.stream && 
                          participant.stream.getVideoTracks().length > 0 && 
                          participant.videoEnabled;

  return (
    <div className="video-container relative">
      {hasEnabledVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isCurrentUser} // Only mute if it's the current user
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <div className="avatar-container">
          <Avatar className="w-24 h-24">
            <div className="flex h-full w-full items-center justify-center bg-muted">
              {participant.photoURL ? (
                <img src={participant.photoURL} alt={participant.displayName || 'User'} />
              ) : (
                <span className="text-2xl font-semibold">
                  {participant.displayName?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
          </Avatar>
        </div>
      )}
      
      <div className="participant-info">
        <span>{participant.displayName || 'Guest'} {isCurrentUser ? '(You)' : ''}</span>
      </div>
      
      <div className="participant-controls-status absolute top-2 right-2 flex gap-2">
        {!participant.audioEnabled && (
          <div className="control-indicator audio-off bg-destructive/80 rounded-full p-1.5">
            <MicOff className="h-4 w-4 text-white" />
          </div>
        )}
        {!participant.videoEnabled && (
          <div className="control-indicator video-off bg-destructive/80 rounded-full p-1.5">
            <VideoOff className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};