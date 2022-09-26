import Form from 'react-bootstrap/Form';
import {useState} from 'react';
import Col from 'react-bootstrap/Col'
import Button from "react-bootstrap/Button";
import React from 'react';

function PostForm() {

    const [formData, setFormData] = useState({
        content: ''
    });
    const [count, setCount] = useState(0);

    const [errors, setErrors] = useState({});
    const onChange = (e) =>{
        if(e.target.value.length < 255){
            setFormData({...formData, [e.target.name]: e.target.value})
            setCount(e.target.value.length);
        }
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
            const response = await fetch('http://localhost:8080/post', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('accessToken')
                },
                body: JSON.stringify({
                    content: formData.content
                })
            })
            if(response.status === 202){
                console.log("Success");
                event.target.submit();
            }
            if(response.status === 401){
                setErrors({
                    content: "You haven't logged in!"
                });
            }
        })().catch(err => console.log(err));

    }

    const validateForm = () =>{
        const newErrors = {}
        if(formData.content.length === 0 || formData.content.length > 254) newErrors.content = '';
        return newErrors;
    }

    return(
        <div>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" md="4" controlId="email" as={Col}>
                    <Form.Control
                        type="textarea"
                        rows={3}
                        placeholder="What is happening?"
                        required
                        name="content"
                        value={formData.content}
                        onChange={onChange}
                        isInvalid={!!errors.content}
                    />
                    <p style={{color: formData.content.length === 254 ? "#ff3333" : ""}}>{count}/254</p>
                    <Form.Control.Feedback type="invalid">
                        {errors.content}
                    </Form.Control.Feedback>
                </Form.Group>
                <Button variant="primary" type="submit">
                    Post
                </Button>
            </Form>
        </div>
    );
}

export default PostForm;