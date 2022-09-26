import './App.css';
import SignUpForm from "./components/SignUpForm";
import 'bootstrap/dist/css/bootstrap.min.css';
import LogInForm from "./components/LogInForm";
import PostForm from "./components/PostForm";


function App() {
  return (
    <div className="App">
      <SignUpForm/>
        <LogInForm/>
        <PostForm/>
    </div>
  );
}

export default App;
