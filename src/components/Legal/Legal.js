import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './Legal.css';

const LegalSection = ({ labelKey, titleKey, subtitleKey, bodyKey, icon }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const body = t(bodyKey, { returnObjects: true });
  const paragraphs = Array.isArray(body) ? body : [body];

  return (
    <motion.div
      className="legal-item"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <button className="legal-item__header" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <div className="legal-item__title-group">
          <span className="legal-item__icon">{icon}</span>
          <div>
            <p className="label-gold legal-item__label">{t(labelKey)}</p>
            <h3 className="legal-item__title">{t(titleKey)}</h3>
            {subtitleKey && <p className="legal-item__subtitle">{t(subtitleKey)}</p>}
          </div>
        </div>
        <span className={`legal-item__chevron ${open ? 'legal-item__chevron--open' : ''}`}>›</span>
      </button>

      <div className={`legal-item__body ${open ? 'legal-item__body--open' : ''}`}>
        <div className="legal-item__body-inner">
          {paragraphs.map((para, i) => (
            <p key={i} className="legal-item__para">{para}</p>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const Legal = () => {
  const { t } = useTranslation();

  return (
    <section className="legal section-padding">
      <div className="container">
        <div className="legal__header text-center">
          <p className="label-gold legal__label">{t('compliance.disclaimer.label')}</p>
          <div className="gold-divider" />
        </div>
        <div className="legal__items">
          <LegalSection
            labelKey="compliance.accessibility.label"
            titleKey="compliance.accessibility.title"
            subtitleKey="compliance.accessibility.subtitle"
            bodyKey="compliance.accessibility.body"
            icon="♿"
          />
          <LegalSection
            labelKey="compliance.disclaimer.label"
            titleKey="compliance.disclaimer.title"
            bodyKey="compliance.disclaimer.body"
            icon="⚖"
          />
        </div>
      </div>
    </section>
  );
};

export default Legal;
