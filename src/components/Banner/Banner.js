import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './Banner.css';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: [0.4, 0, 0.2, 1] },
});

const Banner = () => {
  const { t } = useTranslation();
  const headline = t('hero.headline').split('\n');

  return (
    <section id="hero" className="banner">
      <div className="banner__overlay" />
      <div className="banner__particles" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <span key={i} className={`banner__particle banner__particle--${i + 1}`} />
        ))}
      </div>

      <div className="banner__content">
        <motion.p className="banner__tagline label-gold" {...fadeUp(0.2)}>
          {t('hero.tagline')}
        </motion.p>

        <motion.h1 className="banner__headline heading-display" {...fadeUp(0.45)}>
          {headline.map((line, i) => (
            <span key={i} className="banner__headline-line">{line}</span>
          ))}
        </motion.h1>

        <motion.div className="banner__divider" {...fadeUp(0.65)} />

        <motion.p className="banner__subline" {...fadeUp(0.75)}>
          {t('hero.subline')}
        </motion.p>

        <motion.div className="banner__actions" {...fadeUp(0.95)}>
          <button
            className="btn btn-gold banner__cta"
            onClick={() => {
              const el = document.getElementById('services');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span>{t('hero.cta')}</span>
          </button>
          <span className="banner__status label-gold">{t('hero.status')}</span>
        </motion.div>
      </div>

      <div className="banner__scroll-hint" aria-hidden="true">
        <span className="banner__scroll-line" />
      </div>
    </section>
  );
};

export default Banner;
