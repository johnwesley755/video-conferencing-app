// src/components/Logout.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const Logout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("❌ No token found. Redirecting to login...");
          navigate("/login");
          return;
        }

        const response = await axios.post(
          "/api/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("✅ Logout response:", response.data);

        // Clear the token and redirect to login
        localStorage.removeItem("token");
        navigate("/login");
      } catch (error) {
        console.error("⚠️ Error during logout:", error);
        navigate("/login");
      }
    };

    handleLogout();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white shadow-md rounded-lg">
        <AiOutlineLoading3Quarters className="animate-spin text-4xl text-blue-500 mb-4" />
        <p className="text-lg font-semibold text-gray-700">Logging out...</p>
      </div>
    </div>
  );
};

export default Logout;
