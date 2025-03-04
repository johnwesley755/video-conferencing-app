import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => (
  <motion.div
    className="flex flex-col items-center justify-center h-screen bg-gray-100"
    initial={{ scale: 0.8 }}
    animate={{ scale: 1 }}
    exit={{ scale: 0.8 }}
  >
    <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
    <Link to="/" className="bg-blue-500 text-white px-4 py-2 rounded">
      Go Home
    </Link>
  </motion.div>
);

export default NotFound;
