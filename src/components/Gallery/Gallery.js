import React, { useState, useCallback } from 'react';
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

const Gallery = () => {
  const { t } = useTranslation();
  const [lightbox, setLightbox] = useState(null);

  const openLightbox = useCallback((i) => setLightbox(i), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const prev = useCallback(() => setLightbox(i => (i - 1 + IMAGES.length) % IMAGES.length), []);
  const next = useCallback(() => setLightbox(i => (i + 1) % IMAGES.length), []);

  const handleKey = useCallback((e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape') closeLightbox();
  }, [prev, next, closeLightbox]);

  return (
    <section id="gallery" className="gallery section-padding">
      <div className="container">
        <div className="gallery__header text-center">
          <p className="label-gold gallery__label">{t('gallery.label')}</p>
          <h2 className="heading-section">{t('gallery.title')}</h2>
          <div className="gold-divider" />
          <p className="gallery__subtitle">{t('gallery.subtitle')}</p>
        </div>

        <div className="gallery__grid">
          {IMAGES.map((src, i) => (
            <motion.div
              key={i}
              className="gallery__item"
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i % 5) * 0.07 }}
              onClick={() => openLightbox(i)}
            >
              <img src={src} alt={`Ocean Noir ${i + 1}`} className="gallery__img" loading="lazy" />
              <div className="gallery__item-overlay">
                <span className="gallery__item-icon">⊕</span>
              </div>
            </motion.div>
          ))}
        </div>
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
            onClick={closeLightbox}
            onKeyDown={handleKey}
            tabIndex={0}
          >
            <button className="lightbox__close" onClick={closeLightbox}>✕</button>
            <button className="lightbox__prev" onClick={(e) => { e.stopPropagation(); prev(); }}>‹</button>
            <motion.img
              key={lightbox}
              src={IMAGES[lightbox]}
              alt={`Ocean Noir ${lightbox + 1}`}
              className="lightbox__img"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            />
            <button className="lightbox__next" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
            <div className="lightbox__counter">{lightbox + 1} / {IMAGES.length}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
