import './resources/css/App.css';
import SignUpForm from "./components/SignUpForm";
import 'bootstrap/dist/css/bootstrap.min.css';
import LogInForm from "./components/LogInForm";
import HomePage from "./components/HomePage";
import NavigationBar from "./components/NavigationBar";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import PostPage from "./components/PostPage";
import Account from "./components/Account";
import ProfileImageCrop from "./components/ProfileImageCrop";
import {useEffect, useState} from "react";
import Popup from "./components/Popup";

function App() {

    return (
        <div className="App">
            <BrowserRouter>
                <NavigationBar/>
                <div className="navbar-offset"/>
                {/* Navigation bar offset */}
                <Routes>
                    <Route exact path='/' element={<HomePage/>}/>
                    <Route path='LogInForm' element={<LogInForm/>}/>
                    <Route path='SignUpForm' element={<SignUpForm/>}/>
                    <Route path='Post' element={<PostPage/>}/>
                    <Route path='Account' element={<Account/>}/>
                    <Route path='ImageCrop' element={<ProfileImageCrop/>}/>
                    <Route path="*" element={<p>Path not resolved</p>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
