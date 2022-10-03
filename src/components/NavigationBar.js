import {Nav, Navbar, NavLink, Row} from "react-bootstrap";
import {Outlet, Link} from "react-router-dom";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import AutocompleteUserSearch from "./AutocompleteUserSearch";
import '../resources/css/navigationBar.css';


function NavigationBar() {


    const logout = () => {
        localStorage.setItem("accessToken", "");
        localStorage.setItem("username", "");
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
                            <AutocompleteUserSearch/>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'end'}}>
                            {displayLogin}
                        </div>
                    </div>
                </Nav>
            </Navbar>
            <Outlet/>
        </div>
    )
}

export default NavigationBar;