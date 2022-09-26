const express = require('express');
const app = express();
const port = 8080;
const cors = require('cors');
const util = require('util');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const urlencodedParser = bodyParser.urlencoded({extended: false});
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

require('dotenv').config({path: '../../.env'});

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

const verifyJWT = function (req, res){
    if(req.headers.authorization){
        try{
            const verified = jwt.verify(req.headers.authorization, process.env.TOKEN_KEY);
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

app.post("/post", urlencodedParser, (req, res) => {
    const user = verifyJWT(req, res);
    if(!user){
        console.log("invalid login");
        return;
    }
    (async() =>{
        let sql = "INSERT INTO post (user_id, content) VALUES (?,?)"
        const response = await query(sql,[user.user_id, req.body.content]);
        if(response){
            res.status(202).json({message: 'Success'});
            console.log("Success");
        }else{
            res.status(500).json({error: "Internal server error"});
        }
    })();
});

app.listen(port, () => {
    console.log(`App listening on port http://localhost:${port}`)
})