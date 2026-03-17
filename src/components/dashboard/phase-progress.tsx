'use client';

import ProgressBar from '@/components/shared/progress-bar';

interface PhaseProgressProps {
  premob: number;
  mob: number;
  execution: number;
  demob: number;
}

export default function PhaseProgress({ premob = 0, mob = 0, execution = 0, demob = 0 }: PhaseProgressProps) {
  const phases = [
    { name: 'Pre-Mobilization', value: premob },
    { name: 'Mobilization', value: mob },
    { name: 'Execution', value: execution },
    { name: 'Demobilization', value: demob },
  ];

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Phase Progress</h3>
      <div className="space-y-4">
        {phases.map((phase) => (
          <ProgressBar key={phase.name} label={phase.name} value={phase.value} />
        ))}
      </div>
    </div>
  );
}
