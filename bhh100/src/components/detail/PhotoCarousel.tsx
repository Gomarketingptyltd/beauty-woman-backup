'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PhotoCarouselProps {
  photos: string[]
  name: string
}

export default function PhotoCarousel({ photos, name }: PhotoCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  const validPhotos = photos.filter(Boolean)
  const hasPhotos = validPhotos.length > 0

  useEffect(() => {
    if (!autoPlay || validPhotos.length <= 1) return
    const timer = setInterval(() => {
      setCurrent(p => (p + 1) % validPhotos.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [autoPlay, validPhotos.length])

  function prev() {
    setAutoPlay(false)
    setCurrent(p => (p - 1 + validPhotos.length) % validPhotos.length)
  }
  function next() {
    setAutoPlay(false)
    setCurrent(p => (p + 1) % validPhotos.length)
  }

  if (!hasPhotos) {
    return (
      <div
        className="w-full flex items-center justify-center text-7xl"
        style={{ height: 400, background: 'linear-gradient(135deg, #1e293b, #334155)' }}
      >
        🌸
      </div>
    )
  }

  return (
    <div className="relative w-full overflow-hidden" style={{ maxHeight: 500, background: '#0f172a' }}>
      <div className="relative w-full" style={{ paddingBottom: '75%' }}>
        <Image
          src={validPhotos[current]}
          alt={`${name} - 第${current + 1}张`}
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* 左右箭头 */}
      {validPhotos.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* 底部指示点 + 计数 */}
      {validPhotos.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
          {validPhotos.map((_, i) => (
            <button
              key={i}
              onClick={() => { setAutoPlay(false); setCurrent(i) }}
              className="rounded-full transition-all"
              style={{
                width: i === current ? 16 : 6,
                height: 6,
                background: i === current ? '#fbbf24' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      )}

      {/* 图片计数 */}
      <div
        className="absolute top-3 right-3 px-2 py-0.5 rounded text-xs font-semibold"
        style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}
      >
        {current + 1}/{validPhotos.length}
      </div>
    </div>
  )
}
