import {useEffect, useState} from "react";
import Post from "./Post";
import PostForm from "./PostForm";
import axios from "axios";
import {useSearchParams} from "react-router-dom";

/**
 * post page displays original post at the top followed by a post form and replies to the original post
 * @returns {JSX.Element}
 * @constructor
 */
function PostPage() {
    /**
     * {searchParams} url params containing a post id
     * {post} loaded psot object
     * {replies} array of loaded replies
     */
    const [searchParams] = useSearchParams();
    const [post, setPost] = useState();
    const [replies, setReplies] = useState([]);

    /**
     * takes the url search parameter and attempts to fetch a post from the server
     */
    useEffect(() =>{
        const fetchPost = function(){
            (async() =>{
                const response = await axios.get('http://localhost:8080/post',{
                    params:{post_id: searchParams.get("post_id")},
                    headers: {'Authorization' : localStorage.getItem("accessToken")}
                }).catch((e) => {
                    console.log(e);
                    return;
                });
                console.log(response.data.post[0]);
                setPost(response.data.post[0]);
            })();
        }

        /**
         * attempts to fetch replies to the original post
         */
        const fetchReplies = function (){
            (async() =>{
                const response = await axios.get('http://localhost:8080/replies',
                    {params: {post_id: searchParams.get("post_id")},
                        headers: {'Authorization': localStorage.getItem("accessToken")}
                    })
                    .catch((e) =>{
                        console.log(e);
                        return;
                    });
                if(response){
                    console.log(response);
                    setReplies(response.data.post);
                }
            })().catch(err => console.log(err));
        }
        fetchPost();
        fetchReplies();
    },[searchParams]);

    /**
     * generates post components from the replies
     * @type {unknown[]}
     */
    const generateReplies = replies.map((item) => {
        item.isPostPage = true;
        return <Post post={item} key={item.post_id} />
    })

    return (
        <div style={{margin: 'auto', width: '50%', padding:'10px' }}>
            {post && <Post post={post} key={post.post_id}></Post>}
            {post && <PostForm isReply={true} replyTo={post.post_id}/>}
            <div>{generateReplies}</div>
        </div>
    )
}

export default PostPage;