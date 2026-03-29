import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './Rate.css';

const RATES = [
  { id: 1, duration: '30 min', price: '$150', lady: '$90',  room: '$60'  },
  { id: 2, duration: '45 min', price: '$200', lady: '$120', room: '$80'  },
  { id: 3, duration: '1 Hour', price: '$250', lady: '$150', room: '$100' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: [0.4, 0, 0.2, 1] },
  }),
};

const Rate = () => {
  const { t } = useTranslation();

  return (
    <section id="rates" className="rate section-padding">
      <div className="rate__bg-image" aria-hidden="true" />
      <div className="rate__overlay" aria-hidden="true" />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="rate__header text-center">
          <p className="label-gold rate__label">{t('rates.label')}</p>
          <h2 className="heading-section">{t('rates.title')}</h2>
          <div className="gold-divider" />
          <p className="rate__subtitle">{t('rates.subtitle')}</p>
        </div>

        <div className="rate__cards">
          {RATES.map((r, i) => (
            <motion.div
              key={r.id}
              className={`rate__card ${i === 1 ? 'rate__card--featured' : ''}`}
              variants={cardVariants}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
            >
              {i === 1 && <span className="rate__badge">Popular</span>}
              <div className="rate__price-block">
                <span className="rate__price">{r.price}</span>
                <span className="rate__duration">{r.duration}</span>
              </div>
              <div className="rate__breakdown">
                <div className="rate__breakdown-row">
                  <span className="rate__breakdown-label">{t('rates.lady')}</span>
                  <span className="rate__breakdown-value">{r.lady}</span>
                </div>
                <div className="rate__breakdown-divider" />
                <div className="rate__breakdown-row">
                  <span className="rate__breakdown-label">{t('rates.room')}</span>
                  <span className="rate__breakdown-value">{r.room}</span>
                </div>
              </div>
              <button className="btn btn-gold rate__book-btn">
                <span>{t('rates.book')}</span>
              </button>
            </motion.div>
          ))}
        </div>

        <div className="rate__info">
          <p className="rate__hours">{t('rates.hours')}</p>
          <p className="rate__note">{t('rates.note')}</p>
        </div>
      </div>
    </section>
  );
};

export default Rate;
