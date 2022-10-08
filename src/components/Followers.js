import {useEffect, useState} from "react";
import {ListGroup} from "react-bootstrap";
import {useNavigate,useLocation, createSearchParams} from "react-router-dom";
import axios from "axios";

/**
 * shows the users that follow current user as a list
 * @param{string} f - username of the user who's followers are shown
 */
function Followers(f) {

    /**
    * @param{list} followers - the list of users followers
    * @param navigation
    * @param location
    */
    const [followers, setFollowers] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();


    /**
     * gets the follows from database by the param f username and returns list of users and reders them.
     */
    const fetchFollowers = function (){
        (async() =>{
            await axios.get('http://localhost:8080/user/followers', {
                params: {username: f.item},
                headers: {'Authorization': localStorage.getItem("accessToken")}
                }).then(response=>{
                if(response.status === 202){
                    console.log(response.data.followers)
                    setFollowers(response.data.followers);
                }
            })
        })().catch(err => console.log(err));
    }

    useEffect(() =>{
        fetchFollowers();
    }, []);

     /**
    * navigates to the clicked user's page
    */
    let clickFollower = (e, user) =>{
        navigate({pathname: location.pathname, search: `?${createSearchParams({username: user})}`})
    }

    
    /**
    * creates and renders the list of followers
    */
    const generateFollowers = followers.map((item) =>{
        return <ListGroup.Item className="d-flex justify-content-between align-items-start" key={item.userId} action onClick={e=> clickFollower(e,item.username)}>{item.username}</ListGroup.Item>
    })

    return (
        <div style={{margin: 'auto', width: '50%', padding:'10px' }}>
            <ListGroup>
                {generateFollowers}
            </ListGroup>
        </div>
    )
}
export default Followers;