const express = require('express');
const app = express();
const port = 8080;
const cors = require('cors');
const util = require('util');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const upload = multer();

const urlencodedParser = bodyParser.urlencoded({extended: false});
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

require('dotenv').config({path: '.env'});

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "project_db"
});

app.use(cors());

con.connect(function(err) {
    if(err) throw err;
    console.log("Connected to MySQL!");
});

const query = util.promisify(con.query).bind(con);

//Verifies JWT token and returns a user object if valid or null
const verifyJWT = function (req, res, next){
    if(req.headers.authorization){
        try{
            const verified = jwt.verify(req.headers.authorization, process.env.TOKEN_KEY);
            if(next) next();
            return verified.user;
        }catch (e) {
            res.status(401).json({
                error: 'Invalid-token'
            });
            return null;
        }
    }else{
        res.status(403).json({
            error: 'Access-denied'
        });
        return null;
    }
}

app.get('/', (req, res) => {
    res.send('Hello');
})

app.post('/login', urlencodedParser, (req, res) => {
    let sql = "SELECT * FROM user WHERE email = ?";
    console.log("attempt");
    (async() => {
        try{
            const response = await query(sql, [req.body.email]);
            if(response.length < 1){
                res.status(401).json({
                    message: 'Incorrect Login credentials'
                })
                return;
            }else{
                bcrypt.compare(req.body.password, response[0].password, function (err, resp) {
                    if(err){
                        return;
                    }
                    if(resp){
                        let user ={
                            user_id: response[0].user_id,
                            username: response[0].username,
                            email: response[0].email,
                            password: response[0].password
                        }
                        const accessToken = jwt.sign({user:user}, process.env.TOKEN_KEY, {expiresIn: "1h"});
                        res.status(202).json({accessToken: accessToken, username: response[0].username, email: response[0].email});
                    }else{
                        res.status(401).json({
                            message: 'Incorrect login credentials'
                        });
                    }
                })
            }
        }catch(e){
            console.log(e);
        }
    })();
});


app.post("/signup", urlencodedParser, (req, res) => {
    let sql = "SELECT count(*) AS foundCount FROM user WHERE username = ? OR email = ?";
    (async() => {
        try{
            const resp = await query(sql, [req.body.username ,req.body.email]);
            if(resp[0].foundCount === 0){
                sql = "INSERT INTO user (username, email, password)" + " VALUES(?, ?, ?)";
                const hashedPass = bcrypt.hashSync(req.body.password, 10, function(err, hash){
                    if(err){
                        console.log(err);
                        return null;
                    }else{
                        return hash;
                    }
                })
                if(hashedPass == null){
                    return;
                }
                const response = await query(sql, [req.body.username,req.body.email, hashedPass]);
                if(response){
                    const user = {
                        user_id: response.insertId,
                        username: req.body.username,
                        email: req.body.email,
                        password: hashedPass
                    }
                    const accessToken = jwt.sign({user: user}, process.env.TOKEN_KEY, {expiresIn: '1h'});
                    res.status(202).json({accessToken: accessToken, username: req.body.username});
                }else {

                }
            }else{
                console.log("User name or email already exists");
                res.status(409).json({error: "Username or email already taken"});
            }
        }catch (e){
            console.log(e);
            res.status(404);
        }
    })()
});

app.get("/post", urlencodedParser, (req, res) => {
    const user = verifyJWT(req, res);
    if(!user) return;
    (async() => {
        let sql = "SELECT p.*, u.username, u.profile_img, (SELECT COUNT(*) FROM likes WHERE likes.post_id = p.post_id) AS total_likes, " +
            "(SELECT COUNT(*) FROM likes WHERE likes.post_id = p.post_id AND likes.user_id = ?)>0 AS user_like_status, " +
            "(SELECT COUNT(*) FROM post WHERE post.reply_to = p.post_id) AS reply_count FROM post p " +
            "INNER JOIN user u ON p.user_id = u.user_id " +
            "WHERE p.post_id = ?";
        const response = await query(sql, [user.user_id, req.query.post_id]).catch((e) => {console.log(e)})
        if(response){
            res.status(202).json({post: response});
        }else{
            res.status(500).json({error: "internal server error"});
        }
    })();
});



