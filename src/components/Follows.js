import {useEffect, useState} from "react";
import {ListGroup} from "react-bootstrap";
import {useNavigate, useLocation, createSearchParams} from "react-router-dom";
import axios from "axios";


/**
 * shows as a list the users that the user given as param f follows
 * @param{string} f - username of the user who's follows are shown as
 */
function Follows(f) {

    /**
    * @param{list} follows - the list of users followed
    * @param navigation
    * @param location
    */
    const [follows, setFollows] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    /**
     * gets the follows from database by the param f username and returns list of users and reders them.
     */
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

    /**
    * navigates to the clicked user's page
    */
    let clickFollowedUser = (e, user) =>{
        navigate({pathname: location.pathname, search: `?${createSearchParams({username: user})}`})
    }

    /**
    * creates and renders the list of user that are followed
    */
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