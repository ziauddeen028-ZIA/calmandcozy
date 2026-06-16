import { motion, AnimatePresence } from 'framer-motion';

/**
 * StoreLoadingBanner
 * Shows a subtle loading message above the grid while products load.
 * Hides itself (via AnimatePresence) once loading is done.
 *
 * Props:
 *  @param {boolean} loading
 */
export default function StoreLoadingBanner({ loading }) {
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loading-banner"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="mb-6 flex items-center gap-2.5 px-2"
        >
          {/* Animated dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-600" />
          </span>
          <span className="text-sm font-medium text-gray-500 font-satoshi tracking-wide">
            Preparing your collection...
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
