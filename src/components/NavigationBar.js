import {Nav, Navbar, NavLink, Row} from "react-bootstrap";
import {Outlet, Link} from "react-router-dom";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import AutocompleteUserSearch from "./AutocompleteUserSearch";
import '../resources/css/navigationBar.css';
import {Form, FormCheck} from 'react-bootstrap';
import {useEffect, useState} from "react";
import NightsStayIcon from '@mui/icons-material/NightsStay';
import CustomUserSearch from "./CustomUserSearch";
import {useNavigate, createSearchParams} from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import profileImg from "../resources/images/profile_img_default.png";
import axios from "axios";


function NavigationBar() {

    const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") ? true : false);
    const [profilePicture, setProfilePicture] = useState(profileImg);
    const navigate = useNavigate();
    useEffect(() => {
        if (darkMode) {
            localStorage.setItem("darkMode", "true");
            document.body.classList.add("dark");
        } else {
            localStorage.removeItem("darkMode");
            document.body.classList.remove("dark");
        }
    }, [darkMode]);

    const logout = () => {
        localStorage.setItem("accessToken", "");
        localStorage.setItem("username", "");
        localStorage.setItem("user-id", "");
        window.location.reload(false);
    }

    const navigateToUser = (e) =>{
        e.stopPropagation();
        navigate({pathname: '/Account', search: `?${createSearchParams({username: localStorage.getItem("username")})}`})
    }

    const fetchProfilePicture = () =>{
        (async() =>{
            const response = await axios.get('http://localhost:8080/profile_img', {headers: {authorization: localStorage.getItem("accessToken")}});
            if(response.data.profile_img) setProfilePicture(response.data.profile_img);
        })();
    }

    useEffect(() =>{
        fetchProfilePicture();
    }, [])

    let displayLogin = <><NavLink as={Link} to="/LogInForm">LogIn</NavLink>
        <NavLink as={Link} to="/SignUpForm">SignUp</NavLink></>;

    let displayMyAccount = <></>

    if (localStorage.getItem("username")) {
        console.log(profilePicture);
        displayLogin = <>
            <img  onClick={navigateToUser} className="post-profile-picture navbar-img" style={{borderRadius: '50%', width: '38px', height: '38px', margin: '0 10px 0 0'}}
                  src={profilePicture}
                  onError={({currentTarget}) => {
                      currentTarget.onerror = null;
                      currentTarget.src = profileImg;
                  }}/>
            <Navbar.Text>
                {localStorage.getItem("username")}</Navbar.Text>
            <Button variant="link" onClick={logout}>Logout</Button>
        </>

        displayMyAccount = <NavLink onClick={() => navigate({pathname: 'Account', search: `?${createSearchParams({username: localStorage.getItem("username")})}`})}><PersonIcon/> Profile</NavLink>
        
    }


    return (
        <div>
            <Navbar className="navbar-container" sticky="top">
                <Navbar.Toggle aria-controls="navbarScroll" data-bs-target="#navbarScroll"/>
                <Navbar.Collapse id="navbarScroll"/>
                <Nav className="me-auto">
                    <div className="navbar-interactions-container">
                        <div style={{display: 'flex'}}>
                            <NavLink as={Link} to="/"><HomeIcon/> Home</NavLink>
                            {displayMyAccount}
                        </div>
                        <div>
                            <CustomUserSearch/>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'end'}}>
                            {displayLogin}
                        </div>
                    </div>
                    <Form.Check
                        className="night-mode-switch"
                        type = "switch"
                        id="darkMode"
                        defaultChecked={darkMode}
                        value={darkMode}
                        onChange={() => setDarkMode(!darkMode)}
                        label={<NightsStayIcon/>}
                    />
                </Nav>
            </Navbar>
            <Outlet/>
        </div>
    )
}

export default NavigationBar;