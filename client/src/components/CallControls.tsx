import { motion } from "framer-motion";

const CallControls = () => (
  <motion.div
    className="flex space-x-4 mt-4"
    initial={{ scale: 0.8 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", stiffness: 100 }}
  >
    <button className="bg-red-500 text-white px-4 py-2 rounded">
      End Call
    </button>
    <button className="bg-green-500 text-white px-4 py-2 rounded">Mute</button>
    <button className="bg-yellow-500 text-white px-4 py-2 rounded">
      Share Screen
    </button>
  </motion.div>
);

export default CallControls;
