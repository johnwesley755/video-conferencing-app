export interface Participant {
  id: string;
  displayName: string | null;
  stream: MediaStream | null;
  audioEnabled: boolean;
  videoEnabled: boolean;
  photoURL?: string | null; // Add photoURL property
}

export interface Meeting {
  id: string;
  hostId: string;
  title: string;
  description?: string;
  startTime: Date;
  participants: string[];
  isActive: boolean;
}

export interface WebRTCState {
  participants: Participant[];
  localStream: MediaStream | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  meetingId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface SignalData {
  type: string;
  sdp?: string;
  candidate?: RTCIceCandidate;
}

export interface PeerConnection {
  peerId: string;
  peerConnection: RTCPeerConnection;
}