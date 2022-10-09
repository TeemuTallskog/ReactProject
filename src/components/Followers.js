import {useEffect, useState} from "react";
import axios from "axios";
import UserCard from "./UserCard";

/**
 * shows the users that follow current user as a list
 * @param{string} f - username of the user who's followers are shown
 */
function Followers(f) {

    /**
    * @param{list} followers - the list of users followers
    */
    const [followers, setFollowers] = useState([]);


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
     * creates and renders the list of followers
     */
    const generateFollowers = followers.map((item) =>{
        return <li key={item.user_id}>{<UserCard user={item}/>}</li>
    })

    return (
        <div style={{margin: 'auto', width: '50%', padding:'10px' }}>
            <ul style={{listStyle: 'none', paddingLeft: '0'}}>
                {generateFollowers}
            </ul>
        </div>
    )
}
export default Followers;