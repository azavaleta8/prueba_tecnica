import './Navbar.css';
import React, { useState} from "react";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {

  const [label, setLabel] =  useState('Cerrar Sesion');
  const navigate = useNavigate();
  const email = sessionStorage.getItem('email');

  const logOut = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user_id');
    sessionStorage.removeItem('email');
    navigate('/login');
  }

  return (
    <div className='navbar'>
      
      <div ><span className="l" onClick={() => navigate('/dashboard')}>{email}</span></div>
      <div onClick={logOut}><span className="r">{label}</span></div>
      
    </div>
  );
}
  
export default Navbar;