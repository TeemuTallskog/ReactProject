import './App.css';
import SignUpForm from "./components/SignUpForm";
import 'bootstrap/dist/css/bootstrap.min.css';
import LogInForm from "./components/LogInForm";
import PostForm from "./components/PostForm";
import HomePage from "./components/HomePage";


function App() {
  return (
    <div className="App">
      <SignUpForm/>
        <LogInForm/>
        <PostForm/>
      <HomePage/>
    </div>
  );
}

export default App;
