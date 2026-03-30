import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './LegalModal.css';

const LegalModal = ({ type, onClose }) => {
  const { t } = useTranslation();
  const doc = t(`legal_docs.${type}`, { returnObjects: true });
  const sections = Array.isArray(doc?.sections) ? doc.sections : [];

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="lm-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      >
        <motion.div
          className="lm-panel"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="lm-header">
            <div>
              <p className="label-gold lm-label">Ocean Noir</p>
              <h2 className="lm-title">{doc?.title}</h2>
            </div>
            <button className="lm-close" onClick={onClose} aria-label="Close">✕</button>
          </div>

          <div className="lm-body">
            {sections.map((sec, i) => (
              <div key={i} className="lm-section">
                <h3 className="lm-section-heading">{sec.heading}</h3>
                <p className="lm-section-body">{sec.body}</p>
              </div>
            ))}
          </div>

          <div className="lm-footer">
            <button className="btn btn-gold lm-close-btn" onClick={onClose}>
              <span>Close</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LegalModal;
