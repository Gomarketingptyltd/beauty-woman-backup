import React from 'react';
import Header from "../components/Header/Header";
import Banner from "../components/Banner/Banner";
import Service from "../components/Service/Service";
import Rate from "../components/Rate/Rate";
import Girl from "../components/Girl/Girl";

const HomePage = () => {
  return (
    <div>
			<Header />
			<Banner />
			<Service />
			<Rate />
			<Girl />
    </div>
  );
};

export default HomePage;
