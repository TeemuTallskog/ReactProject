import {useEffect, useState} from "react";
import Post from "./Post";
import axios from "axios";

/**
 * shows the current users posts
 * @param{string} p - username of the user who's post will be shown
 */
function Posts(p) {

    /**
    * @param{list} posts - the list of user's posts
    */
    const [posts, setPosts] = useState([]);

    /**
     * gets the post from database by the param p username and returns list of posts and reders them.
     */
    const fetchPosts = function (){
        (async() =>{

            await axios.get('http://localhost:8080/user/posts', {
                params: {username: p.item},
                headers: {'Authorization': localStorage.getItem("accessToken")}
                }).then(response=>{
                if(response.status === 202){
                    console.log(response.data.posts)
                    setPosts(response.data.posts);
                }
            })
        })().catch(err => console.log(err));
    }

    useEffect(() =>{
        fetchPosts();
    }, []);

    /**
     * add and renders the list of posts 
     */
    const generatePosts = posts.map((item) => {
        return <Post post={item} key={item.post_id}/>
    })

    return (
        <div style={{margin: 'auto', width: '50%', padding:'10px' }}>
            <div>{generatePosts}</div>
        </div>
    )
}
export default Posts;