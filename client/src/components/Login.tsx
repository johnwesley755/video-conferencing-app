import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      if (response.data.token) {
        // Save the JWT token and user info to localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        // Axios-specific error
        setError(
          err.response?.data?.message || "Failed to log in. Please try again."
        );
      } else if (err instanceof Error) {
        // Generic error
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    }

    setError("");
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-screen bg-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h1 className="text-3xl mb-6 font-bold">Login</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 mb-2 rounded w-64"
      />
      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 mb-4 rounded w-64"
      />
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-6 py-2 rounded"
      >
        Login
      </button>
    </motion.div>
  );
};

export default Login;
