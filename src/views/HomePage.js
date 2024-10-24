import React from 'react';
import Header from "../components/Header/Header";
import Banner from "../components/Banner/Banner";
import Service from "../components/Service/Service";
import Rate from "../components/Rate/Rate";
import Girl from "../components/Girl/Girl";
import About from "../components/About/About";
// import {Contact} from "../components/Contact/Contact";

const HomePage = () => {
  return (
    <div>
			<Header />
			<Banner />
			<Service />
			<Rate />
			<Girl />
			<About />
			{/*<Contact />*/}
    </div>
  );
};

export default HomePage;
