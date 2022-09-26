import {useEffect, useState} from "react";
import {Card} from "react-bootstrap";

function HomePage() {

    const [posts, setPosts] = useState([]);

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
        })().catch(err => console.log(err));
    }

    useEffect(() =>{
        fetchPosts();
    }, []);

    const generatePosts = posts.map((item) => {
        return <Card>
            <Card.Body>
                <Card.Title>{item.username}</Card.Title>
                <Card.Text>
                    {item.content}
                </Card.Text>
                <Card.Footer>{new Date(item.created).toLocaleString("fi-FI")}</Card.Footer>
            </Card.Body>
        </Card>
    })

    return (
        <div>
            <div>{generatePosts}</div>
        </div>
    )
}

export default HomePage;