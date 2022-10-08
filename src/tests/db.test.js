
const request = require('supertest');
process.env = Object.assign(process.env, {
    TOKEN_KEY: 'testtoken',
    DB_NAME: 'project_db_test',
    DB_USERNAME: 'root',
    DB_PASSWORD: 'root'
})
const server = require('../Server/server');
const util = require("util");
const app = server.app;
const query = util.promisify(server.con.query).bind(server.con);

const user = {
    email: 'test@test.com',
    username: 'test',
    password: 'password'
}
const post = {
    content: 'this is a test post'
}


describe('Server tests', () => {

    /**
     * Account creation & login
     */
    describe('Account creation & login', () => {
        afterAll(async () => {
            await query('DELETE FROM user');
        });
        it('POST /signup -> create account', async () => {
            return request(app).post('/signup').send(user).expect('Content-Type', /json/).expect(202).then((response) => {
                expect(response.body).toEqual(
                    expect.objectContaining({
                        username: 'test',
                        accessToken: expect.any(String),
                        user_id: expect.any(Number)
                    })
                )
            })
        });

        it('POST /login -> login to account', async () => {
            return request(app).post('/login').send(user).expect('Content-Type', /json/).expect(202).then((response) => {
                expect(response.body).toEqual(
                    expect.objectContaining({
                        username: 'test',
                        accessToken: expect.any(String),
                        user_id: expect.any(Number)
                    })
                )
            })
        });

        it('POST /signup -> duplicate email & username', async () => {
            return request(app).post('/signup').send(user).expect('Content-Type', /json/).expect(409);
        });

        it('POST /login -> Invalid password', async () => {
            return request(app).post('/login').send({
                username: 'test',
                password: 'asd'
            }).expect('Content-Type', /json/).expect(401);
        });

        it('POST /login -> Invalid username', async () => {
            return request(app).post('/login').send({
                username: 'asd',
                password: 'password'
            }).expect('Content-Type', /json/).expect(401);
        });

    })

    /**
     * JWT Authorization
     */
    describe('JWT Authorization', () => {
        let auth;
        beforeAll(async () => {
            auth = await request(app).post('/signup').send(user).expect(202).then((resp) => {
                return resp.body.accessToken;
            });
        })
        afterAll(async () =>{
            await query('DELETE FROM post');
            await query('DELETE FROM user');
        })

        it('verifyJWT create a post with a valid token', async () => {
            return request(app).post('/post').send(post).set('Authorization', auth).expect('Content-Type', /json/).expect(202);
        });

        it('verifyJWT invalid token', async () => {
            return request(app).post('/post').send(post).set('Authorization', 'notvalid').expect('Content-Type', /json/).expect(401);
        });

        it('verifyJWT missing token', async () => {
            return request(app).post('/post').send(post).expect('Content-Type', /json/).expect(403);
        });

    })

    /**
     * Creating & retrieving posts & liking posts
     */
    describe('Creating & retrieving posts & liking posts', ()=>{
        let auth;
        let username;
        let user_id;
        let recieved_post;
        beforeAll(async () => {
            const resp = await request(app).post('/signup').send(user).expect(202).then((resp) => {
                return resp.body;
            });
            auth = resp.accessToken;
            username = resp.username;
            user_id = resp.user_id;
            user.user_id = user_id;
            user.auth = auth;
        })

        afterAll(async() => {
            await query('DELETE FROM post');
        })

        it('POST /post -> should be able to add a post', async () =>{
            return request(app).post('/post').send(post).set('Authorization', auth).expect('Content-Type', /json/).expect(202);
        });

        it('GET /user/post -> should be able to retrieve users posts', async() =>{
            return request(app).get('/user/posts?username=' + username).set('Authorization', auth).expect(202)
                .then((response) =>{
                    recieved_post = response.body.posts[0];
                    expect(response.body.posts[0]).toEqual(
                        expect.objectContaining({
                            username: user.username,
                            total_likes: 0,
                            user_like_status: 0,
                            content: post.content,
                            post_id: expect.any(Number),
                            reply_to: null,
                            user_id: user_id,
                            profile_img: null,
                            reply_count: 0,
                            created: expect.anything()
                        })
                    )
                })
        });

        it('GET /post -> should be able to retrieve a single post', async() =>{
            return request(app).get('/post?post_id=' + recieved_post.post_id).set('Authorization', auth).expect(202)
                .then((response) =>{
                    expect(response.body.post[0]).toEqual(
                        expect.objectContaining(recieved_post)
                    )
                })
        });

        it('POST /post -> should be able to add a reply', async () =>{
            return request(app).post('/post').send({
                content: 'this is a reply',
                reply_to: recieved_post.post_id
            }).set('Authorization', auth).expect('Content-Type', /json/).expect(202);
        });

        it('GET /replies -> should be able to retrieve replies', async () =>{
            return request(app).get('/replies?post_id=' + recieved_post.post_id).send(post).set('Authorization', auth)
                .expect('Content-Type', /json/).expect(202)
                .then((response) =>{
                    expect(response.body.post[0]).toEqual(
                        expect.objectContaining({
                            username: user.username,
                            total_likes: 0,
                            user_like_status: 0,
                            content: 'this is a reply',
                            post_id: expect.any(Number),
                            reply_to: recieved_post.post_id,
                            user_id: user_id,
                            profile_img: null,
                            reply_count: 0,
                            created: expect.anything()
                        })
                    )
                })
        });

        it('POST /like -> should be able to like a post', (async () =>{
            return request(app).post('/like').send({
                post_id: recieved_post.post_id
            }).set('Authorization', auth).expect('Content-Type', /json/).expect(202)
                .then((response) =>{
                    expect(response.body).toEqual({
                        total_likes: 1,
                        user_like_status: true
                    });
                })
        }))

        it('POST /like -> should be able to unlike a post', (async () =>{
            return request(app).post('/like').send({
                post_id: recieved_post.post_id
            }).set('Authorization', auth).expect('Content-Type', /json/).expect(202)
                .then((response) =>{
                    expect(response.body).toEqual({
                        total_likes: 0,
                        user_like_status: false
                    });
                })
        }))

    })

    /**
     * Following users & retrieving posts
     */
    describe('Following users & retrieving posts' , () =>{
        let auth;
        let username;
        let user_id;
        beforeAll(async () => {
            const resp = await request(app).post('/signup').send({
                username: 'followuser',
                email: 'follow@test.com',
                password: 'password'
            }).expect(202).then((resp) => {
                return resp.body;
            });
            auth = resp.accessToken;
            username = resp.username;
            user_id = resp.user_id;
            await request(app).post('/post').send({
                content: 'post1'
            }).set('Authorization', auth).expect('Content-Type', /json/).expect(202);

            await request(app).post('/post').send({
                content: 'post2'
            }).set('Authorization', user.auth).expect('Content-Type', /json/).expect(202);
        })

        afterAll(async() =>{
            await query('DELETE FROM user');
            await query('DELETE FROM follow');
        })

        it('GET /users -> should be able to find accounts', async() =>{
            return request(app).get('/users?username=' + user.username).expect(202)
                .then((response) =>{
                    expect(response.body.users[0]).toEqual({
                            username: user.username,
                            user_id: user.user_id,
                            profile_img: null,
                        })
                })
        });

        it('POST /follow -> should be able to follow accounts', async () =>{
            return request(app).post('/follow').send({
                user_id: user.user_id,
                follow: true
            }).set('Authorization', auth).expect('Content-Type', /json/).expect(202)
                .then((response) =>{
                    expect(response.body.user_follow_status).toEqual(true);
                })
        });

        it('GET /user/follows -> should be able to retrieve accounts that user follows', async() =>{
            return request(app).get('/user/follows?username=' + username).set('Authorization', auth).expect(202)
                .then((response) =>{
                    expect(response.body.follows[0]).toEqual({
                        userId: user.user_id,
                        user_id: user.user_id,
                        username: user.username,
                        profile_img: null,
                        user_follow_status: 1,
                    })
                })
        });

        it('GET /user/followers -> should be able to retrieve accounts that follow user', async() =>{
            return request(app).get('/user/followers?username=' + user.username).set('Authorization', auth).expect(202)
                .then((response) =>{
                    expect(response.body.followers[0]).toEqual({
                        user_id: user_id,
                        username: username,
                        profile_img: null,
                        user_follow_status: 0,
                    })
                })
        });

        it('GET /posts -> should be able to retrieve followed users posts and own posts', async() => {
            return request(app).get('/posts').set('Authorization', auth).expect(202)
                .then((response) =>{
                    expect(response.body.posts.length).toEqual(2);
                    expect(response.body.posts[1]).toEqual({
                        username: username,
                        profile_img: null,
                        user_like_status: 0,
                        reply_count: 0,
                        post_id: expect.any(Number),
                        content: 'post1',
                        user_id: user_id,
                        created: expect.anything(),
                        reply_to: null,
                        total_likes: 0
                    })
                    expect(response.body.posts[0]).toEqual({
                        username: user.username,
                        profile_img: null,
                        user_like_status: 0,
                        reply_count: 0,
                        post_id: expect.any(Number),
                        content: 'post2',
                        user_id: user.user_id,
                        created: expect.anything(),
                        reply_to: null,
                        total_likes: 0
                    })
                })
        })

        it('POST /follow -> should be able to unfollow accounts', async () =>{
            return request(app).post('/follow').send({
                user_id: user.user_id,
                follow: false
            }).set('Authorization', auth).expect('Content-Type', /json/).expect(202)
                .then((response) =>{
                    expect(response.body.user_follow_status).toEqual(false);
                })
        });


    })

    /**
     * Update profile data
     */
    describe('Profile data updating', () => {
        it('POST /update/bio -> should be able to update bio', async () =>{
            return request(app).post('/update/bio').send({
                content: 'test bio'
            }).set('Authorization', user.auth).expect('Content-Type', /json/).expect(202);
        });
    })
})