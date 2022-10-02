import {useEffect, useState} from "react";
import {ListGroup} from "react-bootstrap";

function MyFollows() {

    const [follows, setFollows] = useState([]);

    const fetchFollows = function (){
        (async() =>{
            const response = await fetch('http://localhost:8080/myFollows', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem("accessToken")
                }
            })
            if(response.status === 202){
                response.json().then((data) =>{
                    console.log(data.follows)
                    setFollows(data.follows);
                })
            }
        })().catch(err => console.log(err));
    }

    useEffect(() =>{
        fetchFollows();
    }, []);

    let clickFollowedUser = (e, id) =>{
        //go to user's page here.
        console.log(id)
    }

    const generateFollows = follows.map((item) =>{
        return <ListGroup.Item className="d-flex justify-content-between align-items-start" key={item.userId} action onClick={e=> clickFollowedUser(e,item.userId)}>{item.username}</ListGroup.Item>
    })

    return (
        <div style={{margin: 'auto', width: '50%', padding:'10px' }}>
            <ListGroup>
                {generateFollows}
            </ListGroup>
        </div>
    )
}
export default MyFollows;