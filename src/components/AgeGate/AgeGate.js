import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './AgeGate.css';

const AgeGate = ({ onEnter }) => {
  const { t } = useTranslation();
  const [exiting, setExiting] = useState(false);

  const handleEnter = () => {
    try { sessionStorage.setItem('on_age_verified', 'true'); } catch {}
    onEnter();
  };

  const handleLeave = () => {
    setExiting(true);
    setTimeout(() => {
      window.location.href = 'https://www.google.com';
    }, 500);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="agegate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="agegate__backdrop" />
          <motion.div
            className="agegate__modal"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="agegate__logo">
              <span className="agegate__logo-text">OCEAN NOIR</span>
              <div className="agegate__logo-line" />
            </div>
            <h2 className="agegate__title">{t('agegate.title')}</h2>
            <p className="agegate__body">{t('agegate.body')}</p>
            <div className="agegate__actions">
              <button className="btn btn-gold agegate__enter" onClick={handleEnter}>
                <span>{t('agegate.enter')}</span>
              </button>
              <button className="agegate__leave" onClick={handleLeave}>
                {t('agegate.leave')}
              </button>
            </div>
            <p className="agegate__disclaimer">{t('agegate.disclaimer')}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgeGate;
