import './Data.css';
import Navbar from '../Navbar/Narvbar';
import React, { Fragment, useState } from "react";
import { Circles} from 'react-loader-spinner';
import { useNavigate, useParams} from 'react-router-dom';
import { useEffect } from 'react';

const Data = () => {

	const [data, setData] = useState(null);
	const [batchData, setBatchData] = useState(null);
	const [page, setPage] = useState(1);
	const [prev, setPrev] = useState(null);
	const [next, setNext] = useState(2);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
  	const [errorMsg, setErrorMesg] = useState('Server Error');
	const navigate = useNavigate();

	let { id } = useParams();
	
	const token = sessionStorage.getItem('token');
	const userId = sessionStorage.getItem('user_id');
	const email = sessionStorage.getItem('email');

	const url = 'http://localhost:8000/';

	useEffect(() => {

		if(!token || !userId || !email ) {navigate('/login')}
		getBatchData();
		getData();

	}, [page]);

	const getBatchData = async() =>{

		const config = {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer '+ token, 
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({'user_id': userId}),
		}

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
		setBatchData(result.payload[0].filter((x) => x.id == id)[0])
		setLoading(false)
		console.log(batchData)
	}

	const getData = async() =>{

		setLoading(true)
		const size = 10
		let query = `?size=${size}&page=${page}`

		const config = {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer '+ token, 
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({'batch_id': id}),
		}

		const response  = await fetch(`${url}/api/data/${query}`, config)
		.catch(error => {
			setLoading(false);
			setError(true); 
			setErrorMesg('Unable to connect to server')
			return
		});
	  
		setLoading(false)
		if (!response.ok) {
			setError(true); 
			if(response.status === 404) setErrorMesg('No hay data')

			if(response.status === 401){
				sessionStorage.removeItem('token');
				sessionStorage.removeItem('user_id');
				sessionStorage.removeItem('email');
				setErrorMesg('Token vencido')
				navigate('/login')
			} 

			if(response.status === 422) setErrorMesg('Unprocessable Entity')
			setPrev(false)
			setNext(false)
			return
		};

		const result = await response.json();
		console.log(result)

		if (page == 1){
			setPrev(null)
		}
		else{
			setPrev(page-1)
		}

		setNext(page + 1)

		if(result.payload[0].length < size){
			console.log('asdasdasd')
			setNext(null)
		}

		setData(result.payload[0])
		setLoading(false)
		console.log(data)
	}

	const postProcessUnprocessedData = async() =>{
		setLoading(true)

		const config = {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer '+ token, 
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({'batch_data_id': id}),
		}

		const response  = await fetch(`${url}/api/process-unprocessed-data/`, config)
		.catch(error => {
			setLoading(false);
			setError(true); 
			setErrorMesg('Unable to connect to server')
			return
		});
	  
		setLoading(false)
		if (!response.ok) {
			setError(true); 
			if(response.status === 404) setErrorMesg('No hay data')

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
		console.log(result)
		setBatchData(result.payload[0]);
	}

	const labelEmoji = {
		'POS': 'Positiva😄',
		'NEU': 'Neutral 😐',
		'NEG': 'Negativa😡',
		'others': 'Otros\u00A0\u00A0\u00A0🙃', 
		'joy': 'Alegria\u00A0😁',
		'surprise': 'Sorpresa😮',
		'anger': 'Ira\u00A0\u00A0\u00A0\u00A0\u00A0🤬', 
		'sadness': 'Tristeza😓',
		'fear': 'Miedo\u00A0\u00A0\u00A0😨',
		'disgust': 'Disgusto🤮'
	  };

	const parsePorcentual = (p) => {
		const porcentual = parseFloat(p) * 100
		return porcentual.toFixed(2);
	}

	const parseStatus = (status) => {

		if (status == 'In progress'){
			return 'En progreso'
		}

		if (status == 'Imcomplete'){
			return 'Incompleto'
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
					Data
					<span style={{cursor:'pointer'}} onClick={getData}>🔄</span>
				</div>

				<div className="response">

					{batchData  && (
						<div className='label-user'>

							<div style={{'width':'80%'}}>
								<div>Nombre: {batchData.name}</div>
								<div>Data tamaño: {batchData.size}</div>
								<div>Data procesada: {batchData.processed_data}</div>
								<div>Estado: {parseStatus(batchData.status)}</div>
							</div>
						

							{batchData.status != 'Imcomplete' ? (
								<div className='form-btn-disabled'>
									<div style={{'margin':'auto','textAlign':'center'}}>Procesesar datos faltantes</div>
								</div>
							) : (
								<div onClick={postProcessUnprocessedData} className='form-btn'>
									<div style={{'margin':'auto','textAlign':'center'}}>Procesesar datos faltantes</div>
								</div>
							)}
					
						</div>
					)}

					<br/>
					<hr className='separator'></hr>
					<br/>

					<div style={{textAlign: 'center',height:'auto', display:(!error ? 'none':'block')}}>
						{(error && errorMsg)}
					</div>

					{data && data.length == 0 && (
						<div style={{textAlign:'center'}}>No hay data</div>
					)}

					{ (data && data.length > 0) && 
						data.map((data, i) => { return( 
							<span key={i}> 

								<div className='label-user'>

									<div style={{'width':'calc(100% - 400px)'}}>
										<div>Texto: {data.text}</div>
										<div>Comentarios: {data.comments}</div>
										<div>Likes: {data.likes}</div>
										<div>Reacciones: {data.reactions}</div>
										<div>Compartidos: {data.shares}</div>
										<div>Procesado: {data.processed ? '✅' : '❌'}</div>
									</div>

									<div style={{marginLeft:'30px', width:'200px'}}>
										<div>Sentimientos:</div>
										{data.sentiments.map((sentiment, index) => (
											<div key={index}>{labelEmoji[sentiment.label]}:{parsePorcentual(sentiment.score)}%</div>
										))}
									</div>

									<div style={{marginLeft:'30px', width:'200px'}}>
										<div>Emociones:</div>
										{data.emotions.map((emotion, index) => (
											<div key={index}>{labelEmoji[emotion.label]}:{parsePorcentual(emotion.score)}%</div>
										))}
									</div>
								
								</div>

								<br/>
								<hr className='separator'></hr>
								<br/>

							</span>
						)})
					}

					<span style={{'display':'flex'}}>
						{prev && <span className='page-btn' onClick={() => {setPage(prev)}}><span>Prev</span></span>}
						<span className='page-btn'><span>Page {page}</span></span>
						{next && <span className='page-btn' onClick={() => {setPage(next)}}><span>Next</span></span>}
					</span>

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

export default Data;