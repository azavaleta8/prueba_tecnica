import './Dashboard.css';
import Navbar from '../Navbar/Narvbar';
import React, {useState, useEffect} from "react";
import { Circles} from 'react-loader-spinner';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {

	const [batchData, setBatchData] = useState(null);
	const [newBatchName, setNewBatchName] = useState(null);
	const [newBatchFile, setNewBatchFile] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
  	const [errorMsg, setErrorMesg] = useState('Server Error');
	const [showNewBatchForm, setShowNewBatchForm] = useState(false);
	const navigate = useNavigate();
	
	const token = sessionStorage.getItem('token');
	const userId = sessionStorage.getItem('user_id');
	const email = sessionStorage.getItem('email');
	

	const url = 'http://localhost:8000';

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
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

		if (!response){
			return
		}

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

		if (status === 'In progress'){
			return 'En progreso'
		}

		if (status === 'Imcomplete'){
			return 'Incompleto'
		}

		if (status === 'Finished'){
			return 'Terminado'
		}
			
	}

    const handleNewBatchClick = () => {
        setShowNewBatchForm(true);
		console.log(showNewBatchForm)
    };

	const handleFormSubmit = async(event) => {
        event.preventDefault();
        
		setLoading(true)

		const formData = new FormData();
		formData.append('name', newBatchName);
		formData.append('file', newBatchFile, newBatchFile.name); // Agregamos el nombre del archivo
		formData.append('user_id', userId);

		const config = {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + token
			},
			body: formData
		};

		const response  = await fetch(`${url}/api/process-data/`, config)
		.catch(error => {
			setLoading(false);
			setError(true); 
			setErrorMesg('Unable to connect to server')
			return
		});
		
		console.log(response)
		setLoading(false)

		if (!response){
			return
		}
		
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
		const batchId = result.payload[0].id
		console.log(result.payload[0])
		navigate(`/data/${batchId}`)

    };

	const handleChangeNewBatchName = (e) => {
		setNewBatchName(e.target.value)
	}

	const handleChangeNewBatchFile = (e) => {
		const file = e.target.files[0];
	  
		if (file) {
			const fileName = file.name;
			const fileType = file.type;
		
			if (fileType === 'text/csv') {
				setError(false);
				console.log('Archivo CSV seleccionado:', fileName);
				setNewBatchFile(file);
			} else {
				setError(true);
				setErrorMesg('El archivo no esta en formato CSV')
				console.log('Error: Selecciona un archivo CSV válido.');
				
			}
		}
	};

	const handleRefreshClick = () => {
		getBatchData(config);
	};

	return (
		<div className='container'>

			<Navbar/>

			<div className="Admin-container">

				<div className="title-header">
					Lotes de data
					<span style={{cursor:'pointer'}} onClick={handleRefreshClick}>🔄</span>
				</div>

				<div className="response">

					{!showNewBatchForm && (
						<div className='new-btn' onClick={handleNewBatchClick}>
							<span style={{'margin':'auto'}}>Nuevo Lote</span>
						</div>
					)}

					{showNewBatchForm && (
                        <form onSubmit={handleFormSubmit}>

							<div className='div-input'>
								<div>
									<input type="file" accept="text/csv, application/csv" onChange={handleChangeNewBatchFile}/>
									<input type="text" onChange={handleChangeNewBatchName} value = {newBatchName} placeholder="Nombre" maxlength="50"></input>
								</div>
							</div>

							<button  className='new-btn' type="submit" disabled={newBatchName === null || newBatchFile === null}>
								<span>Crear Lote</span>
							</button>

							<div style={{height:'auto', display:(!error ? 'none':'block')}}>
								{(error && errorMsg)}
							</div>

                        </form>
                	)}

					<br/>
					<hr className='separator'></hr>
					<br/>

					<div style={{height:'auto', display:(!error ? 'none':'block')}}>
						{(error && errorMsg)}
					</div>

					{batchData && batchData.length === 0 && (
						<div style={{'textAlign':'center'}}>No hay lotes de data</div>
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

									<span onClick={() => navigate(`/data/${batch.id}`)} className='form-btn'>
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