// src/pages/Home.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { FaPlus, FaSignInAlt, FaHistory, FaInfoCircle } from "react-icons/fa";
import MeetingCard from "../components/MeetingCard";

const Home = () => {
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState("");
  const [meetingHistory, setMeetingHistory] = useState<string[]>([]);

  const handleCreateMeeting = () => {
    const newMeetingId = uuidv4();
    setMeetingId(newMeetingId);
    setMeetingHistory((prev) => [newMeetingId, ...prev]);
    alert(`New Meeting ID: ${newMeetingId}`);
    navigate(`/meeting/${newMeetingId}`);
  };

  const handleJoinMeeting = () => {
    const inputMeetingId = prompt("Enter Meeting ID");
    if (inputMeetingId) {
      setMeetingHistory((prev) => [inputMeetingId, ...prev]);
      navigate(`/meeting/${inputMeetingId}`);
    }
  };

  const handleCopyMeetingId = (id: string) => {
    navigator.clipboard.writeText(id);
    alert("Meeting ID copied to clipboard!");
  };

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center min-h-screen bg-white p-4 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Animated Shapes in the Background */}
      <motion.div
        className="absolute w-96 h-96 bg-blue-100 rounded-full top-16 left-10 opacity-50"
        animate={{ y: [0, 50, 0], x: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-80 h-80 bg-pink-100 rounded-full bottom-20 right-20 opacity-50"
        animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-64 h-64 bg-green-100 rounded-full bottom-10 left-40 opacity-50"
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="bg-white bg-opacity-80 p-8 rounded-2xl shadow-2xl flex flex-col items-center w-full max-w-md z-10"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold mb-6 text-gray-800 drop-shadow-md">
          🎥 Video Conferencing
        </h1>

        <div className="flex flex-col gap-4 w-full mb-8">
          <button
            onClick={handleCreateMeeting}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition"
          >
            <FaPlus size={20} />
            Create New Meeting
          </button>

          <button
            onClick={handleJoinMeeting}
            className="flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-600 transition"
          >
            <FaSignInAlt size={20} />
            Join Meeting
          </button>
        </div>

        {meetingId && (
          <MeetingCard
            meetingId={meetingId}
            onCopy={() => handleCopyMeetingId(meetingId)}
          />
        )}

        {meetingHistory.length > 0 && (
          <div className="mt-8 w-full">
            <h2 className="text-xl font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaHistory /> Meeting History
            </h2>
            <div className="max-h-48 overflow-y-auto">
              {meetingHistory.map((id, index) => (
                <MeetingCard
                  key={index}
                  meetingId={id}
                  onCopy={() => handleCopyMeetingId(id)}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        className="absolute bottom-4 right-4 bg-blue-500 p-3 rounded-full shadow-md text-white cursor-pointer z-10"
        whileHover={{ scale: 1.2 }}
        title="About the App"
        onClick={() =>
          alert(
            "This is a Video Conferencing App built with React and Framer Motion!"
          )
        }
      >
        <FaInfoCircle size={28} />
      </motion.div>
    </motion.div>
  );
};

export default Home;
