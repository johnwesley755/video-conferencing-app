import { motion } from "framer-motion";

const VideoPlayer = () => (
  <motion.div
    className="w-full h-64 bg-gray-200 flex items-center justify-center"
    whileHover={{ scale: 1.05 }}
  >
    <p>Video Player Placeholder</p>
  </motion.div>
);

export default VideoPlayer;
