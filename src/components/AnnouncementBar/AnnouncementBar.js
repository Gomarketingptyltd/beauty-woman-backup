import React from 'react';
import { useTranslation } from 'react-i18next';
import './AnnouncementBar.css';

const AnnouncementBar = () => {
  const { t } = useTranslation();

  return (
    <div className="announcement-bar">
      <div className="announcement-bar__track">
        <span className="announcement-bar__item">
          <span className="announcement-bar__dot" />
          {t('announcement.text')}
          <span className="announcement-bar__dot" />
          {t('announcement.text')}
          <span className="announcement-bar__dot" />
          {t('announcement.text')}
          <span className="announcement-bar__dot" />
          {t('announcement.text')}
          <span className="announcement-bar__dot" />
          {t('announcement.text')}
          <span className="announcement-bar__dot" />
          {t('announcement.text')}
          <span className="announcement-bar__dot" />
          {t('announcement.text')}
          <span className="announcement-bar__dot" />
          {t('announcement.text')}
        </span>
      </div>
    </div>
  );
};

export default AnnouncementBar;
