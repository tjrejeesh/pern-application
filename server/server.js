const dotenv = require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const pg = require("pg");
const cors = require("cors");
const app = express();
const jwt = require('jsonwebtoken');

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const config = {
    user: process.env.PG_USER,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASS,
    port: process.env.PG_PORT
};

const PORT = 5000;

const pool = new pg.Pool(config);

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});

app.post("/api/login", (req, res) => {
    pool.connect(function(err, client, done) {
        if (err) {
            console.log("Unable to connect to the database due to " + err);
        }
        const sql = 'SELECT * FROM users WHERE email=$1 and password=$2';
        const param = [req.body.values.email, req.body.values.password]
        client.query(sql, param, function(err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            else if(result.rows.length === 0) {
                res.json({
                    login_status: 'invalid',
                    message: 'No records found!'
                })
            }else{
                const user = {
                    id: result.rows[0].id,
                    email: result.rows[0].email,
                };
                console.log(user);
                jwt.sign({user}, 'secretkey', {expiresIn: '1h'}, (err, token) => {
                    res.json({
                        token,
                        id: user.id,
                        email: user.email
                    })
                });
            }
        });
    });
});

app.post("/api/register", (req, res) => {
    console.log('post body', req.body);
    pool.connect(function(err, client, done) {
        if (err) {
            console.log("Unable to connect to the database due to " + err);
        }
        const sql = 'INSERT INTO users (name, email, password) ' +
            'VALUES ($1, $2, $3);';
        const param = [req.body.values.name, req.body.values.email, req.body.values.password];
        client.query(sql, param, function(err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            res.status(200).send(result.rows);
        });
    });
});

function verifyToken(req, res, next){
    const bearerHeader = req.body.headers['authorization'];
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    }else{
        res.sendStatus(403)
    }
}

app.post("/api/users", verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err){
            res.sendStatus(403);
        }else{
            pool.connect(function(err, client, done) {
                if (err) {
                    console.log("Unable to connect to the database due to " + err);
                }
                client.query("SELECT * FROM users", function(err, result) {
                    done();
                    if (err) {
                        console.log(err);
                        res.status(400).send(err);
                    }
                    res.json({
                        results: result.rows,
                        authData: authData
                    })
                });
            });
        }

    });
});

app.get("/api/posts", (req, res) => {
    pool.connect(function(err, client, done) {
        if (err) {
            console.log("Unable to connect to the database due to " + err);
        }
        client.query("SELECT * FROM posts", function(err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            res.status(200).send(result.rows);
        });
    });
});

app.post("/api/addproduct", (req, res) => {
    console.log('post body', req.body);
    pool.connect(function(err, client, done) {
        if (err) {
            console.log("Unable to connect to the database due to " + err);
        }
        const sql = 'insert into products(title, description) values($1, $2)';
        const param = [req.body.values.title, req.body.values.description];
        client.query(sql, param, function(err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            res.status(200).send(result.rows);
        });
    });
});

app.post("/api/updateproduct", (req, res) => {
    console.log('post body', req.body);
    pool.connect(function(err, client, done) {
        if (err) {
            console.log("Unable to connect to the database due to " + err);
        }
        const sql = 'UPDATE products SET title = $1, description = $2 WHERE id = $3';
        const param = ['Aro', 'entho', req.body.values.id];
        client.query(sql, param, function(err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            res.status(200).send(result.rows);
        });
    });
});

app.post("/api/deleteproduct", (req, res) => {
    console.log('post body', req.body);
    pool.connect(function(err, client, done) {
        if (err) {
            console.log("Unable to connect to the database due to " + err);
        }
        const sql = 'DELETE from products WHERE id = $1';
        const param = [req.body.values.id];
        client.query(sql, param, function(err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            res.status(200).send(result.rows);
        });
    });
});

app.listen(PORT, () =>{
    console.log(`Server is listening to port ${PORT}`);
});
