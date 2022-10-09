import {useEffect, useState} from "react";
import {Card} from "react-bootstrap";
import Post from "./Post";
import PostForm from "./PostForm";
import {useNavigate} from "react-router-dom";

/**
 * home page
 * @returns {JSX.Element}
 * @constructor
 */
function HomePage() {
    /**
     * {posts} array of post objects
     */
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);

    /**
     * retrieves users own posts and posts from users that the current user follows
     */
    const fetchPosts = function (){
        (async() =>{
            const response = await fetch('http://localhost:8080/posts', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem("accessToken")
                }
            })
            if(response.status === 202){
                response.json().then((data) =>{
                    console.log(data);
                    setPosts(data.posts);
                })
            }
            if(response.status === 403 || response.status === 401){
                navigate('/LogInForm');
            }
        })().catch(err => console.log(err));
    }

    useEffect(() =>{
        fetchPosts();
    }, []);

    /**
     * generates post componenets from loaded post objects
     * @type {unknown[]}
     */
    const generatePosts = posts.map((item) => {
        return <Post post={item} key={item.post_id}/>
    })

    return (
        <div style={{margin: 'auto', maxWidth: '880px', padding:'10px' }}>
            <PostForm/>
            <div>{generatePosts}</div>
        </div>
    )
}

export default HomePage;