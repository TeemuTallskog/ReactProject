import {useEffect, useState} from "react";
import profileImg from "../resources/images/profile_img_default.png";
import Button from "react-bootstrap/Button";
import '../resources/css/autocompleteSearchBar.css';
import * as React from "react";
import axios from "axios";
import {createSearchParams, useLocation, useNavigate} from "react-router-dom";

/**
 * simplified component containing user image, username and a follow button
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function UserCard(props){
    const navigate = useNavigate();
    const location = useLocation();

    /**
     * {user} user object
     * {followBtn} button that allows a user to follow another user
     */
    const [user, setUser] = useState(props.user);
    const [followBtn, setFollowBtn] = useState(<div></div>)

    /**
     * sets the follow button according to user follow status and logged in user
     */
    React.useEffect(() => {
        if(user.user_follow_status === undefined || user.user_id == localStorage.getItem("user-id")) return;
        setFollowBtn((
            user.user_follow_status ?
                <Button className="follow-button following" onClick={()=>follow(false)}>Unfollow</Button> :
                <Button className="follow-button" onClick={()=>follow(true)}>Follow</Button>
    ));
    }, [user.user_follow_status]);


    /**
     * sends a query to the server to attempt to follow a user
     * @param follow
     * @returns {Promise<void>}
     */
    const follow = async (follow) =>{
        console.log("follow attempt");
        const response = await axios.post('http://localhost:8080/follow', {
                user_id: user.user_id,
                follow: follow
            },{
            headers:{
                authorization: localStorage.getItem("accessToken")
            }
        });
        console.log(response.data);
        setUser({...user, ['user_follow_status']: response.data.user_follow_status});
    }

    /**
     * onclick navigates to users page
     */
    let navigateToUser = () =>{
        navigate({pathname: '/Account', search: `?${createSearchParams({username: user.username})}`})
    }

    return(
        <div className="user-card-container">
        <div className="user-card-container" style={{width: '100%'}} onClick={navigateToUser}>
            <img  className="post-profile-picture" style={{borderRadius: '50%', width: '36px'}}
                  src={user.profile_img ? user.profile_img : profileImg}
                  onError={({currentTarget}) => {
                      currentTarget.onerror = null;
                      currentTarget.src = profileImg;
                  }}/>
            <h5 className="username-h5">{user.username}</h5>

            {user.user_id == localStorage.getItem("user-id") &&
            <p className="username-h5"><small>(you)</small></p>}
        </div>

            {followBtn}
        </div>
    )
}

export default UserCard;