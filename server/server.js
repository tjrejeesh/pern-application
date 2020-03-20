const dotenv = require("dotenv").config();
const express = require('express');
const pg = require("pg");
const cors = require("cors");
const app = express();

app.use(cors());

const config = {
    user: process.env.PG_USER,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASS,
    port: process.env.PG_PORT
};

const PORT = 3000;

const pool = new pg.Pool(config);

app.get("/api/users", (req, res, next) => {
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
            res.status(200).send(result.rows);
        });
    });
});

app.get("/api/posts", (req, res, next) => {
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

app.listen(PORT, () =>{
    console.log(`Server is listening to port ${PORT}`);
});
