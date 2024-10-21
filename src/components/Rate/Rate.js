import React from 'react';
import './Rate.css';
import woman from '../../assets/rate/woman.svg';
import room from '../../assets/rate/room.svg';

const Rate = () => {
	const rates = [
		{ id: 1, duration: "30 Minutes", price: "$150", lady: "$90", room: "$60" },
		{ id: 2, duration: "45 Minutes", price: "$200", lady: "$120", room: "$80" },
		{ id: 3, duration: "1 Hour", price: "$250", lady: "$150", room: "$100" }
	];

	return (
		<div className="rate">
			<div className="rate__container">
				{rates.map(rate => (
					<div key={rate.id} className="rate__item">
						<div className="rate__prices">
							<div className="rate__price">{rate.price}</div>
							<div className="rate__duration">Service: {rate.duration}</div>
						</div>
						<div className="rate__breakdown">
							<div className="rate__breakdown-item rate__breakdown-item-top">
								<img src={woman} className="rate__icon" alt="woman"/>
								<span>Lady: {rate.lady}</span>
							</div>
							<div className="rate__breakdown-item">
								<img src={room} className="rate__icon" alt="woman"/>
								<span>Room: {rate.room}</span>
							</div>
						</div>
					</div>
				))}
			</div>
			<div className="rate__running-hour">
				We're open Sunday to Thursday from 10am to 5am. And Friday and Saturday we are open 24 hours.
			</div>
			<p className="rate__other">
				These rates are fully inclusive of erotic massage, oral and sex services. Depending on the services you want,
				some of our girls will charge extra. To make sure you have the best possible time, discuss your desires with our
				team. We'll find you someone who offers the services you're after.
			</p>
		</div>
	);
};

export default Rate;
