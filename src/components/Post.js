import {Card} from "react-bootstrap";
import moment from "moment";

function Post(post){
    return(
        <Card style={{margin: '10px'}}>
            <Card.Body>
                <Card.Title>{post.post.username}</Card.Title>
                <Card.Text>
                    {post.post.content}
                </Card.Text>
                <Card.Footer>{moment(post.post.created).fromNow()}</Card.Footer>
            </Card.Body>
        </Card>
    )
}

export default Post;