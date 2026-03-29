import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header/Header';
import Banner from '../components/Banner/Banner';
import Service from '../components/Service/Service';
import Rate from '../components/Rate/Rate';
import Girl from '../components/Girl/Girl';
import About from '../components/About/About';
import Footer from '../components/Footer/Footer';

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>Ocean Noir | Sydney Luxury Sensory Entertainment</title>
        <meta name="description" content={t('hero.subline')} />
      </Helmet>
      <Header />
      <main>
        <Banner />
        <Service />
        <Rate />
        <Girl />
        <About />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
