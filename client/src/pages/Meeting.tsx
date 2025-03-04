// src/pages/Meeting.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { io, Socket } from "socket.io-client";

import VideoPlayer from "../components/VideoPlayer";
import CallControls from "../components/CallControls";

const socket: Socket = io("http://localhost:5000");

type Participant = {
  id: string;
  stream: MediaStream | null;
  isRequesting?: boolean;
};

const Meeting = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [muted, setMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!id) return;

    const initConnection = (localStream: MediaStream) => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      setPeerConnection(pc);

      localStream
        .getTracks()
        .forEach((track) => pc.addTrack(track, localStream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("candidate", { candidate: event.candidate, roomId: id });
        }
      };

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        const participantId = event.track.id;

        setParticipants((prev) => [
          ...prev.filter((p) => p.id !== participantId),
          { id: participantId, stream: remoteStream },
        ]);
      };

      socket.on("candidate", async ({ candidate }) => {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      });
    };

    const startCall = async () => {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStream(mediaStream);

      socket.emit("request-join", { roomId: id, userId: socket.id });

      socket.on("approve-join", () => initConnection(mediaStream));

      if (!sessionStorage.getItem("admin")) {
        setIsAdmin(true);
        sessionStorage.setItem("admin", "true");
      }
    };

    startCall();

    return () => {
      socket.emit("leave", id);
      stream?.getTracks().forEach((track) => track.stop());
      peerConnection?.close();
      socket.removeAllListeners();
    };
  }, [id, stream]);

  const handleEndCall = () => {
    stream?.getTracks().forEach((track) => track.stop());
    peerConnection?.close();
    navigate("/");
  };

  const handleApprove = (userId: string) => {
    socket.emit("approve-join", { roomId: id, userId });
  };

  const handleReject = (userId: string) => {
    socket.emit("reject-join", { roomId: id, userId });
  };

  return (
    <motion.div className="flex flex-col items-center min-h-screen p-8 bg-gray-100 text-gray-800">
      <h1 className="text-4xl font-semibold mb-8">
        {id ? `Meeting ID: ${id}` : "Meeting ID Not Found"}
      </h1>

      <div className="flex gap-4 flex-wrap">
        <VideoPlayer
          stream={stream}
          muted={muted}
          videoEnabled={videoEnabled}
        />
        {participants.map((p) => (
          <VideoPlayer
            key={p.id}
            stream={p.stream}
            muted={false}
            videoEnabled={true}
          />
        ))}
      </div>

      {isAdmin && (
        <div className="mt-4">
          <h2 className="text-2xl font-bold mb-2">Participant Requests</h2>
          {participants.map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <span>{p.id}</span>
              <button
                onClick={() => handleApprove(p.id)}
                className="bg-green-500 px-2 py-1 rounded"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(p.id)}
                className="bg-red-500 px-2 py-1 rounded"
              >
                Reject
              </button>
            </div>
          ))}
        </div>
      )}

      <CallControls
        onEndCall={handleEndCall}
        onToggleMute={() => setMuted(!muted)}
        onToggleVideo={() => setVideoEnabled(!videoEnabled)}
        muted={muted}
        videoEnabled={videoEnabled}
      />
    </motion.div>
  );
};

export default Meeting;
