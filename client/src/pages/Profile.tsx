import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

interface User {
  name: string;
  email: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
      } catch (error) {
        console.error("⚠️ Error fetching user profile:", error);
        setError("⚠️ Error fetching user profile. Please try again.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold text-red-500">
          No user data available.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="flex items-center justify-center min-h-screen bg-gray-100 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg"
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
      >
        <h1 className="text-3xl font-extrabold text-center mb-6">
          Profile Page
        </h1>

        {error && (
          <motion.p
            className="text-red-500 bg-red-100 p-2 rounded-md mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        <div className="bg-gray-50 p-6 rounded-md shadow-inner">
          <h2 className="text-2xl font-semibold mb-2">{user.name}</h2>
          <p className="text-gray-700 mb-4">Email: {user.email}</p>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              navigate("/login");
            }}
            className="w-full bg-red-500 text-white py-2 rounded-md font-semibold hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Profile;
