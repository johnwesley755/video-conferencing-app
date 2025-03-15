import React, { createContext, useState, useEffect, useRef } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Participant } from '../types/webrtc.types';
import { useAuth } from '../hooks/useAuth';
import { showToast } from '../lib/toast-utils';

interface WebRTCContextProps {
  localStream: MediaStream | null;
  participants: Participant[];
  joinMeeting: (meetingId: string) => Promise<void>;
  leaveMeeting: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  meetingId: string | null;
  isLoading: boolean;
  error: string | null;
}

export const WebRTCContext = createContext<WebRTCContextProps>({
  localStream: null,
  participants: [],
  joinMeeting: async () => {},
  leaveMeeting: () => {},
  toggleAudio: () => {},
  toggleVideo: () => {},
  isAudioEnabled: true,
  isVideoEnabled: true,
  meetingId: null,
  isLoading: false,
  error: null,
});

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const WebRTCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState } = useAuth();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const peerConnections = useRef<Record<string, RTCPeerConnection>>({});
  const unsubscribeRefs = useRef<(() => void)[]>([]);

  useEffect(() => {
    return () => {
      // Clean up all peer connections and streams when component unmounts
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      Object.values(peerConnections.current).forEach(pc => pc.close());
      
      unsubscribeRefs.current.forEach(unsub => unsub());
    };
  }, []);

  const setupMediaStream = async () => {
    try {
      // Try to get both audio and video
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        
        setLocalStream(stream);
        
        // Set initial audio/video state
        stream.getAudioTracks().forEach(track => {
          track.enabled = isAudioEnabled;
        });
        
        stream.getVideoTracks().forEach(track => {
          track.enabled = isVideoEnabled;
        });
        
        return stream;
      } catch (initialErr) {
        console.warn("Could not get both audio and video, trying audio only:", initialErr);
        
        // Try with audio only
        try {
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });
          
          setLocalStream(audioOnlyStream);
          setIsVideoEnabled(false);
          
          // Set initial audio state
          audioOnlyStream.getAudioTracks().forEach(track => {
            track.enabled = isAudioEnabled;
          });
          
          return audioOnlyStream;
        } catch (audioErr) {
          console.warn("Could not get audio, trying video only:", audioErr);
          
          // Try with video only
          try {
            const videoOnlyStream = await navigator.mediaDevices.getUserMedia({
              audio: false,
              video: true,
            });
            
            setLocalStream(videoOnlyStream);
            setIsAudioEnabled(false);
            
            // Set initial video state
            videoOnlyStream.getVideoTracks().forEach(track => {
              track.enabled = isVideoEnabled;
            });
            
            return videoOnlyStream;
          } catch (videoErr) {
            // If all attempts fail, create an empty stream
            console.warn("Could not get any media devices, creating empty stream:", videoErr);
            const emptyStream = new MediaStream();
            setLocalStream(emptyStream);
            setIsAudioEnabled(false);
            setIsVideoEnabled(false);
            return emptyStream;
          }
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to access media devices: ${errorMessage}`);
      
      // Return an empty stream instead of throwing
      const emptyStream = new MediaStream();
      setLocalStream(emptyStream);
      setIsAudioEnabled(false);
      setIsVideoEnabled(false);
      return emptyStream;
    }
  };

  // Improved createPeerConnection function with better state handling
  const createPeerConnection = (participantId: string) => {
    // Check if connection already exists
    if (peerConnections.current[participantId]) {
      console.log(`Peer connection for ${participantId} already exists`);
      
      // Check if the connection is in a good state
      const existingPc = peerConnections.current[participantId];
      if (existingPc.connectionState === 'failed' || 
          existingPc.connectionState === 'closed' ||
          existingPc.iceConnectionState === 'failed' ||
          existingPc.iceConnectionState === 'disconnected') {
        
        console.log(`Existing connection for ${participantId} is in bad state (${existingPc.connectionState}/${existingPc.iceConnectionState}), recreating`);
        existingPc.close();
        delete peerConnections.current[participantId];
      } else {
        return existingPc;
      }
    }
    
    console.log(`Creating new peer connection for ${participantId}`);
    const peerConnection = new RTCPeerConnection(configuration);
    
    peerConnections.current[participantId] = peerConnection;
    
    // Add local tracks to the peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        try {
          peerConnection.addTrack(track, localStream);
        } catch (err) {
          console.warn('Error adding track to peer connection:', err);
        }
      });
    }
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && meetingId && authState.user) {
        const candidateRef = doc(
          collection(db, 'meetings', meetingId, 'candidates'),
          `${authState.user.uid}_to_${participantId}_${Date.now()}`
        );
        
        setDoc(candidateRef, {
          candidate: event.candidate.toJSON(),
          from: authState.user.uid,
          to: participantId,
          timestamp: new Date(),
        }, { merge: true });
      }
    };
    
    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state for ${participantId}: ${peerConnection.connectionState}`);
      
      if (peerConnection.connectionState === 'failed' || 
          peerConnection.connectionState === 'closed') {
        console.warn(`Connection to ${participantId} ${peerConnection.connectionState}`);
      }
    };
    
    // Handle ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      console.log(`ICE connection state for ${participantId}: ${peerConnection.iceConnectionState}`);
    };
    
    // Handle remote tracks
    peerConnection.ontrack = (event) => {
      console.log(`Received track from ${participantId}`, event.streams);
      
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        
        setParticipants(prev => {
          const existingParticipant = prev.find(p => p.id === participantId);
          
          if (existingParticipant) {
            return prev.map(p => 
              p.id === participantId ? { ...p, stream } : p
            );
          }
          
          return [...prev, {
            id: participantId,
            displayName: 'Unknown', // This will be updated when participant info is fetched
            stream,
            audioEnabled: true,
            videoEnabled: true,
          }];
        });
      }
    };
    
    return peerConnection;
  };

  // Improved function to handle offers
  const handleOffer = async (fromId: string, offer: RTCSessionDescriptionInit) => {
    try {
      // Get or create peer connection
      let pc: RTCPeerConnection | null = peerConnections.current[fromId];
      
      // If we have a connection in a bad state, close it and create a new one
      if (pc && (pc.signalingState === 'closed' || pc.connectionState === 'failed')) {
        pc.close();
        delete peerConnections.current[fromId];
        pc = null;
      }
      
      // Create new connection if needed
      if (!pc) {
        pc = createPeerConnection(fromId);
      }
      
      // Check if we can set the remote description
      if (pc.signalingState === 'stable' || pc.signalingState === 'have-local-offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        
        // Create and send answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        if (authState.user && meetingId) {
          await setDoc(
            doc(db, 'meetings', meetingId, 'answers', `${authState.user.uid}_to_${fromId}_${Date.now()}`),
            {
              answer: {
                type: answer.type,
                sdp: answer.sdp,
              },
              from: authState.user.uid,
              to: fromId,
              timestamp: new Date(),
            }
          );
        }
      } else {
        console.warn(`Cannot set remote offer in state: ${pc.signalingState}`);
      }
    } catch (err) {
      console.error('Error handling offer:', err);
    }
  };

  // Improved function to handle answers
  const handleAnswer = async (fromId: string, answer: RTCSessionDescriptionInit) => {
    try {
      const pc = peerConnections.current[fromId];
      
      if (!pc) {
        console.warn(`No peer connection for ${fromId} to handle answer`);
        return;
      }
      
      console.log(`Handling answer from ${fromId}, current state: ${pc.signalingState}`);
      
      // Only set remote description if we're in the right state
      if (pc.signalingState === 'have-local-offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log(`Successfully set remote description for ${fromId}`);
      } else if (pc.signalingState === 'have-remote-offer') {
        // We're in a state where we've received an offer but haven't sent an answer yet
        console.log(`Connection for ${fromId} is in have-remote-offer state, cannot process answer directly`);
        
        // Instead of trying to handle the answer now, we'll rollback and restart
        // This is a more reliable approach for handling signaling conflicts
        try {
          // Close the existing connection
          pc.close();
          delete peerConnections.current[fromId];
          
          // Determine which peer should initiate based on user IDs to prevent loops
          const shouldInitiate = authState.user && authState.user.uid < fromId;
          
          console.log(`Recreating connection for ${fromId}, shouldInitiate: ${shouldInitiate}`);
          
          // Wait a bit before recreating to avoid race conditions
          setTimeout(() => {
            if (authState.user && meetingId) {
              // Create a new connection
              const newPc = createPeerConnection(fromId);
              
              // Only the peer with the "smaller" ID should initiate
              if (shouldInitiate) {
                console.log(`Initiating new connection to ${fromId}`);
                newPc.createOffer().then(offer => {
                  newPc.setLocalDescription(offer).then(() => {
                    setDoc(
                      doc(db, 'meetings', meetingId, 'offers', `${authState.user!.uid}_to_${fromId}_${Date.now()}`),
                      {
                        offer: {
                          type: offer.type,
                          sdp: offer.sdp,
                        },
                        from: authState.user!.uid,
                        to: fromId,
                        timestamp: new Date(),
                      }
                    );
                  });
                });
              } else {
                console.log(`Waiting for offer from ${fromId}`);
              }
            }
          }, 2000 + Math.random() * 1000); // Add random delay to further reduce collision chance
        } catch (resetErr) {
          console.error('Error resetting connection:', resetErr);
        }
      } else if (pc.signalingState === 'stable') {
        console.log(`Connection for ${fromId} is already in stable state, ignoring answer`);
      } else {
        console.warn(`Cannot set remote answer in state: ${pc.signalingState} for ${fromId}`);
        
        // If we're in a bad state, reset the connection
        console.log(`Resetting connection for ${fromId} due to signaling state conflict`);
        pc.close();
        delete peerConnections.current[fromId];
        
        // Create a new connection after a delay
        setTimeout(() => {
          if (authState.user && meetingId) {
            const newPc = createPeerConnection(fromId);
            
            // Only create a new offer if we're the one who should initiate
            // This helps prevent offer/answer loops
            if (authState.user.uid < fromId) {
              newPc.createOffer().then(offer => {
                newPc.setLocalDescription(offer).then(() => {
                  setDoc(
                    doc(db, 'meetings', meetingId, 'offers', `${authState.user!.uid}_to_${fromId}_${Date.now()}`),
                    {
                      offer: {
                        type: offer.type,
                        sdp: offer.sdp,
                      },
                      from: authState.user!.uid,
                      to: fromId,
                      timestamp: new Date(),
                    }
                  );
                });
              });
            }
          }
        }, 2000); // Longer delay to avoid race conditions
      }
    } catch (err) {
      console.error('Error handling answer:', err);
    }
  };

  // Update the joinMeeting function to use the new handlers
  const joinMeeting = async (meetingId: string) => {
    if (!authState.user) {
      setError('You must be logged in to join a meeting');
      setIsLoading(false);
      showToast.error('You must be logged in to join a meeting');
      return;
    }
    
    // Store toast ID but we don't need to use it later since showToast handles dismissal
  
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Set up local media stream
      const stream = await setupMediaStream();
      setMeetingId(meetingId);
      
      // Add current user to participants
      const currentParticipant: Participant = {
        id: authState.user.uid,
        displayName: authState.user.displayName || 'You',
        stream,
        audioEnabled: isAudioEnabled,
        videoEnabled: isVideoEnabled,
      };
      
      setParticipants([currentParticipant]);
      
      // Add user to meeting participants in Firestore
      await setDoc(
        doc(db, 'meetings', meetingId, 'participants', authState.user.uid),
        {
          uid: authState.user.uid,
          displayName: authState.user.displayName,
          joinedAt: new Date(),
        }
      );
      
      // Listen for new participants
      const participantsUnsubscribe = onSnapshot(
        collection(db, 'meetings', meetingId, 'participants'),
        (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            const participantData = change.doc.data();
            const participantId = change.doc.id;
            
            // Skip if it's the current user
            if (participantId === authState.user?.uid) return;
            
            if (change.type === 'added') {
              // Create peer connection for new participant
              const pc = createPeerConnection(participantId);
              
              // Create and send offer
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              
              if (authState.user) {
                await setDoc(
                  doc(db, 'meetings', meetingId, 'offers', `${authState.user.uid}_to_${participantId}`),
                  {
                    offer: {
                      type: offer.type,
                      sdp: offer.sdp,
                    },
                    from: authState.user.uid,
                    to: participantId,
                    timestamp: new Date(),
                  }
                );
              }
              
              // In the joinMeeting function, update the participant creation:
              // Add participant to the list
              setParticipants(prev => {
                if (prev.some(p => p.id === participantId)) return prev;
                
                return [...prev, {
                  id: participantId,
                  displayName: participantData.displayName || 'Unknown',
                  photoURL: participantData.photoURL || null, // Add photoURL
                  stream: null,
                  audioEnabled: true,
                  videoEnabled: true,
                }];
              });
            } else if (change.type === 'removed') {
              // Remove participant when they leave
              if (peerConnections.current[participantId]) {
                peerConnections.current[participantId].close();
                delete peerConnections.current[participantId];
              }
              
              setParticipants(prev => prev.filter(p => p.id !== participantId));
            }
          });
        }
      );
      
      unsubscribeRefs.current.push(participantsUnsubscribe);
      
      // Listen for offers
      const offersUnsubscribe = onSnapshot(
        query(
          collection(db, 'meetings', meetingId, 'offers'),
          where('to', '==', authState.user?.uid)
        ),
        async (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              await handleOffer(data.from, data.offer);
            }
          });
        }
      );
      
      unsubscribeRefs.current.push(offersUnsubscribe);
      
      // Listen for answers
      const answersUnsubscribe = onSnapshot(
        query(
          collection(db, 'meetings', meetingId, 'answers'),
          where('to', '==', authState.user?.uid)
        ),
        (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              await handleAnswer(data.from, data.answer);
            }
          });
        }
      );
      
      unsubscribeRefs.current.push(answersUnsubscribe);
      
      // Listen for ICE candidates
      const candidatesUnsubscribe = onSnapshot(
        query(
          collection(db, 'meetings', meetingId, 'candidates'),
          where('to', '==', authState.user?.uid) // Add optional chaining
        ),
        (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              const fromId = data.from;
              
              const pc = peerConnections.current[fromId];
              
              if (pc && pc.remoteDescription && data.candidate) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (err) {
                  console.error('Error adding ICE candidate:', err);
                }
              }
            }
          });
        }
      );
      
      unsubscribeRefs.current.push(candidatesUnsubscribe);
      
      setIsLoading(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to join meeting: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  const leaveMeeting = async () => {
    if (!meetingId || !authState.user) return;
    
    // Remove user from meeting participants
    try {
      await deleteDoc(doc(db, 'meetings', meetingId, 'participants', authState.user.uid));
    } catch (err) {
      console.error('Error removing participant:', err);
    }
    
    // Close all peer connections
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
    
    // Stop all tracks in local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    // Unsubscribe from all listeners
    unsubscribeRefs.current.forEach(unsub => unsub());
    unsubscribeRefs.current = [];
    
    // Reset state
    setParticipants([]);
    setMeetingId(null);
  };

  const toggleAudio = () => {
    if (localStream && authState.user) {
      const audioTracks = localStream.getAudioTracks();
      const newState = !isAudioEnabled;
      
      audioTracks.forEach(track => {
        track.enabled = newState;
      });
      
      setIsAudioEnabled(newState);
      
      // Update participant state
      setParticipants(prev => 
        prev.map(p => 
          p.id === authState.user?.uid 
            ? { ...p, audioEnabled: newState } 
            : p
        )
      );
    }
  };

  const toggleVideo = () => {
    if (localStream && authState.user) {
      const videoTracks = localStream.getVideoTracks();
      const newState = !isVideoEnabled;
      
      videoTracks.forEach(track => {
        track.enabled = newState;
      });
      
      setIsVideoEnabled(newState);
      
      // Update participant state
      setParticipants((prev: Participant[]) => 
        prev.map(p => 
          p.id === authState.user?.uid 
            ? { ...p, videoEnabled: newState } 
            : p
        )
      );
    }
  };

  return (
    <WebRTCContext.Provider
      value={{
        localStream,
        participants,
        joinMeeting,
        leaveMeeting,
        toggleAudio,
        toggleVideo,
        isAudioEnabled,
        isVideoEnabled,
        meetingId,
        isLoading,
        error,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};