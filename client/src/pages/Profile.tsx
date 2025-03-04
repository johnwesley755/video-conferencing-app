import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface User {
  name: string;
  email: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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
        setLoading(false);
      } catch (error) {
        console.error("⚠️ Error fetching user profile:", error);
        navigate("/login");
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>No user data available.</p>;
  }

  return (
    <div className="profile-container">
      <h1>Profile Page</h1>
      <div className="profile-card">
        <h2>{user.name}</h2>
        <p>Email: {user.email}</p>
        <button onClick={() => navigate("/logout")}>Logout</button>
      </div>
    </div>
  );
};

export default Profile;
