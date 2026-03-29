import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './Service.css';
import discreetIcon from '../../assets/service/discreet.svg';
import parkingIcon from '../../assets/service/parking.svg';
import newGirlIcon from '../../assets/service/girl.svg';
import happyCustomersIcon from '../../assets/service/happy.svg';
import atmIcon from '../../assets/service/atm.svg';
import acIcon from '../../assets/service/air.svg';

const ICONS = [discreetIcon, parkingIcon, newGirlIcon, happyCustomersIcon, atmIcon, acIcon];
const KEYS = ['discreet', 'parking', 'ladies', 'satisfaction', 'atm', 'climate'];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
};

const Service = () => {
  const { t } = useTranslation();

  return (
    <section id="services" className="service section-padding">
      <div className="container">
        <div className="service__header text-center">
          <p className="label-gold service__label">{t('services.label')}</p>
          <h2 className="heading-section service__title">{t('services.title')}</h2>
          <div className="gold-divider" />
          <p className="service__subtitle">{t('services.subtitle')}</p>
        </div>

        <motion.div
          className="service__grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {KEYS.map((key, index) => (
            <motion.div key={key} className="service__card" variants={itemVariants}>
              <div className="service__icon-wrap">
                <img src={ICONS[index]} alt={t(`services.items.${key}.title`)} className="service__icon" />
              </div>
              <h3 className="service__card-title">{t(`services.items.${key}.title`)}</h3>
              <p className="service__card-desc">{t(`services.items.${key}.desc`)}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Service;
