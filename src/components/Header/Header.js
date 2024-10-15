import React, {useEffect, useRef} from 'react';
import './Header.css';

const Header = () => {
	const videoRef = useRef(null);
	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.playbackRate = 0.9;
		}
	}, []);

  return (
		<div>
			<video autoPlay muted loop playsInline id="bg-video" ref={videoRef}>
				<source src={`${process.env.PUBLIC_URL}/video.mp4`} type="video/mp4"/>
				Your browser does not support the video tag.
			</video>
			<div className="content-overlay">
				<h1>Pussy Cats</h1>
				<p>No.1 Asian Brothel in Melbourne</p>
			</div>
		</div>
	);
};

export default Header;
