import './SignUp.css';
import React, { useState, useEffect} from "react";
import { Circles} from 'react-loader-spinner';
import { useNavigate } from 'react-router-dom';

const LogIn = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [password2, setPassword2] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [errorMsg, setErrorMesg] = useState('Server Error');
	const [successMessage, setSuccessMessage] = useState('');
	const token = sessionStorage.getItem('token');
	const userId = sessionStorage.getItem('user_id');
	const emailSS = sessionStorage.getItem('email');

	useEffect(() => {
		if(token && userId && emailSS ) {navigate('/dashboard')}
	}, []);

	const isValidEmail = (email) => {
	// eslint-disable-next-line no-useless-escape
		return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email) && email.length <= 50;
	}

	const isValidPassword = (pass) => {
		// return  pass.length >= 8 && pass.length <= 25;
		return  true;
	}

	const isValidConfirmPass = (pass, pass2) => {
		return  pass === pass2;
	}

	const handleChangeUser= (e) => {
		setEmail(e.target.value)
	}

	const handleChangePassword= (e) => {
		setPassword(e.target.value)
	}

	const handleChangePassword2 = (e) => {
		setPassword2(e.target.value)
	}

	const handleSubmit = async(e) => {

		e.preventDefault();
		setLoading(true);

		if (!isValidEmail(email) || !isValidPassword(password) || !isValidConfirmPass(password, password2)) {
			setLoading(false);
			setError(true); 
			setErrorMesg('Correo or Contraseña invalidas');
			return
		}

		let payload = JSON.stringify({
			email,
			password
		})

		console.log(payload)

		let response = await fetch('http://localhost:8000/api/users/', {
			method: 'POST',
			headers: {
			'Content-Type': 'application/json',
			},
			body: payload,
		}).catch(error => {
			setLoading(false);
			setError(true); 
			setErrorMesg('Unable to connect to server')
			return
		});

		setLoading(false)

		if (!response){
			return
		}

		if (!response.ok) {
			setError(true); 
			setLoading(false);
			if(response.status === 404) setErrorMesg('No data')
			if(response.status === 401) setErrorMesg('Invalid Credentials')
			if(response.status === 422) setErrorMesg('Unprocessable Entity')
			return
		};

		const result = await response.json();
		setSuccessMessage('Registro exitoso, por favor inicia sesión');
        setTimeout(() => {
            navigate('/login');
        }, 5000); // Redirige al login después de 3 segundos
	}

	return (
	<div className="LogIn">

		<div className="title-header">
			Registro
		</div>

		<form style={{display:(loading || successMessage ? 'none':'block')}} className="form-container" onSubmit={handleSubmit}>

			<input type="text" onChange={handleChangeUser} value = {email} placeholder="Correo" maxlength="50"></input>
			<input type="password" onChange={handleChangePassword} value = {password} placeholder="Contraseña" maxlength="25"></input>
			<input type="password" onChange={handleChangePassword2} value = {password2} placeholder="Repetir Contraseña" maxlength="25"></input>

			<div style={{height:'auto', display:(!error ? 'none':'block')}}>
				{(error && errorMsg)}
			</div>

			<button  style={{marginBottom: '10px'}} type="submit" disabled={email === '' || password ==='' || password2 ===''}>Registrarse</button>

		</form>

		<div style={{ height: 'auto', marginBottom: '10px', textAlign: 'center', display: (!successMessage ? 'none' : 'block') }}>
            	{successMessage}
        </div>

		<div style={{display:(loading ? 'none':'flex')}} className='link' onClick={()=> navigate('/login')}>
			<span>Iniciar Sesion</span>
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