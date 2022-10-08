import {useEffect, useState} from "react";
import {Button, ButtonGroup} from "@mui/material";
import Posts from "../components/Posts";
import Followers from "../components/Followers";
import Follows from "../components/Follows";
import {useSearchParams} from "react-router-dom";
import axios from "axios";

function Account() {
    
    /**
     * searchParams
     * {int} posts - user's post count
     * {int} follows - user's follow count
     * {int} followers - user's follower count
     * {string} activeButton - currently pressed button 
     * {string} username
     * {boolean} hasFollowButton - if false follw button disappears
     * {boolean} isFollowing - tells the status of follow button
     * {boolean} shouldRender - used for changing the follow button
     */
    const [searchParams] = useSearchParams();
    const [posts, setPosts] = useState(0);
    const [follows, setFollows] = useState(0);
    const [followers, setFollowers] = useState(0);
    const [activeButton, setActiveButton] = useState("posts");
    const [username, setUsername] = useState("")
    const [hasFollowButton, setFollowButton] = useState(true)
    const [isFollowing, setFollow] = useState(false)
    const [shouldRender, reRender] = useState(false)


     /**
     * gets the account info from database by the searchParam username and returns the account info.
     */
    const fetchAccount = function (){
        (async() =>{
            await axios.get('http://localhost:8080/account', {
                params: {username: searchParams.get("username")},
                headers: {'Authorization': localStorage.getItem("accessToken")}
            }).then(resp=>{
                if(resp.status === 202){
                    setPosts(resp.data.posts);
                    setFollowers(resp.data.followers)
                    setFollows(resp.data.follows)
                    setFollow(resp.data.isFollowing)
                    if(resp.data.myUser)
                        setFollowButton(false)
                    else 
                        setFollowButton(true)
                }
            })
            
        })().catch(err => console.log(err));
    }


    if(searchParams.get("username") != username || shouldRender){
        reRender(false)   
        setUsername(searchParams.get("username"))
        fetchAccount();
        if(!shouldRender)
            setActiveButton("posts")
    }


     /**
     * changes wheather posts, followers or follows are shown
     */
    const clickButton = (e) =>{
        setActiveButton(e.target.name)
    }

     /**
     * creates the posts, followers and follows
     */
    let generateSelected =()=> {
        if(activeButton === "posts"){
            if(posts >0)
                return <Posts item={searchParams.get("username")}/>
            else
                return <><br/><p>No posts.</p></>
        } else if(activeButton === "followers"){
            if(followers > 0 )
                return <Followers item={searchParams.get("username")}/>;
            else
                return <><br/><p>No followers</p></>
        } else if(activeButton === "follows"){
            if(follows >0)
                return <Follows item={searchParams.get("username")}/>;
            else
                return <><br/><p>No follows</p></>
        }
    }

     /**
     * chooses the follow button status
     */
    let followButton= () =>{
        if(hasFollowButton){

            if(isFollowing){
                return <><Button variant="contained" onClick={()=>follow(false)}>Following</Button><br/></>;
            } else {
                return <><Button variant="outlined" onClick={()=>follow(true)}>Follow</Button><br/></>;
            }
        }
        else {
            return <></>
        }
    }

     /**
     * follow or unfollow user and update it in the database
     */
    const follow = function(following){
        (async() =>{
            await axios.post('http://localhost:8080/user/follow',{following: following, username: searchParams.get("username")} ,{
                headers: {'Authorization': localStorage.getItem("accessToken")}}).then(resp=>{reRender(true)});
        })().catch((e)=> console.log(e));
    }
   
    
    return (
        <div style={{margin: 'auto', width: '50%', padding:'10px' }}>
            <div><p>{searchParams.get("username")} {followButton()}</p></div>
            <ButtonGroup justify = "center">
                <Button variant={activeButton === "posts" ?"outlined" : "contained"} name="posts" onClick={clickButton}>Posts {posts}</Button>
                <Button variant={activeButton === "followers" ?"outlined" : "contained"} name="followers" onClick={clickButton}>Followers {followers}</Button>
                <Button variant={activeButton === "follows" ?"outlined" : "contained"} name="follows" onClick={clickButton}>Followed {follows}</Button>
            </ButtonGroup>
            <div>{generateSelected()}</div>
        </div>
    )
}

export default Account;