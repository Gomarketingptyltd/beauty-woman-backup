import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './JoinUs.css';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: [0.4, 0, 0.2, 1] },
});

const JoinUs = () => {
  const { t } = useTranslation();
  const perks = t('joinUs.perks.items', { returnObjects: true });
  const roles = [
    { key: 'companion',   icon: '✦' },
    { key: 'reception',   icon: '◆' },
    { key: 'housekeeping',icon: '◇' },
    { key: 'specialist',  icon: '✧' },
  ];

  const [form, setForm] = useState({ name: '', phone: '', role: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const applyRoles = t('joinUs.apply.roles', { returnObjects: true });

  return (
    <>
      <Helmet>
        <title>Join Us | Ocean Noir</title>
        <meta name="description" content="Career opportunities at Ocean Noir — Sydney's premier luxury sensory entertainment venue." />
      </Helmet>
      <Header />

      <main className="joinus">
        {/* ── Hero ───────────────────────────────────── */}
        <section className="joinus__hero">
          <div className="joinus__hero-overlay" />
          <div className="joinus__hero-content text-center">
            <motion.p className="label-gold" {...fadeUp(0.2)}>{t('joinUs.hero.label')}</motion.p>
            <motion.h1 className="joinus__hero-title heading-display" {...fadeUp(0.4)}>
              {t('joinUs.hero.title')}
            </motion.h1>
            <motion.div className="gold-divider" {...fadeUp(0.55)} />
            <motion.p className="joinus__hero-subtitle" {...fadeUp(0.65)}>
              {t('joinUs.hero.subtitle')}
            </motion.p>
          </div>
        </section>

        {/* ── Notice ─────────────────────────────────── */}
        <section className="joinus__notice-band">
          <div className="container">
            <p className="joinus__notice">⚠ {t('joinUs.notice')}</p>
          </div>
        </section>

        {/* ── Roles ──────────────────────────────────── */}
        <section className="joinus__roles section-padding">
          <div className="container">
            <div className="joinus__section-head text-center">
              <p className="label-gold">{t('joinUs.roles.label')}</p>
              <h2 className="heading-section">{t('joinUs.roles.title')}</h2>
              <div className="gold-divider" />
            </div>

            <div className="joinus__roles-grid">
              {roles.map(({ key, icon }, i) => {
                const role = t(`joinUs.roles.${key}`, { returnObjects: true });
                return (
                  <motion.div key={key} className="role-card" {...fadeUp(i * 0.12)}>
                    <div className="role-card__icon">{icon}</div>
                    <div className="role-card__header">
                      <h3 className="role-card__title">{role.title}</h3>
                      <span className="role-card__count">{role.count}</span>
                    </div>
                    <ul className="role-card__paths">
                      {role.paths.map((p, j) => (
                        <li key={j} className="role-card__path">{p}</li>
                      ))}
                    </ul>
                    <div className="role-card__pay-block">
                      <span className="role-card__pay">{role.pay}</span>
                      <span className="role-card__pay-note">{role.payNote}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Perks ──────────────────────────────────── */}
        <section className="joinus__perks section-padding">
          <div className="container">
            <div className="joinus__section-head text-center">
              <p className="label-gold">{t('joinUs.perks.label')}</p>
              <h2 className="heading-section">{t('joinUs.perks.title')}</h2>
              <div className="gold-divider" />
            </div>
            <div className="joinus__perks-grid">
              {perks.map((item, i) => (
                <motion.div key={i} className="perk-card" {...fadeUp(i * 0.1)}>
                  <h4 className="perk-card__title">{item.title}</h4>
                  <p className="perk-card__body">{item.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Apply Form ─────────────────────────────── */}
        <section className="joinus__apply section-padding">
          <div className="container">
            <div className="joinus__section-head text-center">
              <h2 className="heading-section">{t('joinUs.apply.title')}</h2>
              <div className="gold-divider" />
              <p className="joinus__apply-subtitle">{t('joinUs.apply.subtitle')}</p>
            </div>

            {submitted ? (
              <motion.p
                className="joinus__success text-center"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {t('joinUs.apply.success')}
              </motion.p>
            ) : (
              <form className="joinus__form" onSubmit={handleSubmit}>
                <div className="joinus__form-row">
                  <div className="form-field">
                    <input
                      type="text"
                      name="name"
                      className="form-field__input"
                      placeholder={t('joinUs.apply.namePlaceholder')}
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <input
                      type="text"
                      name="phone"
                      className="form-field__input"
                      placeholder={t('joinUs.apply.phonePlaceholder')}
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-field">
                  <select
                    name="role"
                    className="form-field__input form-field__select"
                    value={form.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>{t('joinUs.apply.rolePlaceholder')}</option>
                    {applyRoles.map((r, i) => (
                      <option key={i} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <textarea
                    name="message"
                    className="form-field__input form-field__textarea"
                    placeholder={t('joinUs.apply.messagePlaceholder')}
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
                <div className="text-center">
                  <button type="submit" className="btn btn-gold joinus__submit">
                    <span>{t('joinUs.apply.submit')}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default JoinUs;
