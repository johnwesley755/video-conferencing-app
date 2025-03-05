// src/components/Navbar.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiLogOut, FiUser, FiHome, FiMenu, FiX } from "react-icons/fi";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    navigate("/logout");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <nav className="bg-white p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-blue-500 text-2xl font-bold">
          <Link to="/">Video App</Link>
        </div>

        <div className="hidden md:flex space-x-6">
          <Link
            to="/"
            className="text-black flex items-center space-x-1 hover:text-gray-700 transition"
          >
            <FiHome />
            <span>Home</span>
          </Link>

          <Link
            to="/profile"
            className="text-black flex items-center space-x-1 hover:text-gray-700 transition"
          >
            <FiUser />
            <span>Profile</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-black text-2xl focus:outline-none"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden p-4">
          <Link
            to="/"
            className="block text-black py-2 hover:bg-blue-500 rounded"
            onClick={toggleMobileMenu}
          >
            <FiHome className="inline mr-2" />
            Home
          </Link>
          <Link
            to="/profile"
            className="block text-black py-2 hover:bg-blue-500 rounded"
            onClick={toggleMobileMenu}
          >
            <FiUser className="inline mr-2" />
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
