import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserCircle, FaEnvelope, FaSignOutAlt } from "react-icons/fa";

interface UserProfile {
  username: string;
  email: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Fetch profile data from localStorage
    const storedUsername = localStorage.getItem("username");
    const storedEmail = localStorage.getItem("email") || "example@email.com";

    console.log("Fetched Username:", storedUsername);
    console.log("Fetched Email:", storedEmail);

    if (storedUsername) {
      setProfile({ username: storedUsername, email: storedEmail });
    } else {
      console.warn("No username found, redirecting to login.");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-white bg-opacity-20 p-10 rounded-lg shadow-lg backdrop-blur-md flex flex-col items-center">
        <FaUserCircle size={80} className="mb-4 text-white drop-shadow-lg" />
        {profile ? (
          <>
            <h1 className="text-3xl font-bold mb-2">{profile.username}</h1>
            <p className="flex items-center gap-2 mb-6 text-lg">
              <FaEnvelope />
              {profile.email}
            </p>
          </>
        ) : (
          <p className="text-lg mb-6">Loading profile...</p>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 text-white px-6 py-2 rounded-full shadow-lg hover:bg-red-600 transition transform hover:scale-105"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </motion.div>
  );
};

export default Profile;
