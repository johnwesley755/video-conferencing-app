import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaHome, FaVideo, FaSignOutAlt } from "react-icons/fa";
import { motion } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-bold text-indigo-600 flex items-center gap-2"
        >
          <FaVideo className="text-indigo-500" />
          Video App
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-gray-700 hover:text-indigo-600 transition flex items-center gap-1"
          >
            <FaHome />
            Home
          </Link>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition"
            >
              <FaUserCircle size={24} />
              Profile
            </button>

            {isProfileOpen && (
              <motion.div
                className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 transition"
                >
                  View Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-500 hover:bg-red-100 transition"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
