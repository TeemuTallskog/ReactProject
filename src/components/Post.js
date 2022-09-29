import {Card, Row, Col} from "react-bootstrap";
import moment from "moment";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import '../resources/css/iconButton.css';
import {useEffect, useState} from "react";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import {useNavigate, createSearchParams} from "react-router-dom";


function Post(post){
    const navigate = useNavigate();
    const [likeStatus, setLikeStatus] = useState(post.post.user_like_status);
    const [totalLikes, setTotalLikes] = useState(post.post.total_likes);
    const [likeIcon, setLikeIcon] = useState(false);

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

    useEffect(()=>{
        if(likeStatus == 1){
            setLikeIcon(<FavoriteIcon/>);
        }else{
            setLikeIcon(<FavoriteBorderIcon/>);
        }
    }, [likeStatus])

    return(
        <Card style={{margin: '10px'}}>
            <Card.Body>
                {post.post.reply_to && <Card.Header>Reply</Card.Header>}
                <Card.Title>{post.post.username}</Card.Title>
                <Card.Text>
                    {post.post.content}
                </Card.Text>
                <Row style={{width: '50%', margin: 'auto', padding: '0'}}>
                    <Col>
                        <button className='button' onClick={() => navigate({
                            pathname: 'Post',
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