//https://stackoverflow.com/questions/14805567/getting-mysql-path-in-command-prompt
const mysql = require('mysql2'); //https://stackoverflow.com/questions/44946270/er-not-supported-auth-mode-mysql-server
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser'); //for handling data from form
const session = require('express-session'); //manage user session so they 
const bcrypt = require('bcrypt'); //for hashing passwords https://medium.com/@vuongtran/using-node-js-bcrypt-module-to-hash-password-5343a2aa2342
const { IncomingForm } = require('formidable');

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
    secret: 'ci536_marketplace_secret',
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
    connection.query("SELECT * FROM users WHERE user_name = ?", [username], async function(err,results,fields){
        if(err){
            console.log("error: " + err);
            res.redirect('/?error=DB error');
            return;
        } 
        else if(results.length > 0){
            const user = results[0];
            const hashedPassword = await bcrypt.hash(user.user_pass, 10);
            // console.log(hashedPassword)

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
    // console.log(req.session.user)

    // How many listings need to be returned
    let numOfListings = req.body.numOfListings;
    let searchQuery = req.body.searchQuery;
    console.log("search q: " + searchQuery);
    // console.log(numOfListings)

    //   Find the Listings
    //https://www.geeksforgeeks.org/how-to-make-a-search-function-using-node-express-and-mysql/
    if (searchQuery && searchQuery.trim() !== "") //if search entered then search for it in the database
    {
        let searchSQL = `%${searchQuery.trim()}%`; //add wildcards and trim whitespace
        console.log("searchSQL: ", searchSQL);
        connection.query("SELECT * FROM listings WHERE listing_title LIKE ?", [searchSQL], (err, results) => {
            if (err) // Error if the database cannot be reached
            {
                res.status(500).json({ error: "Database error" });
            } 
            else if (results.length > 0) // If a result was found then return it to the client
            {
                responseData = results.slice(0,numOfListings);
                // console.log(responseData)
                return res.json(responseData);
            } 
            else // If no result was found return 404
            {
                console.log("not found");
                res.status(404).json({ error: "Listing not found" });
            }
        });
    } else {
        connection.query("SELECT * FROM listings", (err, results) => {
            if (err) // Error if the database cannot be reached
            {
                res.status(500).json({ error: "Database error" });
            } 
            else if (results.length > 0) // If a result was found then return it to the client
            {
                responseData = results.slice(0,numOfListings);
                // console.log(responseData)
                return res.json(responseData);
            } 
            else // If no result was found return 404
            {
                console.log("not found");
                res.status(404).json({ error: "Listing not found" });
            }
        });
    }
      
})

//get user profile page
app.get("/user/:user_id", isAuthenticated,function(req,res){
    res.sendFile('userProf.html', {root: path.join(__dirname, '../../public_html/ci536-marketplace/frontend/authenticated/')}); //https://stackoverflow.com/questions/25463423/res-sendfile-absolute-path
});

//get user session id for navigation
app.get("/session/user", isAuthenticated, function (req, res) {
    connection.query("SELECT user_id FROM users WHERE user_name = ?", [req.session.user], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        if (results.length > 0) {
            return res.json({ user_id: results[0].user_id });
        } else {
            return res.status(400).json({ error: "User not found" });
        }
    });
});

//get user creation page
app.get("/create/user", function(req,res){
    res.sendFile('userCreate.html', {root: path.join(__dirname, '../../public_html/ci536-marketplace/frontend/unauthenticated/')});
});

//get listing creation page
app.get("/create/listing", isAuthenticated, function(req,res){
    res.sendFile('createListing.html', {root: path.join(__dirname, '../../public_html/ci536-marketplace/frontend/authenticated/')});
});

//create user when form submitted
app.post("/create/user/", encoder, async function(req,res){
    let username = req.body.username;
    let password = req.body.password;
    let displayName = req.body.displayName;
    let location = req.body.location;

    const hashedPassword = await bcrypt.hash(password, 10); //hash password using bcrypt with salt rounds of 10
    connection.query(
        "INSERT INTO users (user_name, user_pass, user_display_name, user_location) VALUES (?)", [[username, hashedPassword, displayName, location]], async function(err,results,fields){
        if(err) {
            console.log(`Error creating user: ${username}: `, err);
        }
        else {
            console.log("User created: ", username);
            res.redirect('/?error=User created, please login');
        }
    });
});

