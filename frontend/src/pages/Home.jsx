import { motion } from 'framer-motion';

export default function Home() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <h1 className="text-3xl font-bold text-gray-900">Home</h1>
      <p className="mt-4 text-gray-600">This is the Home page content.</p>
    </motion.div>
  );
}
