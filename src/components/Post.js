import {Card, Row, Col} from "react-bootstrap";
import moment from "moment";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import '../resources/css/iconButton.css';
import {useEffect, useState} from "react";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import {useNavigate, createSearchParams, Link} from "react-router-dom";
import profileImg from '../resources/images/profile_img_default.png'
import axios from "axios";

function Post(post){
    const navigate = useNavigate();
    const [likeStatus, setLikeStatus] = useState(post.post.user_like_status);
    const [totalLikes, setTotalLikes] = useState(post.post.total_likes);
    const [likeIcon, setLikeIcon] = useState(false);
    const [replyContent, setReplyContent] = useState(null);

    const likePost = function (){
        (async() =>{
            const response = await fetch('http://localhost:8080/like', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem("accessToken")
                },
                body: JSON.stringify({post_id: post.post.post_id})
            });
            if(response.status === 202){
                response.json().then((data)=>{
                    console.log(data);
                    setTotalLikes(data.total_likes);
                    setLikeStatus(data.user_like_status);
                })
            }

        })().catch((e)=> console.log(e));
    }

    const getReplyContent = async function(){
        if(post.post.reply_to){
            const response = await axios.get('http://localhost:8080/post',{
                params:{post_id: post.post.reply_to},
                headers: {'Authorization' : localStorage.getItem("accessToken")}
            }).catch((e) => {
                console.log(e);
                setReplyContent(<p>error</p>);
            });
            let returnString =response.data.post[0].content;
            if(returnString.length > 18){
                returnString = returnString.substring(0,18) + "...";
            }
            setReplyContent(<div><h6>{response.data.post[0].username}:</h6><p>{returnString}</p></div>);
        }
    }

    useEffect(()=>{
        if(likeStatus == 1){
            setLikeIcon(<FavoriteIcon/>);
        }
        if(post.post.reply_to){
            getReplyContent();
        }
        else{
            setLikeIcon(<FavoriteBorderIcon/>);
        }
    }, [likeStatus, post.post.reply_to])

    return(
        <Card style={{margin: '10px'}}>
            <Card.Body>
                {post.post.reply_to && <Card.Header><Link to={{pathname:'/Post', search:'?post_id=' + post.post.reply_to}}>{replyContent}</Link> </Card.Header>}
                <img style={{borderRadius: '50%', width: '48px'}}
                     src={post.post.profile_img? post.post.profile_img : profileImg}
                     onError={({currentTarget}) => {
                         currentTarget.onerror = null;
                         currentTarget.src = profileImg;
                     }}/>
                <Card.Title>{post.post.username}</Card.Title>
                <Card.Text>
                    {post.post.content}
                </Card.Text>
                <Row style={{width: '50%', margin: 'auto', padding: '0'}}>
                    <Col>
                        <button className='button' onClick={() => navigate({
                            pathname: '/Post',
                            search: `?${createSearchParams({post_id: post.post.post_id})}`
                        })}><ChatBubbleOutlineIcon/></button>
                        <p>{post.post.reply_count}</p>
                    </Col>
                    <Col>
                        <button onClick={likePost} className='button'>{likeIcon}</button>
                        <p>{totalLikes}</p>
                    </Col>
                </Row>
                <Card.Footer>{moment(post.post.created).fromNow()}</Card.Footer>
            </Card.Body>
        </Card>
    )
}

export default Post;