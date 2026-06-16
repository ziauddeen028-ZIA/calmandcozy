import { useState, useEffect, useRef } from 'react';

const STAGES = [
  { label: 'Warming up the store',      progress: 20 },
  { label: 'Arranging products',         progress: 55 },
  { label: 'Preparing your collection', progress: 85 },
];

/**
 * Cycles through STAGES while `loading` is true.
 * Once loading completes the bar finishes to 100 % and the stage label clears.
 *
 * @param {boolean} loading – pass the same loading flag used in the page
 * @returns {{ stageLabel: string, progress: number }}
 */
export function useLoadingStages(loading) {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress]     = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!loading) {
      // Snap to 100 % when data arrives
      setProgress(100);
      return;
    }

    // Reset on mount / whenever loading restarts
    setStageIndex(0);
    setProgress(0);

    let idx = 0;

    const advance = () => {
      idx = (idx + 1) % STAGES.length;
      setStageIndex(idx);
      setProgress(STAGES[idx].progress);
    };

    // Initial progress immediately
    setProgress(STAGES[0].progress);

    timerRef.current = setInterval(advance, 2000);
    return () => clearInterval(timerRef.current);
  }, [loading]);

  return {
    stageLabel: loading ? STAGES[stageIndex].label : '',
    progress,
  };
}
