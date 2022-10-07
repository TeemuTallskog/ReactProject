import {useEffect, useState} from "react";
import {ListGroup} from "react-bootstrap";
import {useNavigate, useLocation, createSearchParams} from "react-router-dom";
import axios from "axios";

function Follows(f) {

    const [follows, setFollows] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    const fetchFollows = function (){
        (async() =>{
            await axios.get('http://localhost:8080/user/follows', {
                params: {username: f.item},
                headers: {'Authorization': localStorage.getItem("accessToken")}
                }).then(response=>{
                if(response.status === 202){
                    setFollows(response.data.follows);
                }
            })
        })().catch(err => console.log(err));
    }

    useEffect(() =>{
        fetchFollows();
    }, []);

    let clickFollowedUser = (e, user) =>{
        navigate({pathname: location.pathname, search: `?${createSearchParams({username: user})}`})
    }

    const generateFollows = follows.map((item) =>{
        return <ListGroup.Item className="d-flex justify-content-between align-items-start" key={item.userId} action onClick={e=> clickFollowedUser(e,item.username)}>{item.username}</ListGroup.Item>
    })

    return (
        <div style={{margin: 'auto', width: '50%', padding:'10px' }}>
            <ListGroup>
                {generateFollows}
            </ListGroup>
        </div>
    )
}
export default Follows;