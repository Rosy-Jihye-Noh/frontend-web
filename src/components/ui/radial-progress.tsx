import * as React from "react";
import { useEffect, useState } from "react";

interface RadialProgressProps extends React.SVGProps<SVGSVGElement> {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
}

const RadialProgress = React.forwardRef<SVGSVGElement, RadialProgressProps>(
  ({ value, max = 100, size = 120, strokeWidth = 10, className, ...props }, ref) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      // 컴포넌트가 마운트되거나 value가 변경될 때 애니메이션 시작
      const animationTimeout = setTimeout(() => setProgress(value), 100);
      return () => clearTimeout(animationTimeout);
    }, [value]);

    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    // progress 상태를 기반으로 offset 계산
    const strokeDashoffset = circumference * (1 - progress / max);

    return (
      // 👇 div의 높이를 size와 동일하게 설정
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          ref={ref}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className={`-rotate-90 transform ${className}`}
          {...props}
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200"
            strokeLinecap="round"
          />
          {/* Foreground progress */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-out"
            strokeLinecap="round"
          />
        </svg>
        {/* 👇 텍스트 배경 추가 */}
        <div 
          className="absolute flex flex-col items-center justify-center w-2/3 h-2/3 
                     bg-background/60 backdrop-blur-sm rounded-full"
        >
          <span className="text-2xl font-bold text-foreground">
            {value.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">점</span>
        </div>
      </div>
    );
  }
);

RadialProgress.displayName = "RadialProgress";

export { RadialProgress };