app.post("/post", urlencodedParser, (req, res) => {
    const user = verifyJWT(req, res);
    if(!user){
        console.log("invalid login");
        return;
    }
    (async() =>{
        let sql = "INSERT INTO post (user_id, content, reply_to) VALUES (?,?,?)"
        const response = await query(sql,[user.user_id, req.body.content, req.body.reply_to]);
        if(response){
            res.status(202).json({message: 'Success'});
            console.log("Success");
        }else{
            res.status(500).json({error: "Internal server error"});
        }
    })();
});

//Returns all posts and their author data, total likes, user like status and reply count from users that the logged in user is following + logged in users own posts
app.get("/posts" ,urlencodedParser, (req, res) => {
    const user = verifyJWT(req, res);
    if(!user) return;
    let sql = "SELECT p.*, u.username, u.profile_img, (SELECT COUNT(*) FROM likes WHERE likes.post_id = p.post_id) AS total_likes," +
        " (SELECT COUNT(*) FROM likes WHERE likes.post_id = p.post_id AND likes.user_id = ?)>0 AS user_like_status," +
        " (SELECT COUNT(*) FROM post WHERE post.reply_to = p.post_id) AS reply_count FROM post p" +
        " INNER JOIN follow f ON (p.user_id = f.following_user_id AND f.user_id = ?)" +
        " INNER JOIN user u ON p.user_id = u.user_id" +
        " UNION ALL SELECT p.*, u.username, u.profile_img, (SELECT COUNT(*) FROM likes WHERE likes.post_id = p.post_id) AS total_likes, " +
        "(SELECT COUNT(*) FROM likes WHERE likes.post_id = p.post_id AND likes.user_id = u.user_id)>0 AS user_like_status," +
        "(SELECT COUNT(*) FROM post WHERE post.reply_to = p.post_id) AS reply_count FROM post p" +
        " INNER JOIN user u ON (p.user_id = u.user_id AND p.user_id = ?) ORDER BY created DESC";

    (async() =>{
        const response = await query(sql, [user.user_id, user.user_id, user.user_id]);
        if(response){
            res.status(202).json({posts: response});
        }else{
            res.status(500).json({error: "Internal server error"});
        }
    })();
});

app.get("/replies", urlencodedParser, (req, res) => {
    const user = verifyJWT(req, res);
    if(!user) return;
    let sql = "SELECT p.*, u.username, u.profile_img, (SELECT COUNT(*) FROM likes WHERE likes.post_id = p.post_id) AS total_likes, " +
        "(SELECT COUNT(*) FROM likes WHERE likes.post_id = p.post_id AND likes.user_id = ?)>0 AS user_like_status, " +
        "(SELECT COUNT(*) FROM post WHERE post.reply_to = p.post_id) AS reply_count FROM post p " +
        "INNER JOIN user u ON p.user_id = u.user_id " +
        "WHERE p.reply_to = ?";
    (async() => {
        const response = await query(sql, [user.user_id, req.query.post_id]).catch((e) => {console.log(e)})
        if(response){
            res.status(202).json({post: response});
        }else{
            res.status(500).json({error: "internal server error"});
        }
    })();
});

app.get("/users", urlencodedParser, (req, res) =>{
    let sql = "SELECT u.username, u.user_id, u.profile_img FROM user u WHERE u.username LIKE ?";
    (async() => {
        req.query.username += "%";
        const response = await query(sql, [req.query.username]);
        if(response){
            res.status(202).json({users: response});
        }else{
            res.status(500).json({error: "internal server error"});
        }
    })().catch((err) => {
        console.log(err);
        res.status(500).json({error: "internal server error"});
    });
});

app.post("/like", urlencodedParser, (req, res) => {
    const user = verifyJWT(req, res);
    if(!user) return;
    let sql = "SELECT COUNT(*) > 0 as foundCount FROM likes WHERE post_id = ? AND user_id = ?";
    (async() =>{
        const count = await query(sql, [req.body.post_id, user.user_id]);
        if(!count) {
            res.status(500).json({error: "internal server error"});
            return;
        };
        sql = !count[0].foundCount ? "INSERT INTO likes (post_id, user_id) VALUES (?, ?)" : "DELETE FROM likes WHERE post_id = ? AND user_id = ?"
        const resp = await query(sql, [req.body.post_id, user.user_id]);
        if(!resp) return;
        sql = "SELECT COUNT(*) AS total_likes FROM likes WHERE post_id = ?";
        const response = await query(sql, [req.body.post_id]);
        res.status(202).json({total_likes: response[0].total_likes, user_like_status: !count[0].foundCount});
    })().catch((e) =>{console.log(e)});
})

