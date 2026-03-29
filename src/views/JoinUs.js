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

        {/* ── Japanese Recruitment ────────────────────── */}
        <section className="joinus__jp section-padding">
          <div className="container">
            <div className="jp__header text-center">
              <p className="jp__lang-tag">日本語 / Japanese</p>
              <h2 className="jp__headline">
                【Ocean Noir】<br />
                シドニー27年の信頼 × 究極のニューオープン
              </h2>
              <p className="jp__tagline">
                「稼げる金額、客層の質、環境の美しさ。<br className="jp__br" />
                そのすべてが、シドニーNo.1。」
              </p>
            </div>

            <div className="jp__intro">
              <p className="jp__body">
                シドニーで27年間、常に業界の頂点に君臨し続けてきた
                <strong>「Babylonグループ」</strong>。
                その圧倒的な実績と世界中のVVIPネットワークを継承し、
                満を持して誕生したのが最高級フラッグシップ店
                <strong>『Ocean Noir』</strong>です。
              </p>
            </div>

            <div className="jp__earn-block">
              <div className="jp__earn-header">
                <span className="jp__earn-icon">💰</span>
                <h3 className="jp__earn-title">圧倒的な収益力</h3>
                <span className="jp__earn-sub">「時給」という概念は、もういりません。</span>
              </div>
              <div className="jp__earn-grid">
                <div className="jp__earn-card">
                  <span className="jp__earn-label">日収目安</span>
                  <span className="jp__earn-amount">$2,000 ～ $5,000＋＋</span>
                </div>
                <div className="jp__earn-card jp__earn-card--gold">
                  <span className="jp__earn-label">月収目安</span>
                  <span className="jp__earn-amount">1,500万円 ～ 5,000万円以上</span>
                </div>
              </div>
              <p className="jp__earn-note">
                モデル・タレント・AV経験者の方は、特別待遇にて完全バックアップ。<br />
                新店オープンにつき、現在シドニーで最も集客力があり、稼げるチャンスが広がっています。
              </p>
            </div>

            <div className="jp__reasons">
              <h3 className="jp__reasons-title">
                <span className="jp__diamond">💎</span>
                【Ocean Noir】が選ばれる3つの絶対的理由
              </h3>
              <div className="jp__reasons-grid">
                <div className="jp__reason-card">
                  <div className="jp__reason-num">1</div>
                  <h4 className="jp__reason-title">27年の実績が約束する「最高峰のVVIP客層」</h4>
                  <p className="jp__reason-body">
                    私たちが27年かけて築き上げたのは、紳士的な超富裕層との深い絆です。
                    新店ながら、BabylonグループのVIP顧客をそのまま引き継いでいるため、
                    入店初日から最高級の客層を接客することが可能です。
                  </p>
                </div>
                <div className="jp__reason-card">
                  <div className="jp__reason-num">2</div>
                  <h4 className="jp__reason-title">ニューオープン：全室スイート仕様の「宮殿空間」</h4>
                  <p className="jp__reason-body">
                    数億円を投じた内装は、ヨーロッパの宮殿を彷彿とさせる異空間。
                    女の子一人ひとりに用意された「完全個室のプライベート・スイート」は、
                    あなたのプライバシーと尊厳を完璧に守ります。女の子同士の接触も一切ありません。
                  </p>
                </div>
                <div className="jp__reason-card">
                  <div className="jp__reason-num">3</div>
                  <h4 className="jp__reason-title">日本人マネージャーによる「24時間フルサポート」</h4>
                  <p className="jp__reason-body">
                    シドニーを知り尽くした日本人マネージャーが、お仕事から高級マンションの手配、
                    VISAの相談まで親身に対応。英語が話せなくても、
                    日本にいるような安心感でお仕事をスタートできます。
                  </p>
                </div>
              </div>
            </div>

            <div className="jp__welcome">
              <h3 className="jp__welcome-title">✈️ 日本からの応募、未経験の方も大歓迎！</h3>
              <div className="jp__welcome-grid">
                <div className="jp__welcome-item">
                  <span className="jp__welcome-dot" />
                  <div>
                    <strong>新店オープニング特典</strong>
                    <p>今なら最優先のシフト枠と特別ボーナスをご用意。</p>
                  </div>
                </div>
                <div className="jp__welcome-item">
                  <span className="jp__welcome-dot" />
                  <div>
                    <strong>清潔・安全・高待遇</strong>
                    <p>衛生管理も徹底。シドニーで最も安全に、最もクリーンに働ける環境です。</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="jp__cta text-center">
              <p className="jp__cta-quote">
                「27年の信頼を背負った、新しい伝説がここから始まる。」
              </p>
              <p className="jp__cta-body">
                今の生活を劇的に変えたい。最高の自分に出会いたい。<br />
                そんなあなたの勇気を、私たちは最高待遇でお待ちしております。
              </p>
              <p className="jp__cta-contact">お問い合わせは24時間受付中。まずはLINEで「理想の働き方」を教えてください。</p>
              <a href="#apply" className="btn btn-gold jp__apply-btn">
                <span>今すぐ応募する</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default JoinUs;
