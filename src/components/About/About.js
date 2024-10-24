import React, { useState } from 'react';
import './About.css';
import sexy from '../../assets/about/about-image.jpg';

const About = () => {
	// 用于存储每个理由的展开状态
	const [expanded, setExpanded] = useState({});

	// 切换展开和隐藏
	const toggleReason = (id) => {
		setExpanded(prevState => ({
			...prevState,
			[id]: !prevState[id] // 切换当前id对应的状态
		}));
	};

	const reasons = [
		{ id: 1, title: "Best Service Guaranteed", reason: "We pride ourselves on the quality of our service, and are well known for having beautiful yet very friendly girls. Indulge your wildest fantasies with one... two or more of our lovely ladies. " },
		{ id: 2, title: "Everyday New Faces Ready", reason: "We constantly update our lineup to ensure you have new, exciting experiences." },
		{ id: 3, title: "The best ladies Melbourne ", reason: "We select only the finest and friendliest ladies for our clientele." }
	];

	return (
		<div className="about">
			<h1>Scarlet Lady Asian Brothel and Escort</h1>
			<h3>A new-style gentleman's parlour in Melbourne</h3>
			<div className="about__container">
				<div className="about__image-container">
					<img src={sexy} alt="Scarlet Lady" className="about__image" />
				</div>
				<div className="about__content">
					<h2>Why Choose Us?</h2>
					<div className="reasons">
						{reasons.map((item) => (
							<div key={item.id} className="reason">
								<div className="reason__header" onClick={() => toggleReason(item.id)}>
									<div className="reason__toggle">
										{expanded[item.id] ? '-' : '+'}
									</div>
									<h3 className="reason__title">{item.title}</h3>
								</div>
								<div
									className={`reason__description-container ${expanded[item.id] ? 'expanded' : ''}`}
								>
									<p className="reason__description">{item.reason}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default About;
