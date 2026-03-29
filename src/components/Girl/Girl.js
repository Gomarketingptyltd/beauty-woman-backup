import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './Girl.css';
import Anna from '../../assets/girl/Anna.png';
import Ava from '../../assets/girl/Ava.png';
import Candy from '../../assets/girl/Candy.png';
import Chloe from '../../assets/girl/Chloe.png';
import Ella from '../../assets/girl/Ella.png';
import Emma from '../../assets/girl/Emma.png';
import Grace from '../../assets/girl/Grace.png';
import Isabella from '../../assets/girl/Isabella.png';
import Ivy from '../../assets/girl/Ivy.png';
import Lili from '../../assets/girl/Lili.png';
import Mia from '../../assets/girl/Mia.png';
import Olivia from '../../assets/girl/Olivia.png';
import Queen from '../../assets/girl/Queen.png';
import Ruby from '../../assets/girl/Ruby.png';
import Sophia from '../../assets/girl/Sophia.png';
import Zoe from '../../assets/girl/Zoe.png';

const ALL_LADIES = [
  { name: 'Anna',     age: 19, image: Anna },
  { name: 'Ava',      age: 26, image: Ava },
  { name: 'Candy',    age: 20, image: Candy },
  { name: 'Chloe',    age: 18, image: Chloe },
  { name: 'Ella',     age: 25, image: Ella },
  { name: 'Emma',     age: 22, image: Emma },
  { name: 'Grace',    age: 26, image: Grace },
  { name: 'Isabella', age: 28, image: Isabella },
  { name: 'Ivy',      age: 29, image: Ivy },
  { name: 'Lili',     age: 21, image: Lili },
  { name: 'Mia',      age: 18, image: Mia },
  { name: 'Olivia',   age: 25, image: Olivia },
  { name: 'Queen',    age: 26, image: Queen },
  { name: 'Ruby',     age: 19, image: Ruby },
  { name: 'Sophia',   age: 23, image: Sophia },
  { name: 'Zoe',      age: 19, image: Zoe },
];

const INITIAL_COUNT = 8;
const LOAD_MORE = 4;

const Girl = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(INITIAL_COUNT);

  return (
    <section id="ladies" className="ladies section-padding">
      <div className="container">
        <div className="ladies__header text-center">
          <p className="label-gold ladies__label">{t('ladies.label')}</p>
          <h2 className="heading-section">{t('ladies.title')}</h2>
          <div className="gold-divider" />
          <p className="ladies__subtitle">{t('ladies.subtitle')}</p>
        </div>

        <div className="ladies__grid">
          <AnimatePresence>
            {ALL_LADIES.slice(0, visible).map((lady, i) => (
              <motion.div
                key={lady.name}
                className="lady-card"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i >= visible - LOAD_MORE ? (i % LOAD_MORE) * 0.08 : 0 }}
                layout
              >
                <div className="lady-card__image-wrap">
                  <img src={lady.image} alt={lady.name} className="lady-card__image" loading="lazy" />
                  <div className="lady-card__overlay">
                    <span className="lady-card__age-tag">{t('ladies.age')} {lady.age}</span>
                  </div>
                </div>
                <div className="lady-card__info">
                  <h3 className="lady-card__name">{lady.name}</h3>
                  <span className="lady-card__age">{lady.age}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {visible < ALL_LADIES.length && (
          <div className="ladies__more-wrap text-center">
            <button
              className="btn btn-gold ladies__more-btn"
              onClick={() => setVisible(v => Math.min(v + LOAD_MORE, ALL_LADIES.length))}
            >
              <span>{t('ladies.more')}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Girl;
