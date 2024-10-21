import React, { useState, useEffect } from 'react';
import './Header.css';
import { Link } from "react-router-dom";

const Header = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	// Add scroll event listener to handle header background color change
	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 140) {
				setIsScrolled(true);
			} else {
				setIsScrolled(false);
			}
		};

		window.addEventListener("scroll", handleScroll);

		// Cleanup event listener on component unmount
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	const navItems = [
		{ name: "HOME", path: "/" },
		{ name: "SERVICE", path: "/" },
		{ name: "RATE", path: "/" },
		{ name: "GIRLS", path: "/" },
		{ name: "ABOUT", path: "/" },
		{ name: "CONTACT", path: "/" }
	];

	return (
		<header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
			<div className="header__container">
				<div className="header__logo">
					<img className="header__logo-image" src={`${process.env.PUBLIC_URL}/logo.svg`} alt="Beauty Women" />
					{/*<span className="header__logo-text">Scarlet Lady</span>*/}
				</div>
				<nav className={`header__nav ${isMenuOpen ? 'header__nav--open' : ''}`}>
					<ul className="header__nav-list">
						{navItems.map(item => (
							<li className="header__nav-item" key={item.name}>
								<Link className="header__nav-link" to={item.path}>
									{item.name}
								</Link>
							</li>
						))}
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
