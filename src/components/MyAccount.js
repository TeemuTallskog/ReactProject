import {useEffect, useState} from "react";
import {Button, ButtonGroup} from "@mui/material";
import MyPosts from "../components/MyPosts";
import MyFollowers from "../components/MyFollowers";
import MyFollows from "../components/MyFollows";

function MyAccount() {
    
    const [posts, setPosts] = useState(0);
    const [follows, setFollows] = useState(0);
    const [followers, setFollowers] = useState(0);
    const [activeButton, setActiveButton] = useState("posts");

    const fetchMyInfo = function (){
        (async() =>{
            const response = await fetch('http://localhost:8080/myInfo', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem("accessToken")
                }
            })
            if(response.status === 202){
                response.json().then((data) =>{
                    setPosts(data.posts);
                    setFollowers(data.followers)
                    setFollows(data.follows)
                })
            }
        })().catch(err => console.log(err));
    }

    useEffect(() =>{
        fetchMyInfo();
    }, []);

    const clickButton = (e) =>{
        setActiveButton(e.target.name)
    }

    let generateSelected =()=> {
        if(activeButton === "posts"){
            if(posts >0)
                return <MyPosts/>
            else
                return <><br/><p>You don't have any posts yet.</p></>
        } else if(activeButton === "followers"){
            if(followers > 0 )
                return <MyFollowers/>;
            else
                return <><br/><p>You don't have any followers yet.</p></>
        } else if(activeButton === "follows"){
            if(follows >0)
                return <MyFollows/>;
            else
                return <><br/><p>You are not following anyone yet.</p></>
        }
    }
    
    return (
        <div style={{margin: 'auto', width: '50%', padding:'10px' }}>
            <div><p>My Account</p><p>{localStorage.getItem("username")}</p></div>
            <ButtonGroup justify = "center">
                <Button variant={activeButton === "posts" ?"outlined" : "contained"} name="posts" onClick={clickButton}>Posts {posts}</Button>
                <Button variant={activeButton === "followers" ?"outlined" : "contained"} name="followers" onClick={clickButton}>Followers {followers}</Button>
                <Button variant={activeButton === "follows" ?"outlined" : "contained"} name="follows" onClick={clickButton}>Followed {follows}</Button>
            </ButtonGroup>
            <div>{generateSelected()}</div>
        </div>
    )
}

export default MyAccount;