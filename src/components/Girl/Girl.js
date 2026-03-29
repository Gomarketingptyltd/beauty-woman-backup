import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './Girl.css';

const Girl = () => {
  const { t } = useTranslation();

  return (
    <section id="ladies" className="ladies section-padding">
      <div className="container">
        <div className="ladies__header text-center">
          <p className="label-gold ladies__label">{t('ladies.label')}</p>
          <h2 className="heading-section">{t('ladies.title')}</h2>
          <div className="gold-divider" />
        </div>

        <motion.div
          className="ladies__coming-soon text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="ladies__coming-icon">✦</div>
          <h3 className="ladies__coming-title">{t('ladies.comingSoonTitle')}</h3>
          <p className="ladies__coming-body">{t('ladies.comingSoonBody')}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default Girl;
