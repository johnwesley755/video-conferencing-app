import React, { useEffect, useState } from 'react';
import { useWebRTC } from '../../hooks/useWebRTC';
import { MicOff, VideoOff, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';

export const ParticipantGrid: React.FC = () => {
  const { participants, localStream, isAudioEnabled, isVideoEnabled } = useWebRTC();
  const { authState } = useAuth();
  const [gridLayout, setGridLayout] = useState('grid-cols-1');

  // Filter out any participant that might be the local user to avoid duplication
  const filteredParticipants = participants.filter(
    participant => participant.id !== authState?.user?.uid
  );

  // Determine grid layout based on number of participants
  useEffect(() => {
    const totalParticipants = filteredParticipants.length + 1; // +1 for local user
    
    if (totalParticipants === 1) {
      setGridLayout('grid-cols-1');
    } else if (totalParticipants === 2) {
      setGridLayout('grid-cols-1 md:grid-cols-2');
    } else if (totalParticipants <= 4) {
      setGridLayout('grid-cols-1 md:grid-cols-2');
    } else if (totalParticipants <= 9) {
      setGridLayout('grid-cols-1 sm:grid-cols-2 md:grid-cols-3');
    } else {
      setGridLayout('grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4');
    }
  }, [filteredParticipants.length]);

  return (
    <div className={cn('grid gap-2 p-2 h-full', gridLayout)}>
      {/* Local participant */}
      <div className="relative bg-muted rounded-lg overflow-hidden">
        <div className="absolute top-2 left-2 z-10 bg-black/50 text-white px-2 py-1 rounded-md text-sm">
          You
        </div>
        
        {localStream && localStream.getVideoTracks().length > 0 && isVideoEnabled ? (
          <video
            autoPlay
            playsInline
            muted
            ref={(video) => {
              if (video) video.srcObject = localStream;
            }}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
            {authState?.user?.photoURL ? (
              <img 
                src={authState.user.photoURL} 
                alt="Your profile" 
                className="h-24 w-24 rounded-full object-cover border-2 border-primary"
              />
            ) : (
              <User className="h-16 w-16 text-muted-foreground mb-2" />
            )}
            <span className="mt-2 text-sm text-muted-foreground">
              {authState?.user?.displayName || 'You'}
            </span>
          </div>
        )}
        
        {/* Status indicators */}
        <div className="absolute bottom-2 right-2 flex space-x-1">
          {!isAudioEnabled && (
            <div className="bg-black/50 p-1 rounded-full">
              <MicOff className="h-4 w-4 text-red-500" />
            </div>
          )}
          {!isVideoEnabled && (
            <div className="bg-black/50 p-1 rounded-full">
              <VideoOff className="h-4 w-4 text-red-500" />
            </div>
          )}
        </div>
      </div>

      {/* Remote participants */}
      {filteredParticipants.map((participant) => (
        <div key={participant.id} className="relative bg-muted rounded-lg overflow-hidden">
          <div className="absolute top-2 left-2 z-10 bg-black/50 text-white px-2 py-1 rounded-md text-sm">
            {participant.displayName || 'Guest'}
          </div>
          
          {participant.stream && participant.videoEnabled ? (
            <video
              autoPlay
              playsInline
              ref={(video) => {
                if (video && participant.stream) {
                  video.srcObject = participant.stream;
                }
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
              {participant.photoURL ? (
                <img 
                  src={participant.photoURL} 
                  alt={`${participant.displayName || 'Guest'}'s profile`} 
                  className="h-24 w-24 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <User className="h-16 w-16 text-muted-foreground mb-2" />
              )}
              <span className="mt-2 text-sm text-muted-foreground">
                {participant.displayName || 'Guest'}
              </span>
            </div>
          )}
          
          {/* Status indicators */}
          <div className="absolute bottom-2 right-2 flex space-x-1">
            {!participant.audioEnabled && (
              <div className="bg-black/50 p-1 rounded-full">
                <MicOff className="h-4 w-4 text-red-500" />
              </div>
            )}
            {!participant.videoEnabled && (
              <div className="bg-black/50 p-1 rounded-full">
                <VideoOff className="h-4 w-4 text-red-500" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};