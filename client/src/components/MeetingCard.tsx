// src/components/MeetingCard.tsx
import React from "react";
import { FaCopy } from "react-icons/fa";

type MeetingCardProps = {
  meetingId: string;
  onCopy: () => void;
};

const MeetingCard: React.FC<MeetingCardProps> = ({ meetingId, onCopy }) => {
  return (
    <div className="flex flex-col items-center bg-white bg-opacity-30 p-4 rounded-lg shadow-md mb-4 w-full">
      <p className="mb-2 text-white font-semibold">Meeting ID: {meetingId}</p>
      <button
        onClick={onCopy}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
      >
        <FaCopy size={16} />
        Copy Meeting ID
      </button>
    </div>
  );
};

export default MeetingCard;
