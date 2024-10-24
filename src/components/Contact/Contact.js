import React, { useRef } from 'react';
import emailjs from '@emailjs/browser';

export const Contact = () => {
	const form = useRef();

	const sendEmail = (e) => {
		e.preventDefault();

		emailjs
			.sendForm('service_v3b8sh8', 'template_5nz8jzu', form.current, {
				publicKey: 'quWz9nRCCqTi_XmFE',
			})
			.then(
				() => {
					console.log('SUCCESS!');
				},
				(error) => {
					console.log('FAILED...', error.text);
				},
			);
	};

	return (
		<form ref={form} onSubmit={sendEmail}>
			<label>Name</label>
			<input type="text" name="user_name"/>
			<label>Email</label>
			<input type="email" name="user_email"/>
			<label>Password</label>
			<input type="password" name="user_password"/>
			<label>Message</label>
			<textarea name="message"/>
			<input type="submit" value="Send"/>
		</form>
	);
};
