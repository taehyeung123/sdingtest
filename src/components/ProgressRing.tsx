import { useEffect, useState, type ReactNode } from "react";

interface Props {
  /** 0~1 */
  value: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}

// SVG 도넛 진행률 차트 (마운트 시 채워지는 애니메이션)
export default function ProgressRing({
  value,
  size = 116,
  stroke = 11,
  children,
}: Props) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 80);
    return () => clearTimeout(t);
  }, [value]);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#f1f1f3"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(Math.max(animated, 0), 1))}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
