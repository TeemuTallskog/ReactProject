import {Nav, Navbar, NavLink, Row} from "react-bootstrap";
import {Outlet, Link} from "react-router-dom";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";


function NavigationBar(){



    const logout = () => {
        localStorage.setItem("accessToken", "");
        localStorage.setItem("username", "");
        window.location.reload(false);
    }

    let loggedInText = <></>;
    if(localStorage.getItem("username")){
        loggedInText = <>
            <Navbar.Text>Logged in as: {localStorage.getItem("username")}</Navbar.Text>
            <Button variant="link" onClick={logout}>Logout</Button>
        </>
    }


    return(
        <>
        <Navbar style={{display: 'block', margin: 'auto', width: '50%'}}>
            <Navbar.Toggle aria-controls="navbarScroll" data-bs-target="#navbarScroll"/>
            <Navbar.Collapse id="navbarScroll"/>
            <Nav className="me-auto">
                <Row style={{width: '100%'}}>
                    <Col style={{display: 'flex'}}>
                <NavLink as={Link} to="/HomePage">Home</NavLink>
                <NavLink as={Link} to="/LogInForm">LogIn</NavLink>
                <NavLink as={Link} to="/SignUpForm">SignUp</NavLink>
                    </Col>
                    <Col style={{display: 'flex', justifyContent: 'end'}}>
                {loggedInText}
                    </Col>
                </Row>
            </Nav>
        </Navbar>
            <Outlet/>
        </>
    )
}

export default NavigationBar;