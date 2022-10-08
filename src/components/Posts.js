import {useEffect, useState} from "react";
import Post from "./Post";
import axios from "axios";

function Posts(p) {
    const [posts, setPosts] = useState([]);

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

    const generatePosts = posts.map((item) => {
        return <Post post={item} key={item.post_id}/>
    })

    return (
        <div style={{margin: 'auto', width: '100%', padding:'10px' }}>
            <div>{generatePosts}</div>
        </div>
    )
}
export default Posts;