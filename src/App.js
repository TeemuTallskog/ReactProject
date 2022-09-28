import './App.css';
import SignUpForm from "./components/SignUpForm";
import 'bootstrap/dist/css/bootstrap.min.css';
import LogInForm from "./components/LogInForm";
import HomePage from "./components/HomePage";
import NavigationBar from "./components/NavigationBar";
import {BrowserRouter, Redirect, Route, Routes} from "react-router-dom";


function App() {
  return (
      <div className="App">
          <BrowserRouter>
              <Routes>
                  <Route path='/' element={<NavigationBar/>}>
                  <Route index path='/HomePage' element={<HomePage/>}/>
                  <Route path='LogInForm' element={<LogInForm/>}/>
                  <Route path='SignUpForm' element={<SignUpForm/>}/>
                </Route>
              </Routes>
          </BrowserRouter>
      </div>
  );
}

export default App;