//create user when form submitted
app.post("/create/listing/", encoder, async function(req,res){

    const form = new IncomingForm({
        uploadDir: path.join(__dirname, 'uploads'),
        keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error("Form parsing error:", err);
            return res.status(500).json({ error: 'Form parsing failed' });
        }


        let uploadedFile = files.imgProduct[0];

        let listName = fields.nameProduct[0]
        let listDesc = fields.descProduct[0]
        let listPrice = fields.priceProduct[0]
        let listUser = ""

        connection.query("SELECT user_id FROM users WHERE user_name = ?", [req.session.user], (err, results) => {
            if (err) 
            {
                // Error if the database cannot be reached
                res.status(500).json({ error: "Database error" });
            } 
            else if (results.length > 0) 
            {
                listUser = results[0].user_id

                console.log(listName,listDesc,listPrice,listUser)

                connection.query("INSERT INTO listings (listing_title, listing_description, listing_price, user_id) VALUES (?)", [[listName, listDesc, listPrice, listUser]], async function(err,results,fields){
                    if(err) {
                        console.log(`Error creating listing: ${listName}: `, err);
                    }
                    else {
                        console.log("Listing created: ", listName);

                        connection.query("SELECT listing_id FROM listings ORDER BY listing_created DESC LIMIT 1", async function(err,results,fields){
                            if(err) {
                                console.log("Error finding listing", err);
                            }
                            else {
                                console.log(results[0])
                                imgPath = path.join(__dirname , "../listings/", String(results[0].listing_id),"0.png")
                                console.log(imgPath)

                                fs.mkdirSync(path.join(__dirname , "../listings/", String(results[0].listing_id)))
                                fs.rename(String(uploadedFile.filepath), imgPath, (err) => {
                                    if (err) {
                                        console.error("File move error:", err);
                                        return res.status(500).json({ error: 'Failed to move image' });
                                    }

                                    return res.json({ status: 'success'});
   
                                });
                                
                            }
                        });
                    }
                });
            } 
            else 
            {
                // If the listing was not found then throw an error
                console.log("not found");
                console.log(userID);
                res.status(404).json({ error: "User not found" });
            }
        });
    });

})

app.get("Images/profilepicture.jpg", isAuthenticated,function(req,res){
    const imagePath = path.join(__dirname, '../../public_html/ci536-marketplace/frontend/authenticated/Images/profilepicture.jpg');
    console.log(imagePath)

    res.sendFile(imagePath, (err) => {
        if (err) {
            res.status(404).send("Image not found test");
        }
    });
    // res.sendFile('userProf.html', {root: path.join(__dirname, '../frontend/authenticated/')}); //https://stackoverflow.com/questions/25463423/res-sendfile-absolute-path
});

// Send data about the user to the profile page
app.post("/user/:user_id", encoder, isAuthenticated, function(req,res){
  
    //user id
    let userID = req.params.user_id;
    let numOfListings = 10;
  
    //Find the user
    connection.query("SELECT * FROM users WHERE user_id = ?", [userID], (err, results) => {
        if (err) 
        {
            // Error if the database cannot be reached
            res.status(500).json({ error: "Database error" });
        } 
        else if (results.length > 0) 
        {
            connection.query("SELECT * FROM listings WHERE user_id = ?", [userID], (err, listResults) => {
                if (err) // Error if the database cannot be reached
                {
                    res.status(500).json({ error: "Database error" });
                } 
                let listingData = listResults.slice(0,numOfListings);
                // If the user was found return the data about it
                return res.json({
                    status: 'success',
                    display_name: results[0].user_display_name,
                    location: results[0].user_location,
                    listings: listingData
                });
            });
        } 
        else 
        {
            // If the user was not found then throw an error
            console.log("not found");
            console.log(userID);
            res.status(404).json({ error: "User not found" });
        }
    });

});

// //why express not sockets: https://stackoverflow.com/questions/20080941/serving-images-over-websockets-with-nodejs-socketio
// //get image db query

// Send listing page to client
app.get("/listing/:listing_id", isAuthenticated, function(req,res){

    res.sendFile('listing.html', {root: path.join(__dirname, '../../public_html/ci536-marketplace/frontend/authenticated/')});
    
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
console.log("Listening on " + port)