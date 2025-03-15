import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebRTC } from '../../hooks/useWebRTC';
import { Button } from '../ui/button';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, MessageSquare } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface MeetingControlsProps {
  onToggleChat: () => void;
}

export const MeetingControls: React.FC<MeetingControlsProps> = ({ onToggleChat }) => {
  const { 
    toggleAudio, 
    toggleVideo, 
    leaveMeeting, 
    isAudioEnabled, 
    isVideoEnabled 
  } = useWebRTC();
  
  const navigate = useNavigate();
  
  const handleLeaveMeeting = () => {
    leaveMeeting();
    navigate('/dashboard');
  };
  
  return (
    <div className="controls-container">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full h-12 w-12 ${!isAudioEnabled ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}`}
              onClick={toggleAudio}
            >
              {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isAudioEnabled ? 'Mute' : 'Unmute'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full h-12 w-12 ${!isVideoEnabled ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}`}
              onClick={toggleVideo}
            >
              {isVideoEnabled ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={onToggleChat}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle chat</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={handleLeaveMeeting}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Leave meeting</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};