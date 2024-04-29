import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

//Components

import LogIn from './components/LogIn/LogIn';
import SignUp from './components/SignUp/SignUp';
import Dashboard from './components/Dashboard/Dashboard';
import Data from './components/Data/Data';

const App = () => {
  return (
  
    <Router>
      <main className="App">

        <Routes>

          <Route exact path ='/' element={<LogIn/>} />
          <Route exact path ='/login' element={<LogIn/>} />
          <Route exact path ='/signup' element={<SignUp/>} />
          <Route exact path ='/dashboard' element={<Dashboard/>} />
          <Route exact path ='/data/:id' element={<Data/>} />
          <Route exact path ='*' element={<LogIn/>} />

        </Routes>

      </main>
    </Router>

  );
}

export default App;
