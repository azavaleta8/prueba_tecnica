import './Dashboard.css';
import Navbar from '../Navbar/Narvbar';
import React, { Fragment, useState } from "react";
import { Circles} from 'react-loader-spinner';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Dashboard = () => {

	const [batchData, setBatchData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
  	const [errorMsg, setErrorMesg] = useState('Server Error');
	const navigate = useNavigate();
	
	const token = sessionStorage.getItem('token');
	const userId = sessionStorage.getItem('user_id');
	const email = sessionStorage.getItem('email');

	const url = 'http://localhost:8000/';

	const config = {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer '+ token, 
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({'user_id': userId}),
	}
	
	useEffect(() => {

		if(!token || !userId || !email ) {navigate('/login')}
		getBatchData(config);

	}, []);

	const getBatchData = async(config) =>{

		setLoading(true)

		const response  = await fetch(`${url}/api/batch/`, config)
		.catch(error => {
			setLoading(false);
			setError(true); 
			setErrorMesg('Unable to connect to server')
			return
		});
	  
		setLoading(false)
		if (!response.ok) {
			setError(true); 
			if(response.status === 404) setErrorMesg('No hay lotes de data')

			if(response.status === 401){
				sessionStorage.removeItem('token');
				sessionStorage.removeItem('user_id');
				sessionStorage.removeItem('email');
				setErrorMesg('Token vencido')
				navigate('/login')
			} 

			if(response.status === 422) setErrorMesg('Unprocessable Entity')
			return
		};

		const result = await response.json();
		setBatchData(result.payload[0])
		setLoading(false)
		console.log(batchData)
	}


	const parseStatus = (status) => {

		if (status == 'In progress'){
			return 'En progreso'
		}

		if (status == 'Imcomplete'){
			return 'Imcompleto'
		}

		if (status == 'Finished'){
			return 'Terminado'
		}
			
	}

	return (
		<div className='container'>

			<Navbar/>

			<div className="Admin-container">

				<div className="title-header">
					Lotes de data
				</div>

				<div className="response">

					<div className='new-btn'>
						<span style={{'margin':'auto'}}>Nuevo Lote</span>
					</div>

					<div style={{height:'auto', display:(!error ? 'none':'block')}}>
						{(error && errorMsg)}
					</div>

					{batchData && batchData.length == 0 && (
						<div style={{textAlign:'center'}}>No hay lotes de data</div>
					)}
  
					{ (batchData && batchData.length > 0) && 
						batchData.map((batch, i) => { return( 
							<span key={i}> 

								<div className='label-user'>

									<div style={{'width':'80%'}}>
										<div>Nombre: {batch.name}</div>
										<div>Data tamaño: {batch.size}</div>
										<div>Data procesada: {batch.processed_data}</div>
										<div>Estado: {parseStatus(batch.status)}</div>
									</div>

									<span onClick={() => navigate('/data', {data: {batch}})} className='form-btn'>
										<div style={{'margin':'auto','textAlign':'center'}}>Ver data</div>
									</span>
								
								</div>

								<br/>
								<hr className='separator'></hr>
								<br/>

							</span>
						)})
					}


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

		</div>
	);
}

export default Dashboard;