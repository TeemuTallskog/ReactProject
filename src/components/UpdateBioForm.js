import React, {useState} from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import '../resources/css/updateBioFrom.css';

/**
 * form to update user bio
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function UpdateBioForm(props){
    const [formData, setFormData] = useState({
        content: ''
    });

    /**
     * character count
     */
    const [count, setCount] = useState(0);

    /**
     * list of errors
     */
    const [errors, setErrors] = useState({});

    /**
     * on user input updates the form data and clears errors
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
     * submits the new bio to the server
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
            const response = await fetch('http://localhost:8080/update/bio', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('accessToken')
                },
                body: JSON.stringify({
                    content: formData.content,
                })
            })
            if(response.status === 202){
                console.log("Success");
                setFormData({
                    content: ''
                });
                window.location.reload(false);
            }
            if(response.status === 401){
                setErrors({
                    content: "You haven't logged in!"
                });
            }
            if(response.status === 500 || response.status === 404){
                setErrors({
                    content: "Something went wrong :("
                });
            }
        })().catch(err => console.log(err));

    }

    /**
     * used to validate form data
     * @returns {{}}
     */
    const validateForm = () =>{
        const newErrors = {}
        if(formData.content.length === 0 || formData.content.length > 254) newErrors.content = '';
        return newErrors;
    }

    return(
            <Form onSubmit={handleSubmit} className="Bio-Form">
                <Form.Group className="Bio-Form-Container">
                    <div className="Bio-Form-Input">
                            <Form.Control
                                type="textarea"
                                placeholder={props.bio? props.bio : "Tell something about yourself..."}
                                required
                                name="content"
                                value={formData.content}
                                onChange={onChange}
                                isInvalid={!!errors.content}
                                style={{height: '100%'}}
                            />
                            <p style={{color: formData.content.length > 253 ? "#ff3333" : "", textAlign: 'right', height: '1px', marginBottom: '0'}}>{count}/254</p>
                            <Form.Control.Feedback type="invalid">
                                {errors.content}
                            </Form.Control.Feedback>
                    </div>
                            <Button variant="primary" type="submit">
                                Update
                            </Button>
                </Form.Group>
            </Form>
    );
}

export default UpdateBioForm