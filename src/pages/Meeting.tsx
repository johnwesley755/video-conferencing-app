import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWebRTC } from "../hooks/useWebRTC";
import { useAuth } from "../hooks/useAuth";
import { MeetingControls } from "../components/meeting/MeetingControls";
import { ParticipantGrid } from "../components/meeting/ParticipantGrid";
import { Chat } from "../components/meeting/Chat";
import { Button } from "../components/ui/button";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

export const Meeting: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const { joinMeeting, isLoading, error, participants } = useWebRTC();
  const { authState } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [meetingExists, setMeetingExists] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const hasAttemptedJoin = useRef(false);
  const navigate = useNavigate();

  // New state for pre-join screen
  const [showPreJoinScreen, setShowPreJoinScreen] = useState(true);
  const [enableAudio, setEnableAudio] = useState(true);
  const [enableVideo, setEnableVideo] = useState(true);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  // Effect to get preview stream for camera
  useEffect(() => {
    if (showPreJoinScreen && enableVideo) {
      const getPreviewStream = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          setPreviewStream(stream);

          if (videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = stream;
          }
        } catch {
          // Silently handle the error - don't log to console
          setEnableVideo(false);
        }
      };

      getPreviewStream();

      return () => {
        if (previewStream) {
          previewStream.getTracks().forEach((track) => track.stop());
        }
      };
    }
  }, [showPreJoinScreen, enableVideo, previewStream]);

  // Add debugging effect for WebRTC connections - MOVED UP before any conditional returns
  useEffect(() => {
    // Debug WebRTC connections
    const debugInterval = setInterval(() => {
      console.log("Current participants:", participants.length);

      participants.forEach((p) => {
        console.log(`Participant ${p.id}:`, {
          hasStream: !!p.stream,
          videoTracks: p.stream?.getVideoTracks().length || 0,
          audioTracks: p.stream?.getAudioTracks().length || 0,
          videoEnabled: p.videoEnabled,
          audioEnabled: p.audioEnabled,
        });
      });
    }, 10000); // Every 10 seconds

    return () => clearInterval(debugInterval);
  }, [participants]);

  // Use useCallback to prevent infinite dependency loops
  const handleJoinMeeting = React.useCallback(async () => {
    if (!meetingId) return;

    setIsJoining(true);
    try {
      // Simply join the meeting without any media checks
      await joinMeeting(meetingId);
    } catch (error) {
      console.error("Error joining meeting:", error);
    } finally {
      setIsJoining(false);
    }
  }, [meetingId, joinMeeting]);

  useEffect(() => {
    const checkMeeting = async () => {
      if (!meetingId) {
        setMeetingExists(false);
        return;
      }

      try {
        // Query for the meeting using the 'id' field instead of document ID
        const meetingsRef = collection(db, "meetings");
        const q = query(meetingsRef, where("id", "==", meetingId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setMeetingExists(false);
        } else if (
          authState.user &&
          !hasAttemptedJoin.current &&
          !showPreJoinScreen
        ) {
          // Only attempt to join once to prevent loops and after pre-join screen
          hasAttemptedJoin.current = true;
          handleJoinMeeting();
        }
      } catch (error) {
        console.error("Error checking meeting:", error);
        setMeetingExists(false);
      }
    };

    checkMeeting();
  }, [meetingId, authState.user, showPreJoinScreen, handleJoinMeeting]);

  const handleJoinClick = () => {
    // Stop preview stream before joining
    if (previewStream) {
      previewStream.getTracks().forEach((track) => track.stop());
      setPreviewStream(null);
    }

    setShowPreJoinScreen(false);
  };

  if (!meetingExists) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Meeting Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The meeting you're trying to join doesn't exist or has ended.
        </p>
        <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
      </div>
    );
  }

  if (!authState.user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
        <p className="text-muted-foreground mb-6">
          Please sign in to join this meeting.
        </p>
        <Button onClick={() => navigate("/login")}>Sign In</Button>
      </div>
    );
  }

  if (showPreJoinScreen) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Join Meeting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Video preview */}
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              {enableVideo ? (
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <VideoOff className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Camera unavailable or in use
                  </p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {enableAudio ? (
                    <Mic className="h-5 w-5" />
                  ) : (
                    <MicOff className="h-5 w-5" />
                  )}
                  <Label htmlFor="audio-toggle">Microphone</Label>
                </div>
                <Switch
                  id="audio-toggle"
                  checked={enableAudio}
                  onCheckedChange={setEnableAudio}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {enableVideo ? (
                    <Video className="h-5 w-5" />
                  ) : (
                    <VideoOff className="h-5 w-5" />
                  )}
                  <Label htmlFor="video-toggle">Camera</Label>
                </div>
                <Switch
                  id="video-toggle"
                  checked={enableVideo}
                  onCheckedChange={setEnableVideo}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleJoinClick}>
              Join Now
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isLoading || isJoining) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Joining Meeting...</h1>
        <div className="loader-spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !error.includes("already in use")) {
    let errorMessage = error;
    let helpText = "Please try again or contact support.";

    // Provide more helpful messages for common errors
    if (error.includes("Permission denied") || error.includes("denied")) {
      errorMessage = "Permission Denied";
      helpText =
        "Please allow access to your camera and microphone to join the meeting.";
    } else if (error.includes("not found") || error.includes("NotFoundError")) {
      errorMessage = "Camera or Microphone Not Found";
      helpText =
        "Please make sure your camera and microphone are connected properly.";
    }

    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Error Joining Meeting</h1>
        <p className="text-destructive mb-2">{errorMessage}</p>
        <p className="text-muted-foreground mb-6">{helpText}</p>
        <div className="flex gap-4">
          <Button onClick={() => window.location.reload()}>Try Again</Button>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 relative">
        <ParticipantGrid />
        <Chat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
      <MeetingControls onToggleChat={() => setIsChatOpen(!isChatOpen)} />
    </div>
  );
};

export default Meeting;
