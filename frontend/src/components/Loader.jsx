import { motion } from 'framer-motion';

export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <motion.div
        className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
