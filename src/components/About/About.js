import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './About.css';

const About = () => {
	const { t } = useTranslation();
	const [open, setOpen] = useState(null);
	const reasons = t('about.reasons', { returnObjects: true });

	return (
		<section id="about" className="about section-padding">
			<div className="container">
				<div className="about__header text-center">
					<p className="label-gold about__label">{t('about.label')}</p>
					<h2 className="heading-section">{t('about.title')}</h2>
					<div className="gold-divider" />
					<p className="about__subtitle">{t('about.subtitle')}</p>
				</div>

				<div className="about__body">
					<motion.div
						className="about__image-col"
						initial={{ opacity: 0, x: -40 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
						viewport={{ once: true }}
					>
						<div className="about__image-frame">
							<video
								className="about__image"
								src="/oc001.mp4"
								autoPlay
								muted
								loop
								playsInline
							/>
							<div className="about__image-border" />
						</div>
					</motion.div>

					<motion.div
						className="about__content-col"
						initial={{ opacity: 0, x: 40 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
						viewport={{ once: true }}
					>
						<div className="about__accordion">
							{reasons.map((item, i) => {
								const isOpen = open === i;
								return (
									<div key={i} className={`accordion-item ${isOpen ? 'accordion-item--open' : ''}`}>
										<button
											className="accordion-item__header"
											onClick={() => setOpen(isOpen ? null : i)}
											aria-expanded={isOpen}
										>
											<span className="accordion-item__index">0{i + 1}</span>
											<span className="accordion-item__title">{item.title}</span>
											<span className="accordion-item__icon">{isOpen ? '−' : '+'}</span>
										</button>
										<div className={`accordion-item__body ${isOpen ? 'accordion-item__body--open' : ''}`}>
											<p className="accordion-item__text">{item.body}</p>
										</div>
									</div>
								);
							})}
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default About;