app.get("/myInfo", urlencodedParser, (req, res) => {
    const user = verifyJWT(req, res);
    if(!user) return;

    let follows = "SELECT COUNT(*) as follows FROM follow WHERE user_id = ?";
    let followers = "SELECT COUNT(*) as followers FROM follow WHERE following_user_id = ?";
    let posts = "SELECT COUNT(*) as posts FROM post WHERE user_id = ?";

    (async() => {
        const response1 = await query(follows, [user.user_id]);
        const response2 = await query(followers, [user.user_id]);
        const response3 = await query(posts, [user.user_id]);
        if(response1 && response2 && response3){
            res.status(202).json({follows: response1[0].follows, followers: response2[0].followers, posts: response3[0].posts});
        }else{
            res.status(500).json({error: "internal server error"});
        }
    })().catch((e) =>{console.log(e)});
})

app.get("/myPosts", urlencodedParser, (req, res)=>{
     const user = verifyJWT(req, res);
    if(!user) return;

    let sql = "SELECT * FROM post WHERE user_id = ?";

    (async() => {
        const response = await query(sql, [user.user_id]);

        if(response){
            res.status(202).json({posts: response});
        }else{
            res.status(500).json({error: "internal server error"});
        }
    })();
})

app.get("/myFollowers", urlencodedParser, (req, res)=>{
     const user = verifyJWT(req, res);
    if(!user) return;

    let sql = "SELECT follow.user_id, user.username FROM follow INNER JOIN user ON user.user_id = follow.user_id WHERE follow.following_user_id = 1";

    (async() => {
        const response = await query(sql, [user.user_id]);

        if(response){
            res.status(202).json({followers: response});
        }else{
            res.status(500).json({error: "internal server error"});
        }
    })();
})

app.get("/myFollows", urlencodedParser, (req, res)=>{
     const user = verifyJWT(req, res);
    if(!user) return;

   let sql = "SELECT follow.following_user_id AS userId, user.username FROM follow INNER JOIN user ON user.user_id = follow.following_user_id WHERE follow.user_id = ?";

    (async() => {
        const response = await query(sql, [user.user_id]);

        if(response){
            res.status(202).json({follows: response});
        }else{
            res.status(500).json({error: "internal server error"});
        }
    })();
})

app.post("/upload/profile_img", upload.array(), (req, res) =>{
    const user = verifyJWT(req,res);
    if(!user) return;
    if(!req.body.image) return;
    try {
        (async () => {
            const filename = uuidv4() + ".png";
            const base64data = req.body.image.split(";base64,").pop();
            fs.writeFile("uploads/" + filename, base64data, 'base64', function(err) {
                if(err){
                    console.log(err);
                    throw err;
                }
            });
            let imageUrl = 'http://localhost:' + port + '/images?url=' + filename;
            let sql = "UPDATE user SET profile_img = ? WHERE user.user_id = ?";
            const response = await query(sql, [imageUrl, user.user_id]);
            res.status(202).json({message: "success"});
        })()
    }catch(e){
        console.log(e);
        res.status(500).json({error: 'internal server error'});
    }
})

app.get("/images", urlencodedParser, (req, res) =>{
    let filename = req.query.url;
        res.sendFile(__dirname + "/uploads/" + filename, function (err){
            if(err){
                res.sendFile(__dirname + "/uploads/profile_img_default.png", function (err){
                    if(err){
                        res.status(404).json({error: "not found"});
                    }
                });
            }
        });
})

app.post("/update/bio", urlencodedParser, (req, res) =>{
    const user = verifyJWT(req, res);
    (async()=>{
        let sql = "UPDATE user SET bio = ? WHERE user_id = ?";
        const response = query(sql,[req.body.content, user.user_id]);
        if(response){
            res.status(202).json({message: "success"});
        }else throw Error;
    })().catch((e) => res.status(500).json({error: "internal server error"}));
})

app.listen(port, () => {
    console.log(`App listening on port http://localhost:${port}`)
})