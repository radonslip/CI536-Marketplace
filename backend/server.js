//https://stackoverflow.com/questions/14805567/getting-mysql-path-in-command-prompt
const mysql = require('mysql2'); //https://stackoverflow.com/questions/44946270/er-not-supported-auth-mode-mysql-server
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser'); //for handling data from form
const session = require('express-session'); //manage user session so they 
const bcrypt = require('bcrypt'); //for hashing passwords https://medium.com/@vuongtran/using-node-js-bcrypt-module-to-hash-password-5343a2aa2342

const port = 4500;

const encoder = bodyParser.urlencoded({extended:true}); //https://stackoverflow.com/questions/24330014/bodyparser-is-deprecated-express-4

const app = express();

app.use('/authenticated', express.static(path.join(__dirname, '../frontend/authenticated')));
app.use('/unauthenticated', express.static(path.join(__dirname, '../frontend/unauthenticated')));
app.use(express.static(path.join(__dirname, '../frontend')));

//express session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false} //todo false for local dev
}));
app.use((req, res, next) => {
    //console.log("session: ", req.session);
    //console.log("user: ", req.session && req.session.user);
    if (req.path.endsWith('home.html') && (!req.session || !req.session.user)) {
        return res.redirect('/?error=Not logged in');
    }
    next();
});

//connect to db
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

//check if authenticated using session
function isAuthenticated(req,res,next){
    if(req.session && req.session.user){
        return next();
    } else{
        res.redirect('/?error=Not logged in');
    }
}

//get login page
app.get("/",function(req,res){
    res.sendFile('login.html', {root: path.join(__dirname, '../frontend/unauthenticated/')}); //https://stackoverflow.com/questions/25463423/res-sendfile-absolute-path
});

//login with db query
app.post("/", encoder, async function(req,res){
    let username = req.body.username;
    let password = req.body.password;
    connection.query("SELECT * FROM loginuser WHERE user_name = ?", [username], async function(err,results,fields){
        if(err){
            console.log("error: " + err);
            res.redirect('/?error=DB error');
            return;
        } 
        else if(results.length > 0){
            const user = results[0];

            try {
                //compare password with hashed password in database
                /*hash generated using: 
                const hashedPassword = await bcrypt.hash(user.user_pass, 10);
                where 10 is the salt rounds to generate a salt to be used*/
                const match = await bcrypt.compare(password, user.user_pass);
                if (match) {
                    console.log("logged in: ", username);
                    req.session.user = username;
                    res.redirect('/home');
                } else {
                    console.log("Incorrect password");
                    res.redirect('/?error=Invalid login');
                }
            } catch (err) {
                console.log("Error comparing passwords: " + err);
                res.redirect('/?error=Server error');
            }
        }
        else{
            res.redirect('/?error=Invalid login');
            console.log('Invalid login');
        }
    });
});

//get home page if logged in
app.get("/home", isAuthenticated, function(req,res){
    res.sendFile('home.html', {root: path.join(__dirname, '../frontend/authenticated/')});
});

//why express not sockets: https://stackoverflow.com/questions/20080941/serving-images-over-websockets-with-nodejs-socketio
//get image db query
app.get("/listings/:listing_id/:image_id/image.png", (req, res) => { //https://expressjs.com/en/guide/routing.html
    let imageId = req.params.image_id;
    let listingId = req.params.listing_id;
    //https://dev.mysql.com/doc/refman/8.0/en/symbolic-links-to-databases.html
    connection.query("SELECT * FROM listing_images WHERE image_id = ? AND listing_id = ?", [imageId,listingId], (err, results) => {
        if (err) {
            res.status(500).json({ error: "Database error" });
        } else if (results.length > 0) {
            // Modify image path to be served via our route
            const imagePath = path.join(__dirname, `../listings/${listingId}/${imageId}/image.png`);
            console.log(imagePath);
            res.sendFile(imagePath, (err) => {
                if (err) {
                    res.status(404).send("Image not found");
                }
            });
        } else {
            res.status(404).json({ error: "Listing not found" });
        }
    });
});

app.listen(port);
console.log("Listening on " + port);