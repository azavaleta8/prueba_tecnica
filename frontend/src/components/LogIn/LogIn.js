import './LogIn.css';
import React, { useState, useEffect} from "react";
import { Circles} from 'react-loader-spinner';
import { useNavigate } from 'react-router-dom';

const LogIn = () => {
  	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [errorMsg, setErrorMesg] = useState('Server Error');
	const token = sessionStorage.getItem('token');
	const userId = sessionStorage.getItem('user_id');
	const emailSS = sessionStorage.getItem('email');

	const isValidEmail = (email) => {
	// eslint-disable-next-line no-useless-escape
		return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email) && email.length <= 50;
	}

	useEffect(() => {
		if(token && userId && emailSS ) {navigate('/dashboard')}
	}, []);

	
	// const isValidPassword = (pass) => {
	// 	return  pass.length >= 8 && pass.length <= 25;
	// }

	const handleChangeUser= (e) => {
		setEmail(e.target.value)
	}

	const handleChangePassword= (e) => {
		setPassword(e.target.value)
	}

	const handleSubmit = async(e) => {

		e.preventDefault();
		setLoading(true);

		if (!isValidEmail(email)) {
			setLoading(false);
			setError(true); 
			setErrorMesg('Email or password invalid');
			return
		}

		let payload = JSON.stringify({
			email,
			password
		})

		console.log(payload)

		let response = await fetch('http://localhost:8000/api/login/', {
			method: 'POST',
			headers: {
			'Content-Type': 'application/json',
			},
			body: payload,
		}).catch(error => {
			console.log(error)
			setLoading(false);
			setError(true); 
			setErrorMesg('Unable to connect to server')
			return
		});

		if (!response){
			return
		}

		if (!response.ok) {
			setError(true); 
			setLoading(false);
			if(response.status === 404) setErrorMesg('No data')
			if(response.status === 401) setErrorMesg('Credenciales Invalidas')
			if(response.status === 422) setErrorMesg('Unprocessable Entity')
			return
		};

		const result = await response.json();
		console.log(result)
		sessionStorage.setItem('token', result.payload.access_token);
		sessionStorage.setItem('user_id', result.payload.user_id);
		sessionStorage.setItem('email', email);
		navigate('/dashboard');
	}

	return (
		<div className="LogIn">

			<div className="title-header">
				Bienvenido
			</div>

			<form style={{display:(loading ? 'none':'block')}} className="form-container" onSubmit={handleSubmit}>

				<input type="text" onChange={handleChangeUser} value = {email} placeholder="Correo" maxlength="50"></input>
				<input type="password" onChange={handleChangePassword} value = {password} placeholder="Contraseña" maxlength="25"></input>

				<div style={{height:'auto', display:(!error ? 'none':'block')}}>
					{(error && errorMsg)}
				</div>

				<button  style={{marginBottom: '10px'}} type="submit" disabled={email === '' || password ===''}>Iniciar Sesion</button>

			</form>

			<div style={{display:(loading ? 'none':'flex')}} className='link' onClick={()=> navigate('/signup')}>
				<span>Registrate</span>
			</div>

			<div className="spinner" style={{display:(!loading ? 'none':'flex')}}>
			<Circles
				visible = {loading}
				color="#282c34"
				height={150}
				width={150}
			/>
			</div>

		</div>
	);
}
  
  export default LogIn;