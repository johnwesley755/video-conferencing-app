export const WebRTCConfig = {
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
    {
      urls: 'turn:your-turn-server.com:3478',  // Replace with your TURN server
      username: 'username',
      credential: 'password'
    }
  ],
  iceCandidatePoolSize: 10,
  sdpSemantics: 'unified-plan'
};