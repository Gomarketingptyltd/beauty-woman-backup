import React from 'react';
import './Banner.css';

const Banner = () => {
	return (
		<div className="banner banner--full-width">
			<div className="banner__content">
				<h1 className="banner__title">Beauty Women</h1>
				<p className="banner__subtitle">Top 1 Brothel in Sydney</p>
				<p className="banner__status">Open 7 days! 24h!</p>
				<button className="banner__button">Read More</button>
			</div>
		</div>
	);
};

export default Banner;
