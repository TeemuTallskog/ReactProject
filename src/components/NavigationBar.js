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


function NavigationBar() {

    const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") ? true : false);

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

    let displayLogin = <><NavLink as={Link} to="/LogInForm">LogIn</NavLink>
        <NavLink as={Link} to="/SignUpForm">SignUp</NavLink></>;

    let displayMyAccount = <></>

    if (localStorage.getItem("username")) {
        displayLogin = <>
            <Navbar.Text>Logged in as: {localStorage.getItem("username")}</Navbar.Text>
            <Button variant="link" onClick={logout}>Logout</Button>
        </>

        displayMyAccount = <NavLink as={Link} to="/MyAccount">My Account</NavLink>
    }


    return (
        <div>
            <Navbar className="navbar-container" sticky="top">
                <Navbar.Toggle aria-controls="navbarScroll" data-bs-target="#navbarScroll"/>
                <Navbar.Collapse id="navbarScroll"/>
                <Nav className="me-auto">
                    <div className="navbar-interactions-container">
                        <div style={{display: 'flex'}}>
                            <NavLink as={Link} to="/">Home</NavLink>
                            {displayMyAccount}
                        </div>
                        <div style={{display: 'flex'}}>

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