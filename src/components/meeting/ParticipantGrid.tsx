import React, { useEffect, useRef, useMemo } from 'react';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useAuth } from '../../hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { MicOff, VideoOff } from 'lucide-react';

export const ParticipantGrid: React.FC = () => {
  const { participants, localStream, isVideoEnabled, isAudioEnabled } = useWebRTC();
  const { authState } = useAuth();
  
  // Calculate grid layout
  const getGridClass = () => {
    const count = participants.length + 1; // +1 for local user
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 9) return 'grid-cols-2 md:grid-cols-3';
    return 'grid-cols-3 md:grid-cols-4';
  };
  
  // Filter out the current user from remote participants to avoid duplication
  const filteredParticipants = participants.filter(
    participant => participant.id !== authState.user?.uid
  );
  
  // Log participants for debugging
  useEffect(() => {
    console.log('ParticipantGrid rendering with participants:', 
      filteredParticipants.map(p => ({
        id: p.id,
        name: p.displayName,
        hasStream: !!p.stream,
        videoTracks: p.stream?.getVideoTracks().length || 0,
        audioTracks: p.stream?.getAudioTracks().length || 0,
        videoEnabled: p.videoEnabled,
        audioEnabled: p.audioEnabled
      }))
    );
  }, [filteredParticipants]);
  
  return (
    <div className={`grid ${getGridClass()} gap-4 p-4 h-full`}>
      {/* Local participant */}
      <LocalParticipant 
        stream={localStream} 
        displayName={authState.user?.displayName || 'You'} 
        photoURL={authState.user?.photoURL || null}
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
      />
      
      {/* Remote participants - now filtered to exclude current user */}
      {filteredParticipants.map(participant => (
        <RemoteParticipant 
          key={participant.id}
          participant={participant}
        />
      ))}
    </div>
  );
};

interface LocalParticipantProps {
  stream: MediaStream | null;
  displayName: string;
  photoURL: string | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

const LocalParticipant: React.FC<LocalParticipantProps> = ({ 
  stream, 
  displayName, 
  photoURL,
  isVideoEnabled,
  isAudioEnabled
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  
  // Log local stream status for debugging
  useEffect(() => {
    if (stream) {
      console.log('Local stream status:', {
        videoTracks: stream.getVideoTracks().map(t => ({
          enabled: t.enabled,
          muted: t.muted,
          id: t.id
        })),
        audioTracks: stream.getAudioTracks().map(t => ({
          enabled: t.enabled,
          muted: t.muted,
          id: t.id
        }))
      });
    }
  }, [stream, isVideoEnabled, isAudioEnabled]);
  
  return (
    <div className="relative bg-muted rounded-lg overflow-hidden aspect-video flex items-center justify-center">
      {isVideoEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full w-full bg-gray-800">
          {photoURL ? (
            <Avatar className="h-24 w-24">
              <AvatarImage src={photoURL} alt={displayName} />
              <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-24 w-24 bg-primary/10">
              <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          <p className="mt-2 text-white font-medium">{displayName}</p>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white flex items-center justify-between">
        <span className="text-sm font-medium">{displayName} (You)</span>
        <div className="flex space-x-2">
          {!isAudioEnabled && <MicOff className="h-4 w-4 text-red-500" />}
          {!isVideoEnabled && <VideoOff className="h-4 w-4 text-red-500" />}
        </div>
      </div>
    </div>
  );
};

interface RemoteParticipantProps {
  participant: {
    id: string;
    displayName: string | null;
    stream: MediaStream | null;
    audioEnabled: boolean;
    videoEnabled: boolean;
    photoURL?: string | null;
  };
}

const RemoteParticipant: React.FC<RemoteParticipantProps> = ({ participant }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // More aggressive approach to setting up the video stream
  useEffect(() => {
    if (videoRef.current && participant.stream) {
      console.log(`Setting remote stream for participant ${participant.id}:`, {
        videoTracks: participant.stream.getVideoTracks().length,
        audioTracks: participant.stream.getAudioTracks().length,
        videoEnabled: participant.videoEnabled,
        audioEnabled: participant.audioEnabled
      });
      
      // Ensure we're working with a clean element
      if (videoRef.current.srcObject !== participant.stream) {
        videoRef.current.srcObject = null;
        videoRef.current.srcObject = participant.stream;
        
        // Force play the video with retry logic
        const attemptPlay = async () => {
          try {
            if (videoRef.current) {
              await videoRef.current.play();
              console.log(`Successfully playing video for ${participant.id}`);
            }
          } catch (err) {
            console.error(`Error playing video for ${participant.id}:`, err);
            
            // Set up a retry mechanism
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.play().catch(e => {
                  console.error(`Retry failed for ${participant.id}:`, e);
                  
                  // Last resort - try on user interaction
                  document.addEventListener('click', () => {
                    if (videoRef.current) {
                      videoRef.current.play().catch(finalErr => 
                        console.error(`Final attempt failed for ${participant.id}:`, finalErr)
                      );
                    }
                  }, { once: true });
                });
              }
            }, 1000);
          }
        };
        
        attemptPlay();
      }
    }
  }, [participant.stream, participant.id, participant.videoEnabled]);
  
  // Improved check for video tracks and enabled state
  const hasVideoTracks = useMemo(() => {
    return !!participant.stream && 
           participant.stream.getVideoTracks().length > 0 && 
           participant.videoEnabled;
  }, [participant.stream, participant.videoEnabled]);
  
  // Debug the stream status
  useEffect(() => {
    if (participant.stream) {
      console.log(`Remote participant ${participant.id} stream:`, {
        videoTracks: participant.stream.getVideoTracks().map(t => ({
          enabled: t.enabled,
          muted: t.muted,
          id: t.id
        })),
        audioTracks: participant.stream.getAudioTracks().map(t => ({
          enabled: t.enabled,
          muted: t.muted,
          id: t.id
        })),
        videoEnabled: participant.videoEnabled,
        audioEnabled: participant.audioEnabled
      });
    }
  }, [participant.stream, participant.id, participant.videoEnabled, participant.audioEnabled]);
  
  return (
    <div className="relative bg-muted rounded-lg overflow-hidden aspect-video flex items-center justify-center">
      {hasVideoTracks ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full w-full bg-gray-800">
          {participant.photoURL ? (
            <Avatar className="h-24 w-24">
              <AvatarImage src={participant.photoURL} alt={participant.displayName || 'Participant'} />
              <AvatarFallback>
                {(participant.displayName || 'User').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-24 w-24 bg-primary/10">
              <AvatarFallback>
                {(participant.displayName || 'User').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <p className="mt-2 text-white font-medium">{participant.displayName || 'Guest'}</p>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white flex items-center justify-between">
        <span className="text-sm font-medium">{participant.displayName || 'Guest'}</span>
        <div className="flex space-x-2">
          {!participant.audioEnabled && <MicOff className="h-4 w-4 text-red-500" />}
          {!participant.videoEnabled && <VideoOff className="h-4 w-4 text-red-500" />}
        </div>
      </div>
    </div>
  );
};