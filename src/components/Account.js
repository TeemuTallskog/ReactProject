import {useEffect, useState} from "react";
import {Button, ButtonGroup} from "@mui/material";
import Posts from "../components/Posts";
import Followers from "../components/Followers";
import Follows from "../components/Follows";
import Popup from "../components/Popup";
import {useSearchParams} from "react-router-dom";
import axios from "axios";
import '../resources/css/account.css';
import profileImg from "../resources/images/profile_img_default.png";
import ProfileImageCrop from "./ProfileImageCrop";
import UpdateBioForm from "./UpdateBioForm";
import Button2 from "react-bootstrap/Button";

function Account() {
    /**
     * searchParams
     * {boolean} editing - is edit profile popup on?
     * {object} account - user object
     * {int} posts - user's post count
     * {int} follows - user's follow count
     * {int} followers - user's follower count
     * {string} activeButton - currently pressed button
     * {string} username
     * {boolean} hasFollowButton - if false follw button disappears
     * {boolean} isFollowing - tells the status of follow button
     * {boolean} shouldRender - used for changing the follow button
     */
    const [editing, setEditing] = useState(false);
    const [account, setAccount] = useState({});
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
                    setAccount(resp.data.user);
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
                return <Button2 className="follow-button following profile-action-button" onClick={()=>follow(false)}>Unfollow</Button2>;
            } else {
                return <Button2 className="follow-button profile-action-button" onClick={()=>follow(true)}>Follow</Button2>;
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
        <div style={{margin: 'auto', maxWidth: '880px', padding:'10px' }}>
            <div className="account-card-container">
            <img  className="post-profile-picture-large" style={{borderRadius: '50%', width: '96px'}}
                  src={account.profile_img ? account.profile_img : profileImg}
                  onError={({currentTarget}) => {
                      currentTarget.onerror = null;
                      currentTarget.src = profileImg;
                  }}/>
                {hasFollowButton ? <div>{followButton()}</div>
                    : <div><Button2 className="profile-action-button" onClick={() => setEditing(true)}>Edit profile</Button2></div>}
            <div><h4>{searchParams.get("username")}</h4></div>
            <div  style={{ width: '50%', overflowWrap: 'break-word'}}><p>{account.bio}</p></div>
            </div>
            <ButtonGroup justify = "center">
                <Button variant={activeButton === "posts" ?"outlined" : "contained"} name="posts" onClick={clickButton}>Posts {posts}</Button>
                <Button variant={activeButton === "followers" ?"outlined" : "contained"} name="followers" onClick={clickButton}>Followers {followers}</Button>
                <Button variant={activeButton === "follows" ?"outlined" : "contained"} name="follows" onClick={clickButton}>Following {follows}</Button>
            </ButtonGroup>
            <div>{generateSelected()}</div>
            <Popup trigger={editing} setTrigger={setEditing}>
                <h5>Edit profile picture</h5>
                <ProfileImageCrop/>
                <h5>Edit bio</h5>
                <UpdateBioForm bio={account.bio}/>
            </Popup>
        </div>
    )
}

export default Account;