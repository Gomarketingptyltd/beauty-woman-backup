import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Header.css';

const NAV_KEYS = ['home', 'services', 'rates', 'ladies', 'about'];
const SECTION_IDS = ['hero', 'services', 'rates', 'ladies', 'about'];

const Header = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/en';
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isHome) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    SECTION_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isHome]);

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  }, []);

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('on_lang', next);
  };

  const navItems = isHome
    ? NAV_KEYS.map((k, i) => ({ key: k, sectionId: SECTION_IDS[i] }))
    : [];

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''} ${menuOpen ? 'header--open' : ''}`}>
      <div className="header__inner">
        <Link to="/" className="header__brand" onClick={() => setMenuOpen(false)}>
          <span className="header__brand-name">OCEAN NOIR</span>
          <span className="header__brand-line" />
        </Link>

        {isHome && (
          <nav className={`header__nav ${menuOpen ? 'header__nav--visible' : ''}`}>
            {navItems.map(({ key, sectionId }) => (
              <button
                key={key}
                className={`header__nav-link ${activeSection === sectionId ? 'header__nav-link--active' : ''}`}
                onClick={() => scrollTo(sectionId)}
              >
                {t(`nav.${key}`)}
              </button>
            ))}
            <Link
              to="/join-us"
              className="header__nav-link header__nav-link--join"
              onClick={() => setMenuOpen(false)}
            >
              {t('nav.joinUs')}
            </Link>
          </nav>
        )}

        <div className="header__controls">
          <button className="header__lang-btn" onClick={toggleLang} title="Switch language">
            {i18n.language === 'en' ? '中文' : 'EN'}
          </button>
          <button
            className={`header__hamburger ${menuOpen ? 'header__hamburger--open' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
