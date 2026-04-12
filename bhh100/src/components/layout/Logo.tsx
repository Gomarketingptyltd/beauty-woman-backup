'use client'

import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizes = {
    sm: { flower: 28, text1: 18, text2: 11, sub: 10 },
    md: { flower: 36, text1: 22, text2: 13, sub: 11 },
    lg: { flower: 52, text1: 32, text2: 18, sub: 14 },
  }
  const s = sizes[size]

  return (
    <Link href="/" className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      {/* 花朵 SVG */}
      <svg width={s.flower} height={s.flower} viewBox="0 0 60 60" fill="none">
        <ellipse cx="30" cy="14" rx="7" ry="14" fill="#f472b6" transform="rotate(0 30 30)" />
        <ellipse cx="30" cy="14" rx="7" ry="14" fill="#fb923c" transform="rotate(45 30 30)" />
        <ellipse cx="30" cy="14" rx="7" ry="14" fill="#facc15" transform="rotate(90 30 30)" />
        <ellipse cx="30" cy="14" rx="7" ry="14" fill="#4ade80" transform="rotate(135 30 30)" />
        <ellipse cx="30" cy="14" rx="7" ry="14" fill="#22d3ee" transform="rotate(180 30 30)" />
        <ellipse cx="30" cy="14" rx="7" ry="14" fill="#818cf8" transform="rotate(225 30 30)" />
        <ellipse cx="30" cy="14" rx="7" ry="14" fill="#e879f9" transform="rotate(270 30 30)" />
        <ellipse cx="30" cy="14" rx="7" ry="14" fill="#f43f5e" transform="rotate(315 30 30)" />
        <circle cx="30" cy="30" r="8" fill="white" />
        <circle cx="30" cy="30" r="5" fill="#fbbf24" />
      </svg>

      {/* 文字 */}
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline gap-0.5">
          <span
            style={{
              fontSize: s.text1,
              background: 'linear-gradient(135deg, #f472b6 0%, #fb923c 40%, #facc15 70%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontStyle: 'italic',
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            bhh100
          </span>
          <span style={{ fontSize: s.text2, color: '#94a3b8', fontWeight: 400 }}>
            .com
          </span>
        </div>
        <span
          style={{
            fontSize: s.sub,
            background: 'linear-gradient(135deg, #fbbf24, #d97706)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}
        >
          百花汇
        </span>
      </div>
    </Link>
  )
}
