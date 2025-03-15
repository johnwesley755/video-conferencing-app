import { useContext, useEffect } from 'react';
import { WebRTCContext } from '../context/WebRTCContext';

export const useWebRTC = () => {
  const context = useContext(WebRTCContext);
  
  if (!context) {
    throw new Error('useWebRTC must be used within a WebRTCProvider');
  }
  
  // Add any debugging functionality that might have been in the .tsx file
  useEffect(() => {
    // This effect will run once when the component using this hook mounts
    return () => {
      // Cleanup when the component unmounts
    };
  }, []);
  
  return context;
};