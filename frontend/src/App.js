import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

//Components

import LogIn from './components/LogIn/LogIn';
// import SignUp from './components/SignUp/SignUp';

const App = () => {
  return (
  
    <Router>
      <main className="App">

        <Routes>

          <Route exact path ='/' element={<LogIn/>} />
          <Route exact path ='/login' element={<LogIn/>} />
          {/* <Route exact path ='/signup' element={<SignUp/>} />
          <Route exact path ='/dashboard' element={<Dashboard/>} />
          <Route exact path ='/viewquiz' element={<ViewQuiz/>} />
          <Route exact path ='/takequiz/:id' element={<TakeQuiz/>} />
          <Route exact path ='/createquiz' element={<CreateQuiz/>} /> */}
          <Route exact path ='*' element={<LogIn/>} />

        </Routes>

      </main>
    </Router>

  );
}

export default App;
