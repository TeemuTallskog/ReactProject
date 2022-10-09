import Form from 'react-bootstrap/Form';
import {useState} from 'react';
import Col from 'react-bootstrap/Col'
import Button from "react-bootstrap/Button";
import React from 'react';
import {Row} from "react-bootstrap";
import '../resources/css/postForm.css'

/**
 * form to create a new post
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function PostForm(props) {

    const [formData, setFormData] = useState({
        content: ''
    });
    /**
     * {count} character count
     * {errors} list of errors
     */
    const [count, setCount] = useState(0);
    const [errors, setErrors] = useState({});

    /**
     * handles form data change and empties errors on change
     */
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

    /**
     * attempts to submit the post to the server
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
            const response = await fetch('http://localhost:8080/post', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('accessToken')
                },
                body: JSON.stringify({
                    content: formData.content,
                    reply_to: props.replyTo
                })
            })
            if(response.status === 202){
                console.log("Success");
                window.location.reload(false);
            }
            if(response.status === 401){
                setErrors({
                    content: "You haven't logged in!"
                });
            }
        })().catch(err => console.log(err));

    }

    /**
     * validates errors on the post
     * @returns {{}}
     */
    const validateForm = () =>{
        const newErrors = {}
        if(formData.content.length === 0 || formData.content.length > 254) newErrors.content = '';
        return newErrors;
    }

    return(
        <div style={{margin: '10px'}}>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3"  controlId="email" as={Col}>
                    <Row>
                        <Col xs={10}>
                    <Form.Control
                        className="post-text-area"
                        type="textarea"
                        rows={3}
                        placeholder="What is happening?"
                        required
                        name="content"
                        value={formData.content}
                        onChange={onChange}
                        isInvalid={!!errors.content}
                    />
                    <p style={{color: formData.content.length > 253 ? "#ff3333" : "", textAlign: 'right'}}>{count}/254</p>
                    <Form.Control.Feedback type="invalid">
                        {errors.content}
                    </Form.Control.Feedback>
                        </Col>
                        <Col>
                    <Button variant="primary" type="submit" style={{width: '100%'}}>
                        {props.isReply ? "Reply" : "Post"}
                    </Button>
                        </Col>
                    </Row>
                </Form.Group>
            </Form>
        </div>
    );
}

export default PostForm;