'use client';

interface ScoreRingProps {
  score: number | null;
  label: string;
  color: string; // hex color
  size?: number;
}

export default function ScoreRing({ score, label, color, size = 120 }: ScoreRingProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score !== null ? (score / 100) * circumference : 0;
  const offset = circumference - progress;

  const getScoreColor = (s: number) => {
    if (s >= 90) return '#22c55e';
    if (s >= 70) return '#f59e0b';
    if (s >= 50) return '#f97316';
    return '#ef4444';
  };

  const ringColor = score !== null ? getScoreColor(score) : '#e5e7eb';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          {score !== null && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 font-syne">
            {score !== null ? score : '—'}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-semibold" style={{ color }}>
        {label}
      </span>
    </div>
  );
}
