import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Meeting from "./pages/Meeting";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import { AnimatePresence } from "framer-motion";
import Login from "./components/Login";
import Signup from "./components/Signup"; // Import the Signup component
import Profile from "./pages/Profile";

const App = () => (
  <AuthProvider>
    <Router>
      <Navbar />
      <AnimatePresence>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} /> {/* New Signup Route */}
          <Route path="/meeting/:id" element={<Meeting />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Router>
  </AuthProvider>
);

export default App;
