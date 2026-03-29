import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './Rate.css';

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] },
  }),
};

const Rate = () => {
  const { t } = useTranslation();
  const packages = t('rates.packages', { returnObjects: true });
  const [selected, setSelected] = useState({});

  const handleSelect = (pkgId, sessionIdx) => {
    setSelected(prev => ({ ...prev, [pkgId]: sessionIdx }));
  };

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

        <div className="rate__grid">
          {packages.map((pkg, i) => {
            const activeIdx = selected[pkg.id] ?? 0;
            const activeSession = pkg.sessions[activeIdx];
            return (
              <motion.div
                key={pkg.id}
                className={`rate__card ${pkg.flagship ? 'rate__card--flagship' : ''}`}
                variants={cardVariants}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
              >
                {pkg.flagship && (
                  <div className="rate__card-badge">{t('rates.flagship')}</div>
                )}
                {pkg.bookingRequired && (
                  <div className="rate__card-badge rate__card-badge--booking">
                    {t('rates.bookingRequired')}
                  </div>
                )}

                <div className="rate__card-top">
                  <span className="rate__card-number">{pkg.number}</span>
                  <div className="rate__card-names">
                    <span className="rate__card-name-cn">{pkg.nameCn}</span>
                    <span className="rate__card-name-en">{pkg.nameEn}</span>
                  </div>
                </div>

                <p className="rate__card-desc">{pkg.description}</p>

                <div className="rate__sessions">
                  {pkg.sessions.map((session, j) => (
                    <button
                      key={j}
                      className={`rate__session-btn ${activeIdx === j ? 'rate__session-btn--active' : ''}`}
                      onClick={() => handleSelect(pkg.id, j)}
                    >
                      <span className="rate__session-duration">{session.duration}</span>
                      <span className="rate__session-price">{session.price}</span>
                    </button>
                  ))}
                </div>

                <div className="rate__card-footer">
                  <div className="rate__selected-price">
                    <span className="rate__selected-duration">{activeSession.duration}</span>
                    <span className="rate__selected-amount">{activeSession.price}</span>
                  </div>
                  <button className="btn btn-gold rate__book-btn">
                    <span>{t('rates.book')}</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="rate__info text-center">
          <p className="rate__hours">{t('rates.hours')}</p>
          <p className="rate__note">{t('rates.note')}</p>
        </div>
      </div>
    </section>
  );
};

export default Rate;
