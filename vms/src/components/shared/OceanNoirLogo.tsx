"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 40, title: "text-lg", tagline: "text-xs" },
  md: { icon: 60, title: "text-2xl", tagline: "text-xs" },
  lg: { icon: 90, title: "text-4xl", tagline: "text-sm" },
  xl: { icon: 130, title: "text-5xl", tagline: "text-base" },
};

export function OceanNoirLogo({
  size = "md",
  showText = true,
  showTagline = true,
  className = "",
}: LogoProps) {
  const s = sizes[size];

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* SVG Icon: wave + feminine silhouette */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="waveGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E8E8F0" />
            <stop offset="60%" stopColor="#C8C8D4" />
            <stop offset="100%" stopColor="#8A8A96" />
          </radialGradient>
          <filter id="redGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="silverGlow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer wave / crescent shape */}
        <path
          d="M 80 15 
             C 85 25, 90 40, 85 58 
             C 80 75, 65 88, 48 90 
             C 30 92, 15 82, 10 65 
             C 5 48, 12 28, 28 18 
             C 42 10, 58 8, 68 12 
             Z"
          fill="none"
          stroke="url(#waveGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#silverGlow)"
        />

        {/* Wave curl top */}
        <path
          d="M 68 12 C 78 5, 88 8, 88 18 C 88 25, 82 28, 80 15"
          fill="none"
          stroke="#C8182A"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#redGlow)"
        />

        {/* Wave tail bottom */}
        <path
          d="M 10 65 C 5 75, 15 88, 30 85"
          fill="none"
          stroke="#C8182A"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#redGlow)"
        />

        {/* Feminine silhouette — seated figure */}
        <g filter="url(#redGlow)" stroke="#C8182A" strokeWidth="1.8" strokeLinecap="round" fill="none">
          {/* Head */}
          <circle cx="50" cy="30" r="6" />
          {/* Neck + torso */}
          <path d="M 50 36 L 50 52" />
          {/* Arms */}
          <path d="M 50 40 C 44 38, 40 42, 42 46" />
          <path d="M 50 40 C 54 44, 52 48, 50 52" />
          {/* Seated body/hip */}
          <path d="M 50 52 C 44 54, 40 58, 42 62 C 44 66, 50 65, 55 62 C 58 58, 57 54, 50 52 Z" />
          {/* Legs */}
          <path d="M 42 62 C 38 66, 36 70, 40 72" />
          <path d="M 55 62 C 58 66, 60 70, 56 72" />
        </g>
      </svg>

      {showText && (
        <div className="text-center">
          <h1
            className={`font-cinzel font-bold tracking-[0.2em] silver-text ${s.title} uppercase`}
          >
            OCEAN NOIR
          </h1>
          {showTagline && (
            <p
              className={`font-cinzel text-brand-red/80 tracking-[0.3em] uppercase mt-0.5 ${s.tagline}`}
            >
              SYDNEY · EST. 2010
            </p>
          )}
        </div>
      )}
    </div>
  );
}
