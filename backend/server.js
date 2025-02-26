//https://stackoverflow.com/questions/14805567/getting-mysql-path-in-command-prompt
const mysql = require('mysql2'); //https://stackoverflow.com/questions/44946270/er-not-supported-auth-mode-mysql-server
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser'); //for handling data from form
const session = require('express-session'); //manage user session so they 

const port = 4500;

const encoder = bodyParser.urlencoded({extended:true}); //https://stackoverflow.com/questions/24330014/bodyparser-is-deprecated-express-4

const app = express();
app.use(express.static(path.join(__dirname, '../frontend')));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'nodejs'
});

//connect to db
connection.connect(function(err){
    if (err) {
        console.log('Error connecting to database', err);
        return;
    }
    console.log('Connection established');
});

app.get("/",function(req,res){
    res.sendFile('frontend/login.html', {root: path.dirname(__dirname)}); //https://stackoverflow.com/questions/25463423/res-sendfile-absolute-path
});

app.post("/", encoder, function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    connection.query("SELECT * FROM loginuser WHERE user_name = ? AND user_pass = ?", [username,password], function(err,results,fields){
        if(results.length > 0){
            res.redirect('/home');
        } else{
            res.redirect('/?error=Invalid login');
            console.log('Invalid login');
        }
        res.end();
    });
});

app.get("/home",function(req,res){
    res.sendFile('frontend/home.html', {root: path.dirname(__dirname)});
});

app.listen(port);
console.log("Listening on " + port);