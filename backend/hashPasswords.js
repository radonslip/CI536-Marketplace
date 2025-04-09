const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'nodejs'
});

connection.connect(async function(err) {
    if (err) {
        console.log('Error connecting to database', err);
        return;
    }
    console.log('Connection established');

    connection.query("SELECT * FROM loginuser", async (err, results) => {
        if (err) {
            console.log("Error fetching users: ", err);
            return;
        }

        for (const user of results) {
            const hashedPassword = await bcrypt.hash(user.user_pass, 10); //hash password using bcrypt with salt rounds of 10
            connection.query(
                "UPDATE loginuser SET user_pass = ? WHERE user_name = ?",
                [hashedPassword, user.user_name],
                (err) => {
                    if (err) {
                        console.log(`Error updating password for ${user.user_name}: `, err);
                    } else {
                        console.log(`Password updated for ${user.user_name}`);
                    }
                }
            );
        }
    });
});