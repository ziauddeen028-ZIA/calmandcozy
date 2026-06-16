import { motion, AnimatePresence } from 'framer-motion';

/**
 * StoreLoadingBanner
 * Shows the branded Calm & Cozy progress bar + stage label while products load.
 * Hides itself (via AnimatePresence) once loading is done.
 *
 * Props:
 *  @param {boolean} loading
 *  @param {string}  stageLabel  – current stage text from useLoadingStages
 *  @param {number}  progress    – 0–100
 */
export default function StoreLoadingBanner({ loading, stageLabel, progress }) {
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loading-banner"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="mb-6 rounded-2xl bg-white border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-2"
        >
          {/* Top row: logo mark + stage label */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {/* Animated dot */}
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={stageLabel}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm font-medium text-gray-700 font-satoshi"
                >
                  {stageLabel}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Branding */}
            <span className="text-xs text-gray-400 font-satoshi tracking-wide hidden sm:block">
              Calm&amp;Cozy
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-700"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
