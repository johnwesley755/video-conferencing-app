import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import {
  FaVideo,
  FaMicrophone,
  FaCopy,
  FaPlus,
  FaSignInAlt,
} from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState("");

  const handleCreateMeeting = () => {
    const newMeetingId = uuidv4();
    setMeetingId(newMeetingId);
    alert(`New Meeting ID: ${newMeetingId}`);
    navigate(`/meeting/${newMeetingId}`);
  };

  const handleJoinMeeting = () => {
    const meetingId = prompt("Enter Meeting ID");
    if (meetingId) {
      navigate(`/meeting/${meetingId}`);
    }
  };

  const handleCopyMeetingId = () => {
    navigator.clipboard.writeText(meetingId);
    alert("Meeting ID copied to clipboard!");
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white bg-opacity-10 p-8 rounded-xl shadow-lg backdrop-blur-md flex flex-col items-center"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-6 text-white drop-shadow-lg">
          Video Conferencing App
        </h1>

        <div className="flex gap-4 mb-8">
          <button
            onClick={handleCreateMeeting}
            className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-600 transition transform hover:scale-105"
          >
            <FaPlus size={20} />
            Create New Meeting
          </button>

          <button
            onClick={handleJoinMeeting}
            className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-600 transition transform hover:scale-105"
          >
            <FaSignInAlt size={20} />
            Join Meeting
          </button>
        </div>

        {meetingId && (
          <div className="flex flex-col items-center bg-white bg-opacity-80 p-4 rounded shadow-lg mb-6">
            <p className="mb-2 text-gray-800">Meeting ID: {meetingId}</p>
            <button
              onClick={handleCopyMeetingId}
              className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-900 transition"
            >
              <FaCopy size={16} />
              Copy Meeting ID
            </button>
          </div>
        )}

        <div className="mt-6 flex gap-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-4 bg-gray-700 rounded-full hover:bg-gray-800 transition text-white shadow-md"
            title="Start Video"
          >
            <FaVideo size={24} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-4 bg-gray-700 rounded-full hover:bg-gray-800 transition text-white shadow-md"
            title="Mute/Unmute"
          >
            <FaMicrophone size={24} />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Home;
