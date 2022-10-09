import {useEffect, useState} from "react";
import axios from "axios";
import UserCard from "./UserCard";


/**
 * shows as a list the users that the user given as param f follows
 * @param{string} f - username of the user who's follows are shown as
 */
function Follows(f) {

    /**
    * @param{list} follows - the list of users followed
    */
    const [follows, setFollows] = useState([]);

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
     * creates and renders the list of user that are followed
     */
    const generateFollows = follows.map((item) =>{
        return <li key={item.user_id}><UserCard user={item}/></li>
    })

    return (
        <div style={{margin: 'auto',width: '50%', padding:'10px' }}>
            <ul style={{listStyle: 'none', paddingLeft: '0'}}>
                {generateFollows}
            </ul>
        </div>
    )
}
export default Follows;