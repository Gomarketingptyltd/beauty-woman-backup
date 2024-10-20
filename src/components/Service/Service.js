import React from 'react';
import './Service.css';
// Import images
import discreetIcon from '../../assets/service/discreet.svg';
import parkingIcon from '../../assets/service/parking.svg';
import newGirlIcon from '../../assets/service/girl.svg';
import happyCustomersIcon from '../../assets/service/happy.svg';
import atmIcon from '../../assets/service/atm.svg';
import acIcon from '../../assets/service/air.svg';

const Service = () => {
	const services = [
		{ icon: discreetIcon, title: 'Discreet Location', description: 'Secure & discreet location' },
		{ icon: parkingIcon, title: 'Free Parking', description: 'Huge Free Parking Lot Available' },
		{ icon: newGirlIcon, title: 'Always New Girl', description: 'The best ladies Sydney has to offer' },
		{ icon: happyCustomersIcon, title: 'Happy Customers', description: 'Get fun, safe, and sexy service' },
		{ icon: atmIcon, title: 'ATM Available', description: 'EFTPOS & ATM facilities are both available' },
		{ icon: acIcon, title: 'Air Conditioning Ready', description: 'Beauty woman is a safe and comfortable environment' }
	];

	return (
		<section className="service">
			<h1 className="service__main-title">Welcome To Beauty Woman</h1>
			<p>Top 1 in Sydney</p>
			<div className="service__container">
				{services.map((service, index) => (
					<div key={index} className="service__item">
						<img src={service.icon} alt={service.title} className="service__icon"/>
						<h3 className="service__title">{service.title}</h3>
						<p className="service__description">{service.description}</p>
					</div>
				))}
			</div>
		</section>
	);
};

export default Service;
