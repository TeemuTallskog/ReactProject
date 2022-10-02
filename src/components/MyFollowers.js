import {useEffect, useState} from "react";
import {ListGroup} from "react-bootstrap";

function MyPosts() {
    const [followers, setFollowers] = useState([]);

    const fetchFollowers = function (){
        (async() =>{
            const response = await fetch('http://localhost:8080/myFollowers', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem("accessToken")
                }
            })
            if(response.status === 202){
                response.json().then((data) =>{
                    console.log(data.followers)
                    setFollowers(data.followers);
                })
            }
        })().catch(err => console.log(err));
    }

    useEffect(() =>{
        fetchFollowers();
    }, []);

    let clickFollower = (e, id) =>{
        //go to user's page here.
        //to be implemented.
        console.log(id)
    }

    const generateFollowers = followers.map((item) =>{
        return <ListGroup.Item className="d-flex justify-content-between align-items-start" key={item.userId} action onClick={e=> clickFollower(e,item.userId)}>{item.username}</ListGroup.Item>
    })

    return (
        <div style={{margin: 'auto', width: '50%', padding:'10px' }}>
            <ListGroup>
                {generateFollowers}
            </ListGroup>
        </div>
    )
}
export default MyPosts;