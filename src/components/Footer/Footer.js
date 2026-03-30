import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LegalModal from '../LegalModal/LegalModal';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();
  const [modal, setModal] = useState(null);

  return (
    <>
      <footer className="footer">
        <div className="footer__top">
          <div className="container footer__top-inner">

            {/* Brand */}
            <div className="footer__brand">
              <span className="footer__brand-name">OCEAN NOIR</span>
              <div className="footer__brand-line" />
              <p className="footer__tagline">{t('footer.tagline')}</p>
            </div>

            {/* Contact */}
            <div className="footer__contact">
              <p className="footer__contact-title">{t('footer.contactTitle')}</p>
              <a href="mailto:oceannoir580@gmail.com" className="footer__contact-row">
                <span className="footer__contact-icon">✉</span>
                <span>{t('footer.email')}</span>
              </a>
              <a href="tel:+61452629580" className="footer__contact-row">
                <span className="footer__contact-icon">✆</span>
                <span>
                  {t('footer.phone1')}
                  <em>{t('footer.phone1Label')}</em>
                </span>
              </a>
              <a href="tel:+61433132618" className="footer__contact-row">
                <span className="footer__contact-icon">✆</span>
                <span>
                  {t('footer.phone2')}
                  <em>{t('footer.phone2Label')}</em>
                </span>
              </a>
            </div>

            {/* Links */}
            <nav className="footer__links">
              <Link to="/join-us" className="footer__link">{t('footer.links.joinUs')}</Link>
              <button className="footer__link footer__link--btn" onClick={() => setModal('privacy')}>
                {t('footer.links.privacy')}
              </button>
              <button className="footer__link footer__link--btn" onClick={() => setModal('terms')}>
                {t('footer.links.terms')}
              </button>
            </nav>

          </div>
        </div>

        <div className="footer__bottom">
          <div className="container footer__bottom-inner">
            <p className="footer__rights">{t('footer.rights')}</p>
            <p className="footer__legal">{t('footer.legal')}</p>
          </div>
        </div>
      </footer>

      {modal && <LegalModal type={modal} onClose={() => setModal(null)} />}
    </>
  );
};

export default Footer;
