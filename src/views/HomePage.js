import React from 'react';
import Header from "../components/Header/Header";
import Banner from "../components/Banner/Banner";
import Service from "../components/Service/Service";
import Rate from "../components/Rate/Rate";

const HomePage = () => {
  return (
    <div>
			<Header />
			<Banner />
			<Service />
			<Rate />
    </div>
  );
};

export default HomePage;
