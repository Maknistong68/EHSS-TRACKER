export type RagStatus = 'green' | 'amber' | 'red' | 'none';

export interface RagThresholds {
  target: number | null;
  redThreshold: number | null;
  amberThreshold: number | null;
  higherIsBetter?: boolean; // For KPIs where higher value = better (like near misses, inspections)
}

/**
 * Calculate RAG status based on value and thresholds.
 *
 * For "lower is better" KPIs (incidents, NCRs):
 *   - green: value <= target
 *   - amber: value > target && value <= redThreshold
 *   - red: value > redThreshold
 *
 * For "higher is better" KPIs (compliance %, completion rates):
 *   - green: value >= target
 *   - amber: value < target && value >= amberThreshold
 *   - red: value < amberThreshold (or redThreshold)
 */
export function calculateRag(value: number | null, thresholds: RagThresholds): RagStatus {
  if (value === null || value === undefined) return 'none';
  if (thresholds.target === null) return 'none'; // Tracking only

  const { target, redThreshold, amberThreshold, higherIsBetter = true } = thresholds;

  if (higherIsBetter) {
    // Higher is better (percentages, compliance, counts where more = good)
    if (value >= target) return 'green';
    if (amberThreshold !== null && value >= amberThreshold) return 'amber';
    if (redThreshold !== null && value >= redThreshold) return 'amber';
    return 'red';
  } else {
    // Lower is better (incidents, injuries, complaints)
    if (value <= target) return 'green';
    if (amberThreshold !== null && value <= amberThreshold) return 'amber';
    if (redThreshold !== null && value <= redThreshold) return 'amber';
    return 'red';
  }
}

export function ragColor(status: RagStatus): string {
  switch (status) {
    case 'green': return 'bg-green-100 text-green-800 border-green-300';
    case 'amber': return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'red': return 'bg-red-100 text-red-800 border-red-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

export function ragDot(status: RagStatus): string {
  switch (status) {
    case 'green': return 'bg-green-500';
    case 'amber': return 'bg-amber-500';
    case 'red': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
}
