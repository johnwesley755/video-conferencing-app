// App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Meeting from "./pages/Meeting";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import { AnimatePresence } from "framer-motion";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Signup from "./components/Signup";
import Profile from "./pages/Profile";
import { ReactNode } from "react";

// Component to handle private routing
type PrivateRouteProps = {
  children: ReactNode;
};

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const token = localStorage.getItem("token"); // Check token directly
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => (
  <Router>
    <Navbar />
    <AnimatePresence>
      <Routes>
        {/* Default to the home page */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/logout" element={<Logout />} />
        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/meeting/:id"
          element={
            <PrivateRoute>
              <Meeting />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  </Router>
);

export default App;
