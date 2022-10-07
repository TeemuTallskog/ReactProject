import {Nav, Navbar, NavLink, Row} from "react-bootstrap";
import {Outlet, Link} from "react-router-dom";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import AutocompleteUserSearch from "./AutocompleteUserSearch";
import {useNavigate, createSearchParams} from "react-router-dom";


function NavigationBar(){

    const navigate = useNavigate();

    const logout = () => {
        localStorage.setItem("accessToken", "");
        localStorage.setItem("username", "");
        window.location.reload(false);
    }

    let displayLogin= <><NavLink as={Link} to="/LogInForm">LogIn</NavLink>
        <NavLink as={Link} to="/SignUpForm">SignUp</NavLink></>;

    let displayMyAccount = <></>

    if(localStorage.getItem("username")){
        displayLogin = <>
            <Navbar.Text>Logged in as: {localStorage.getItem("username")}</Navbar.Text>
            <Button variant="link" onClick={logout}>Logout</Button>
        </>

        displayMyAccount = <NavLink onClick={() => navigate({pathname: 'Account', search: `?${createSearchParams({username: localStorage.getItem("username")})}`})}>My Account</NavLink>
        
    }



    return(
        <>
        <Navbar style={{display: 'block', margin: 'auto', width: '50%'}} sticky="top">
            <Navbar.Toggle aria-controls="navbarScroll" data-bs-target="#navbarScroll"/>
            <Navbar.Collapse id="navbarScroll"/>
            <Nav className="me-auto">
                <Row style={{width: '100%'}}>
                    <Col style={{display: 'flex'}}>
                <NavLink as={Link} to="/">Home</NavLink>
                {displayMyAccount}
                    </Col>
                    <Col style={{display: 'flex'}}>
                
                    </Col>
                    <Col>
                        <AutocompleteUserSearch/>
                    </Col>
                    <Col style={{display: 'flex', justifyContent: 'end'}}>
                {displayLogin}
                    </Col>
                </Row>
            </Nav>
        </Navbar>
            <Outlet/>
        </>
    )
}

export default NavigationBar;