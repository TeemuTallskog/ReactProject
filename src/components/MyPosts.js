import {useEffect, useState} from "react";
import Post from "./Post";

function MyPosts() {
    const [posts, setPosts] = useState([]);

    const fetchPosts = function (){
        (async() =>{
            const response = await fetch('http://localhost:8080/myPosts', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem("accessToken")
                }
            })
            if(response.status === 202){
                response.json().then((data) =>{
                    console.log(data.posts);
                    setPosts(data.posts);
                })
            }
        })().catch(err => console.log(err));
    }

    useEffect(() =>{
        fetchPosts();
    }, []);

    const generatePosts = posts.map((item) => {
        return <Post post={item} key={item.post_id}/>
    })

    return (
        <div style={{margin: 'auto', width: '50%', padding:'10px' }}>
            <div>{generatePosts}</div>
        </div>
    )
}
export default MyPosts;