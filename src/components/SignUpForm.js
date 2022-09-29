import Form from 'react-bootstrap/Form';
import {useState} from 'react';
import Col from 'react-bootstrap/Col'
import Button from "react-bootstrap/Button";
import React from 'react';
import { useNavigate } from 'react-router-dom';

function SignUpForm() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const onChange = (e) =>{
        setFormData({...formData, [e.target.name]: e.target.value})
        if(!!errors[e.target.name]) setErrors({
            ...errors,
            [e.target.name]: null
        })
    };

    const handleSubmit = (event) =>{
        event.preventDefault();
        const formErrors = validateForm();
        if(Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }
        (async() =>{
            const response = await fetch('http://localhost:8080/signup', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.email,
                    username: formData.username,
                    password: formData.password
                })
            })
            if(response.status === 202){
                response.json().then((data) =>{
                    console.log(data);
                    localStorage.setItem("accessToken", data.accessToken);
                    localStorage.setItem("username", data.username);
                    navigate('/');
                    window.location.reload(false);
                })
            }
            if(response.status === 409){
                console.log("username or email taken");
                setErrors({username: "Email or username already taken", email: "Email or username already taken"});
                return;
            }
        })().catch(err => console.log(err));

    }

    const validateForm = () =>{
        const newErrors = {}
        if(!(formData.username.length > 1) &&
            (!formData.username.length < 20)) newErrors.username = 'Invalid username';
        if(!(formData.password.length > 4) &&
            (!formData.password.length < 50)) newErrors.password = 'invalid password length!';
        if(!(formData.email.length > 0)) newErrors.email = 'invalid email!';
        if(formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords don't match!";
        return newErrors;
    }

    return(
        <div style={{margin: 'auto', width: '50%', padding:'10px'}}>
            <Form onSubmit={handleSubmit} >
                <Form.Group className="mb-3" md="5" controlId="email" as={Col} style={{margin: "auto"}}>
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
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
                <Form.Group className="mb-3" md="5" controlId="username" as={Col} style={{margin: "auto"}}>
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter username"
                        required
                        name="username"
                        value={formData.username}
                        onChange={onChange}
                        isInvalid={!!errors.username}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.username}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" md="5" controlId="password" as={Col} style={{margin: "auto"}}>
                    <Form.Label>Password</Form.Label>
                    <Form.Control
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
                <Form.Group className="mb-3" md="5" controlId="confirmPassword" as={Col} style={{margin: "auto"}}>
                    <Form.Label>Confirm password</Form.Label>
                    <Form.Control
                        type = "password"
                        required
                        placeholder= "password"
                        name = "confirmPassword"
                        value = {formData.confirmPassword}
                        onChange={onChange}
                        isInvalid={!!errors.confirmPassword}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.confirmPassword}
                    </Form.Control.Feedback>
                </Form.Group>
                <Button variant="primary" type="submit">
                    Sign up
                </Button>
            </Form>
        </div>
    );
}

export default SignUpForm;