import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './Gallery.css';

import v01 from '../../assets/venue/venue-01.webp';
import v02 from '../../assets/venue/venue-02.webp';
import v03 from '../../assets/venue/venue-03.webp';
import v04 from '../../assets/venue/venue-04.webp';
import v05 from '../../assets/venue/venue-05.webp';
import v06 from '../../assets/venue/venue-06.webp';
import v07 from '../../assets/venue/venue-07.webp';
import v08 from '../../assets/venue/venue-08.webp';
import v09 from '../../assets/venue/venue-09.webp';
import v10 from '../../assets/venue/venue-10.webp';
import v11 from '../../assets/venue/venue-11.webp';
import v12 from '../../assets/venue/venue-12.webp';
import v13 from '../../assets/venue/venue-13.webp';
import v14 from '../../assets/venue/venue-14.webp';
import v15 from '../../assets/venue/venue-15.webp';

const IMAGES = [v01, v02, v03, v04, v05, v06, v07, v08, v09, v10, v11, v12, v13, v14, v15];
const INTERVAL = 5000;

const Gallery = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const startTimeRef = useRef(null);
  const touchStartX = useRef(null);

  const goTo = useCallback((idx, dir) => {
    setDirection(dir);
    setActive(idx);
    setProgress(0);
    startTimeRef.current = Date.now();
  }, []);

  const goPrev = useCallback(() => {
    goTo((active - 1 + IMAGES.length) % IMAGES.length, -1);
  }, [active, goTo]);

  const goNext = useCallback(() => {
    goTo((active + 1) % IMAGES.length, 1);
  }, [active, goTo]);

  // Auto-advance + progress
  useEffect(() => {
    if (paused || lightbox !== null) return;
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      goTo((prev) => (prev + 1) % IMAGES.length, 1);
    }, INTERVAL);

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setProgress(Math.min((elapsed / INTERVAL) * 100, 100));
    }, 30);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(progressRef.current);
    };
  }, [active, paused, lightbox, goTo]);

  // Touch swipe
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? goNext() : goPrev();
    touchStartX.current = null;
  };

  // Lightbox keyboard
  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e) => {
      if (e.key === 'ArrowLeft') setLightbox(i => (i - 1 + IMAGES.length) % IMAGES.length);
      if (e.key === 'ArrowRight') setLightbox(i => (i + 1) % IMAGES.length);
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox]);

  const slideVariants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
  };

  return (
    <section id="gallery" className="gallery">
      {/* Section Header */}
      <div className="gallery__header text-center container">
        <p className="label-gold gallery__label">{t('gallery.label')}</p>
        <h2 className="heading-section">{t('gallery.title')}</h2>
        <div className="gold-divider" />
        <p className="gallery__subtitle">{t('gallery.subtitle')}</p>
      </div>

      {/* Cinematic Slider */}
      <div
        className="gallery__slider"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Images */}
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={active}
            className="gallery__slide"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
            onClick={() => setLightbox(active)}
          >
            <motion.img
              src={IMAGES[active]}
              alt={`Ocean Noir ${active + 1}`}
              className="gallery__slide-img"
              initial={{ scale: 1.06 }}
              animate={{ scale: 1 }}
              transition={{ duration: INTERVAL / 1000 + 0.8, ease: 'linear' }}
            />
            <div className="gallery__slide-overlay" />
          </motion.div>
        </AnimatePresence>

        {/* Counter */}
        <div className="gallery__counter">
          <span className="gallery__counter-current">
            {String(active + 1).padStart(2, '0')}
          </span>
          <span className="gallery__counter-sep"> · </span>
          <span className="gallery__counter-total">
            {String(IMAGES.length).padStart(2, '0')}
          </span>
        </div>

        {/* Arrows */}
        <button className="gallery__arrow gallery__arrow--prev" onClick={goPrev} aria-label="Previous">‹</button>
        <button className="gallery__arrow gallery__arrow--next" onClick={goNext} aria-label="Next">›</button>

        {/* Click hint */}
        <div className="gallery__hint">
          <span>⊕</span>
        </div>

        {/* Progress bar */}
        <div className="gallery__progress-track">
          <motion.div
            className="gallery__progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Dot navigation */}
      <div className="gallery__dots">
        {IMAGES.map((_, i) => (
          <button
            key={i}
            className={`gallery__dot ${i === active ? 'gallery__dot--active' : ''}`}
            onClick={() => goTo(i, i > active ? 1 : -1)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setLightbox(null)}
          >
            <button className="lightbox__close" onClick={() => setLightbox(null)}>✕</button>
            <button className="lightbox__prev" onClick={(e) => { e.stopPropagation(); setLightbox(i => (i - 1 + IMAGES.length) % IMAGES.length); }}>‹</button>
            <motion.img
              key={lightbox}
              src={IMAGES[lightbox]}
              alt={`Ocean Noir ${lightbox + 1}`}
              className="lightbox__img"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            />
            <button className="lightbox__next" onClick={(e) => { e.stopPropagation(); setLightbox(i => (i + 1) % IMAGES.length); }}>›</button>
            <div className="lightbox__counter">{lightbox + 1} / {IMAGES.length}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
