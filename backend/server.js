//https://stackoverflow.com/questions/14805567/getting-mysql-path-in-command-prompt
const mysql = require('mysql2'); //https://stackoverflow.com/questions/44946270/er-not-supported-auth-mode-mysql-server
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser'); //for handling data from form
const session = require('express-session'); //manage user session so they 
const bcrypt = require('bcrypt'); //for hashing passwords https://medium.com/@vuongtran/using-node-js-bcrypt-module-to-hash-password-5343a2aa2342

const fs = require("fs");

var cors = require('cors');

const port = 4500;

const encoder = bodyParser.urlencoded({extended:true}); //https://stackoverflow.com/questions/24330014/bodyparser-is-deprecated-express-4

const app = express();

//https://dev.to/husnain/how-to-deploy-node-or-react-app-on-cpanel-which-uses-a-port-using-ssh-a5b
app.use('/authenticated', express.static(path.join(__dirname, '../../public_html/ci536-marketplace/frontend/authenticated')));
app.use('/unauthenticated', express.static(path.join(__dirname, '../../public_html/ci536-marketplace/frontend/unauthenticated')));
app.use(express.static(path.join(__dirname, '../../public_html/ci536-marketplace/frontend')));
app.use(express.json());

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

//https://stackoverflow.com/questions/62159271/nodejs-mysql-reconnecting-on-connection-loss
const connection = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'tg571_node',
    password: 'ciG6wbVuQk.o',
    database: 'tg571_MARKETPLACE'
});

//connect to db
connection.getConnection((err, conn) => {
    if (err) {
        console.log('Error connecting to database', err);
        return;
    }
    console.log('Connection established');
    conn.release(); //release connection to pool
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
    res.sendFile('login.html', {root: path.join(__dirname, '../../public_html/ci536-marketplace/frontend/unauthenticated/')}); //https://stackoverflow.com/questions/25463423/res-sendfile-absolute-path
    //res.sendFile(path.join(__dirname, '../../public_html/ci536-marketplace/frontend/unauthenticated/login.html'));
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
    res.sendFile('home.html', {root: path.join(__dirname, '../../public_html/ci536-marketplace/frontend/authenticated/')});
});


// Send data about the listing to the home page
app.post("/home", encoder, isAuthenticated, function(req,res){

    const body = req.body
  
  // Listing id
    let listId = body.listingID;
    console.log(listId)

  
  //   Find the Listing
      connection.query("SELECT * FROM listings WHERE listing_id = ?", [listId], (err, results) => {
          if (err) 
          {
              // Error if the database cannot be reached
              res.status(500).json({ error: "Database error" });
          } 
          else if (results.length > 0) 
          {
              // If the listing was found return the data about it
              return res.json({
                  status: 'success',
                  title: results[0].listing_title,
                  price: results[0].listing_price
              })
          } 
          else 
          {
              // If the listing was not found then throw an error
              console.log("not found")
              res.status(404).json({ error: "Listing not found" });
          }
      });
      
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
            //console.log(imagePath);
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

// Send listing page to client
app.get("/listing/:listing_id", isAuthenticated, function(req,res){

    res.sendFile('listing.html', {root: path.join(__dirname, '../frontend/authenticated/')});
    
});

// Send data about the listing to the client
app.post("/listing/:listing_id", encoder, isAuthenticated, function(req,res){

  const body = req.body

// Listing Metadata
  let listId = body.listingID;
  let count = 0;
  let dir = path.join(__dirname, `../listings/${listId}`)

// Get how many images need to be returned to the client
  fs.readdir(dir, (err, files) => {
    count = files.length;
  });

//   Find the Listing
    connection.query("SELECT * FROM listings WHERE listing_id = ?", [listId], (err, results) => {
        if (err) 
        {
            // Error if the database cannot be reached
            res.status(500).json({ error: "Database error" });
        } 
        else if (results.length > 0) 
        {
            // If the listing was found return the data about it
            return res.json({
                status: 'success',
                title: results[0].listing_title,
                desc: results[0].listing_description,
                price: results[0].listing_price,
                numOImg: count
            })
        } 
        else 
        {
            // If the listing was not found then throw an error
            console.log("not found")
            res.status(404).json({ error: "Listing not found" });
        }
    });
    
});

// Return listing images to the client when requested
app.get("/listing/:listing_id/:img_id", isAuthenticated, function(req,res){

    // Find the listing directory
    let listId = req.params.listing_id;
    let imageId = req.params.img_id;
    const imagePath = path.join(__dirname, `../listings/${listId}/${imageId}.png`);

    // Send the image to the clint to be displayed, throw an error if not found.
    res.sendFile(imagePath, (err) => {
        if (err) {
            res.status(404).send("Image not found");
        }
    });
    
});

app.listen(port);
console.log("Listening on " + port);