import './App.css';
import SignUpForm from "./components/SignUpForm";
import 'bootstrap/dist/css/bootstrap.min.css';
import LogInForm from "./components/LogInForm";


function App() {
  return (
    <div className="App">
      <SignUpForm/>
        <LogInForm/>
    </div>
  );
}

export default App;
