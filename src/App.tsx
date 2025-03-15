import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WebRTCProvider } from './context/WebRTCContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Meeting } from './pages/Meeting';
import { CreateMeeting } from './pages/CreateMeeting';
import { Toaster } from 'sonner';
import { verifyFirestoreConnection, handleOfflineMode } from './lib/firebase-utils';
import { toast } from 'sonner';
import { Profile } from './pages/Profile';
import { CustomCursor } from './components/ui/CustomCursor';

function App() {
  useEffect(() => {
    // Check for offline mode first
    handleOfflineMode();
    
    // Verify Firebase connection on app start
    verifyFirestoreConnection().then(isConnected => {
      if (!isConnected) {
        toast.error("Firebase connection failed. The app will try to work in offline mode where possible.");
      }
    });
  }, []);
  
  return (
    <>
      <CustomCursor />
      <Router>
        <AuthProvider>
          <WebRTCProvider>
            <Toaster position="top-right" richColors />
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route 
                path="/" 
                element={
                  <AuthGuard>
                    <Home />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <AuthGuard>
                    <Dashboard />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/create-meeting" 
                element={
                  <AuthGuard>
                    <CreateMeeting />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/meeting/:meetingId" 
                element={
                  <AuthGuard>
                    <Meeting />
                  </AuthGuard>
                } 
              />
              <Route path="/profile" element={<Profile />} />
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </WebRTCProvider>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;