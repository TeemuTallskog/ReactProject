import Form from 'react-bootstrap/Form';
import {useState} from 'react';
import Col from 'react-bootstrap/Col'
import Button from "react-bootstrap/Button";
import React from 'react';
import {useNavigate} from "react-router-dom";
import '../resources/css/loginForm.css'

function LogInForm() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    /**
     * {errors} list of errors
     */
    const [errors, setErrors] = useState({});

    /**
     * changes form data state and empties errors on change
     * @param e
     */
    const onChange = (e) =>{
        setFormData({...formData, [e.target.name]: e.target.value})
        if(!!errors[e.target.name]) setErrors({
            ...errors,
            [e.target.name]: null
        })
    };

    /**
     * sends a log in attempt to the server if no errors exist
     * on successfull login, stores accesstoken, username and user id to local storage and navigates to home page
     * @param event
     */
    const handleSubmit = (event) =>{
        event.preventDefault();
        const formErrors = validateForm();
        if(Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }
        (async() =>{
            const response = await fetch('http://localhost:8080/login', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            })
            if(response.status === 202){
                response.json().then((data) =>{
                    console.log(data);
                    localStorage.setItem("accessToken", data.accessToken);
                    localStorage.setItem("username", data.username);
                    localStorage.setItem("user-id", data.user_id);
                    navigate('/');
                    window.location.reload(false);
                })
            }
            if(response.status === 401){
                setErrors({
                    email: "Incorrect log in credentials",
                    password: "Incorrect login credentials"
                });
            }
        })().catch(err => console.log(err));

    }

    /**
     * validates form
     * @returns {{}}
     */
    const validateForm = () =>{
        const newErrors = {}
        if(!(formData.password.length > 4) &&
            (!formData.password.length < 50)) newErrors.password = 'invalid password length!';
        if(!(formData.email.length > 0)) newErrors.email = 'invalid email!';
        return newErrors;
    }

    return(
        <div style={{margin: 'auto', width: '50%', padding:'10px'}}>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" md="5" controlId="email" as={Col} style={{margin: "auto"}}>
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                        className="form-input"
                        type="email"
                        placeholder="Enter email"
                        required
                        name="email"
                        value={formData.email}
                        onChange={onChange}
                        isInvalid={!!errors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.email}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" md="5" controlId="password" as={Col} style={{margin: "auto"}}>
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        className="form-input"
                        type="password"
                        placeholder="Password"
                        required
                        name="password"
                        value={formData.password}
                        onChange={onChange}
                        isInvalid={!!errors.password}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.password}
                    </Form.Control.Feedback>
                </Form.Group>
                <Button variant="primary" type="submit">
                    Log in
                </Button>
            </Form>
        </div>
    );
}

export default LogInForm;