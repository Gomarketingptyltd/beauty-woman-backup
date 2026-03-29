import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="container footer__top-inner">
          <div className="footer__brand">
            <span className="footer__brand-name">OCEAN NOIR</span>
            <div className="footer__brand-line" />
            <p className="footer__tagline">{t('footer.tagline')}</p>
          </div>
          <nav className="footer__links">
            <Link to="/join-us" className="footer__link">{t('footer.links.joinUs')}</Link>
            <a href="#privacy" className="footer__link">{t('footer.links.privacy')}</a>
            <a href="#terms" className="footer__link">{t('footer.links.terms')}</a>
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
  );
};

export default Footer;
