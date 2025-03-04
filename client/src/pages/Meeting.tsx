import { useParams } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import Chat from "../components/Chat";
import CallControls from "../components/CallControls";
import { motion } from "framer-motion";

const Meeting = () => {
  const { id } = useParams();

  return (
    <motion.div
      className="flex flex-col items-center p-4"
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      exit={{ x: -100 }}
    >
      <h1 className="text-2xl font-bold mb-4">Meeting ID: {id}</h1>
      <div className="flex flex-row space-x-4">
        <VideoPlayer />
        <Chat />
      </div>
      <CallControls />
    </motion.div>
  );
};

export default Meeting;
