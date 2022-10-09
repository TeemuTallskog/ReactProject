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



app.use(cors());

const con = mysql.createConnection({
    host: "localhost",
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

con.connect(function(err) {
    if(err) throw err;
    console.log("Connected to MySQL!");
});

const query = util.promisify(con.query).bind(con);

/**
 * Verifies JWT token and returns a user object if valid or null
 * @param req
 * @param res
 * @param next
 * @returns {null|user_object}
 */
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

/**
 * api used to login and generate a jwt token
 * @param{email}
 * @param{password}
 * @returns{accessToken} - JWT token
 * @returns{username}
 * @returns{user_id}
 */
app.post('/login', urlencodedParser, (req, res) => {
    let sql = "SELECT * FROM user WHERE email = ?";
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
                        res.status(202).json({accessToken: accessToken, username: response[0].username, user_id: response[0].user_id});
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

/**
 * api used to sign up and generate a jwt token
 * @param{username}
 * @param{email}
 * @param{password}
 * @returns{accessToken} - JWT token
 * @returns{username}
 * @returns{user_id}
 */
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
                    console.log(process.env.TOKEN_KEY);
                    const accessToken = jwt.sign({user: user}, process.env.TOKEN_KEY, {expiresIn: '1h'});
                    res.status(202).json({accessToken: accessToken, username: req.body.username, user_id: response.insertId});
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

/**
 * api to retrieve a single post
 * @param{post_id} ID - of the post you want to retrieve
 * @returns{post} object
 */
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


/**
 * api to create a new post
 * @param{content} string - content of the post
 * @param{reply_to} ID - optional parameter indicating the post is a reply to another post
 * @returns{success/error}
 */
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

/**
 * Returns all posts and their author data, total likes, user like status and reply count from users that the logged in user is following + logged in users own posts
 * @returns{posts:[]} array of post objects
 */
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

/**
 * api to retrieve replies to a post
 * @param{post_id} ID - id of the post you want to fetch replies for
 * @returns{post:[]} array of post objects from the replies
 */
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

/**
 * api to search for users
 * @param{username} string - search string for usernames
 * @returns{users:[]} - returns an array user objects that match the search
 */
app.get("/users", urlencodedParser, (req, res) =>{
    let user = null;
    if(req.headers.authorization){
        user = verifyJWT(req, res);
        if(!user) return;
    }
    req.query.username += "%";
    let sql = user ? "SELECT u.username, u.user_id, u.profile_img," +
        "(SELECT COUNT(*) FROM follow f WHERE f.user_id = ? AND f.following_user_id = u.user_id)>0 AS user_follow_status " +
        "FROM user u WHERE u.username LIKE ?" : "SELECT u.username, u.user_id, u.profile_img FROM user u WHERE u.username LIKE ?";
    let params = user ? [user.user_id, req.query.username] : [req.query.username];
    (async() => {
        const response = await query(sql, params);
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

/**
 * api to like a post
 * @param{post_id} - id of the post you want to like
 * @return{total_likes} Number - count of total likes on the post
 * @return{user_like_status} boolean - true->post is now liked, false->post is not liked
 */
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

/**
 * first verifies JSON Token then returns the selected user's info
 * @param{string} username - user who's info is returned 
 * @param{int} user_id - logged in user's id
 * @returns error or count of users follows, followers, posts and the information if loggedin in user is following the user who's info is returned and whether logged in user is selected user.
 */
app.get("/account", urlencodedParser, (req, res) => {
    const user = verifyJWT(req, res);
    if(!user) return;

    let follows = "SELECT COUNT(*) as follows FROM follow WHERE user_id IN(SELECT user_id FROM user WHERE username = ?)";
    let followers = "SELECT COUNT(*) as followers FROM follow WHERE following_user_id IN(SELECT user_id FROM user WHERE username = ?)";
    let posts = "SELECT COUNT(*) as posts FROM post WHERE user_id IN(SELECT user_id FROM user WHERE username = ?)";
    let followStatus = "SELECT COUNT(*) as following FROM follow WHERE user_id = ? AND following_user_id IN(SELECT user_id FROM user WHERE username = ?)";
    let account = "SELECT username, bio, profile_img, user_id FROM user WHERE user.username = ?"
    let myUser = user.username === req.query.username;

    (async() => {
        const response1 = await query(follows, [req.query.username]);
        const response2 = await query(followers, [req.query.username]);
        const response3 = await query(posts, [req.query.username]);
        const response4 = await query(followStatus, [user.user_id, req.query.username]);
        const response5 = await query(account, [req.query.username]);


        if(response1 && response2 && response3 && response4 && response5){
            let following = response4[0].following > 0;
            res.status(202).json({follows: response1[0].follows, followers: response2[0].followers, posts: response3[0].posts, myUser: myUser, isFollowing: following , user: response5[0]});
        }else{
            res.status(500).json({error: "internal server error"});
        }
    })().catch((e) =>{console.log(e)});
})

/**
 * first verifies JSON Token then returns the selected user's posts by username
 * @param{string} username - user who's post to return
 * @returns list of posts or error
 */
app.get("/user/posts", urlencodedParser, (req, res)=>{
     const user = verifyJWT(req, res);
    if(!user) return;
    let sql = "SELECT p.*, u.username, u.profile_img, (SELECT COUNT(*) FROM likes WHERE likes.post_id = p.post_id) AS total_likes, " +
        "(SELECT COUNT(*) FROM likes WHERE likes.post_id = p.post_id AND likes.user_id = u.user_id)>0 AS user_like_status," +
        "(SELECT COUNT(*) FROM post WHERE post.reply_to = p.post_id) AS reply_count FROM post p" +
        " INNER JOIN user u ON (p.user_id = u.user_id AND u.username = ?) ORDER BY created DESC";

    (async() => {
        const response = await query(sql, [req.query.username]);

        if(response){
            res.status(202).json({posts: response});
        }else{
            res.status(500).json({error: "internal server error"});
        }
    })();
})

/**
 * first verifies JSON Token then returns selected user's followers usernames and ids
 * @param{string} username - user who's post to return
 * @returns list of usernames and their user id's or error
 */
app.get("/user/followers", urlencodedParser, (req, res)=>{
     const user = verifyJWT(req, res);
    if(!user) return;

    let sql = "SELECT follow.user_id, user.username, user.user_id, user.profile_img, " +
        "(SELECT COUNT(*) FROM follow f WHERE f.user_id = ? AND f.following_user_id = user.user_id)>0 AS user_follow_status " +
        "FROM follow INNER JOIN user ON user.user_id = follow.user_id WHERE follow.following_user_id IN(SELECT user_id FROM user WHERE username = ?)";

    (async() => {
        const response = await query(sql, [user.user_id, req.query.username]);

        if(response){
            res.status(202).json({followers: response});
        }else{
            res.status(500).json({error: "internal server error"});
        }
    })();
})


/**
 * first verifies JSON Token then returns users the selected user follows
 * @param{string} username - user who's follows to return
 * @returns list of usernames and their user id's or error
 */
app.get("/user/follows", urlencodedParser, (req, res)=>{
     const user = verifyJWT(req, res);
    if(!user) return;

   let sql = "SELECT follow.following_user_id AS userId, user.username, user.user_id, user.profile_img, " +
       "(SELECT COUNT(*) FROM follow f WHERE f.user_id = ? AND f.following_user_id = user.user_id)>0 AS user_follow_status " +
       "FROM follow INNER JOIN user ON user.user_id = follow.following_user_id WHERE follow.user_id IN(SELECT user_id FROM user WHERE username = ?)";

    (async() => {
        const response = await query(sql, [user.user_id, req.query.username]);

        if(response){
            res.status(202).json({follows: response});
        }else{
            res.status(500).json({error: "internal server error"});
        }
    })();
})

/**
 * api used to upload a profile picture
 * @param{base64} image/String - base64 string of the image submitted
 * @returns success/error
 */
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

/**
 * used to retrieve an image from the server
 * @param{url} string - name of the image on the server
 * @returns{image} file
 */
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

/**
 * api used to update user bio
 * @param{content} string - bio
 * @returns{success/error}
 */
app.post("/update/bio", urlencodedParser, (req, res) =>{
    const user = verifyJWT(req, res);
    if(!user) return;
    (async()=>{
        let sql = "UPDATE user SET bio = ? WHERE user_id = ?";
        const response = query(sql,[req.body.content, user.user_id]);
        if(response){
            res.status(202).json({message: "success"});
        }else throw Error;
    })().catch((e) => res.status(500).json({error: "internal server error"}));
})

/**
 * api used to follow a user
 * @param{follow} boolean - indication true -> follow user, false -> unfollow user
 * @param{user_id} - id of the user you want to follow
 * @returns{user_follow_status} boolean - true user is now being followed, false user is not being followed
 */
app.post("/follow", urlencodedParser, (req, res) => {
    const user = verifyJWT(req, res);
    if(!user) return;
    let sql = "SELECT COUNT(*) > 0 as foundCount FROM follow WHERE user_id = ? AND following_user_id = ?";
    (async() =>{
        const count = await query(sql, [user.user_id, req.body.user_id]);
        if(!count) {
            res.status(500).json({error: "internal server error"});
            return;
        };
        if(count[0].foundCount == req.body.follow) {
            res.status(202).json({user_follow_status: req.body.follow});
            return;
        }
        sql = req.body.follow ? "INSERT INTO follow (user_id, following_user_id) VALUES (?, ?)" : "DELETE FROM follow WHERE user_id = ? AND following_user_id = ?";
        const resp = await query(sql, [user.user_id, req.body.user_id]);
        if(!resp) return;
        res.status(202).json({user_follow_status: req.body.follow});
    })().catch((e) =>{
        console.log(e)
        res.status(500).json({error: 'internal server error'});
    });
})

/**
 * first verifies JSON Token then add or removes follow from the database.
 * @param{boolean} following - boolean wheather follow should be added or removed
 * @param{string} username - the name of the user that will be followed or unfollowed
 * @param{int} user_id - id of the user who will do the following or unfollowing
 * @returns sucess status or error
 */
app.post("/user/follow", urlencodedParser, (req,res)=>{
    const user = verifyJWT(req, res);
    if(!user) return;
    let sql = req.body.following ? "INSERT INTO follow (user_id, following_user_id) VALUES (?, (SELECT user_id FROM user WHERE username = ?))" : "DELETE FROM follow WHERE user_id = ? AND following_user_id IN(SELECT user_id FROM user WHERE username = ?)";
    (async() => {
        const response = await query(sql, [user.user_id, req.body.username]);
        if(response){
            res.sendStatus(202);
        }else{
            res.status(500).json({error: "internal server error"});
        }
    })();
})

/**
 * used to get the profile image name of the logged in user
 * @returns{profile_img} - name of the image file
 */
app.get("/profile_img", urlencodedParser, (req, res) =>{
    const user = verifyJWT(req, res);
    if(!user) return;
    let sql = "SELECT u.profile_img FROM user u WHERE u.user_id = ?";
    (async() => {
        const response = await query(sql, [user.user_id]);
        if(response){
            res.status(202).json({
                profile_img: response[0].profile_img
            })
        }else{
            res.status(500).json({error: "internal server error"});
        }
    })();
})

/**
 * used to delete a post
 * @param{post_id} id - id of the post to be deleted
 * @returns{success/error}
 */
app.delete("/delete/post", urlencodedParser, (req, res) =>{
    const user = verifyJWT(req, res);
    if(!user) return;
    let sql = "DELETE FROM post WHERE user_id = ? AND post_id = ?";
    (async() => {
        const response = await query(sql, [user.user_id, req.query.post_id]);
        if(response){
            res.status(202).json({
                message: "success"
            })
        }else{
            res.status(500).json({error: "internal server error"});
        }
    })();
})

app.listen(port, () => {
    console.log(`App listening on port http://localhost:${port}`)
})

module.exports = {app, con};