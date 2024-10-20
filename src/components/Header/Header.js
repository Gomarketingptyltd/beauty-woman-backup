import React, { useState } from 'react';
import './Header.css';

const Header = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	return (
		<header className="header">
			<div className="header__container">
				<div className="header__logo">
					<img className="header__logo-image" src={`${process.env.PUBLIC_URL}/logo.png`} alt="Beauty Women" />
					{/*<span className="header__logo-text">Scarlet Lady</span>*/}
				</div>
				<nav className={`header__nav ${isMenuOpen ? 'header__nav--open' : ''}`}>
					<ul className="header__nav-list">
						<li className="header__nav-item"><a className="header__nav-link" href="#home">Home</a></li>
						<li className="header__nav-item"><a className="header__nav-link" href="#service">Service</a></li>
						<li className="header__nav-item"><a className="header__nav-link" href="#rate">Rate</a></li>
						<li className="header__nav-item"><a className="header__nav-link" href="#girls">Girls</a></li>
						<li className="header__nav-item"><a className="header__nav-link" href="#about">About</a></li>
						<li className="header__nav-item"><a className="header__nav-link" href="#contact">Contact</a></li>
					</ul>
				</nav>
				<div className="header__hamburger-menu" onClick={toggleMenu}>
					<div className="header__hamburger-bar"></div>
					<div className="header__hamburger-bar"></div>
					<div className="header__hamburger-bar"></div>
				</div>
			</div>
		</header>
	);
};

export default Header;
