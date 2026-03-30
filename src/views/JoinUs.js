import React from 'react';
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

        {/* ── Contact ────────────────────────────────── */}
        <section id="apply" className="joinus__apply section-padding">
          <div className="container">
            <div className="joinus__section-head text-center">
              <p className="label-gold">{t('joinUs.apply.contactLabel')}</p>
              <h2 className="heading-section">{t('joinUs.apply.title')}</h2>
              <div className="gold-divider" />
              <p className="joinus__apply-subtitle">{t('joinUs.apply.subtitle')}</p>
            </div>

            <div className="contact-grid">

              {/* Email */}
              <motion.a
                href="mailto:oceannoir580@gmail.com"
                className="contact-card"
                {...fadeUp(0.1)}
              >
                <div className="contact-card__icon">✉</div>
                <div className="contact-card__info">
                  <span className="contact-card__label">{t('joinUs.apply.emailLabel')}</span>
                  <span className="contact-card__value">oceannoir580@gmail.com</span>
                </div>
              </motion.a>

              {/* Phone 1 */}
              <motion.a
                href="tel:+61452629580"
                className="contact-card"
                {...fadeUp(0.2)}
              >
                <div className="contact-card__icon">✆</div>
                <div className="contact-card__info">
                  <span className="contact-card__label">{t('joinUs.apply.phoneLabel')}</span>
                  <span className="contact-card__value">0452 629 580</span>
                </div>
              </motion.a>

              {/* Phone 2 Japanese */}
              <motion.a
                href="tel:+61433132618"
                className="contact-card"
                {...fadeUp(0.3)}
              >
                <div className="contact-card__icon">✆</div>
                <div className="contact-card__info">
                  <span className="contact-card__label">{t('joinUs.apply.phoneJpLabel')}</span>
                  <span className="contact-card__value">0433 132 618</span>
                  <span className="contact-card__note">日本語対応</span>
                </div>
              </motion.a>

              {/* LINE */}
              <motion.a
                href="https://line.me/ti/p/@347chmhh"
                target="_blank"
                rel="noreferrer"
                className="contact-card"
                {...fadeUp(0.35)}
              >
                <div className="contact-card__icon" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#06C755' }}>LINE</div>
                <div className="contact-card__info">
                  <span className="contact-card__label">LINE · 日本語対応</span>
                  <span className="contact-card__value">@347chmhh</span>
                  <span className="contact-card__note">日本からも繋がれます</span>
                </div>
              </motion.a>

              {/* WhatsApp QR */}
              <motion.div className="contact-card contact-card--qr" {...fadeUp(0.4)}>
                <div className="contact-card__icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div className="contact-card__info">
                  <span className="contact-card__label">WhatsApp</span>
                  <span className="contact-card__value">Ocean Noir</span>
                </div>
                <div className="contact-card__qr-wrap">
                  <img
                    src="/whatsapp-qr.png"
                    alt="WhatsApp QR Code"
                    className="contact-card__qr"
                  />
                  <p className="contact-card__qr-hint">{t('joinUs.apply.qrHint')}</p>
                </div>
              </motion.div>

            </div>
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
              <p className="jp__cta-contact">お問い合わせは24時間受付中。LINEまたはWhatsAppで「理想の働き方」を教えてください。<br /><strong style={{color:'var(--color-gold)'}}>LINE ID: @347chmhh</strong></p>
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
