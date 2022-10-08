import {useEffect, useState} from "react";
import axios from "axios";
import UserCard from "./UserCard";

function Follows(f) {

    const [follows, setFollows] = useState([]);

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