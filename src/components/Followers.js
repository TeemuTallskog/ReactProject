import {useEffect, useState} from "react";
import axios from "axios";
import UserCard from "./UserCard";

function Followers(f) {
    const [followers, setFollowers] = useState([]);

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