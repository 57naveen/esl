    const mysql= require("mysql");
    const sql = require("mssql/msnodesqlv8");
    const bcrypt = require("bcryptjs")
    const jwt = require("jsonwebtoken");
    const { promisify } = require("util");
    const crypto= require('crypto');
    const session = require('express-session');
    const nodemailer = require('nodemailer')
   

/*
var config = {
    database: process.env.DATABASE,
    server: process.env.DATABASE_SERVER,
    driver: process.env.DATABASE_DRIVER,
    options: {  
        trustedConnection: true
    }
};*/

 
var config = {    
    database: 'login',
    server: 'WIN-MUSC6MOGOU0\\SQLEXPRESS',
    driver: 'msnodesqlv8',
   options: {       
     trustedConnection: true
    }  
 };

 

 // Configure session middleware

 
 
 exports.Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).render("index", { msg: 'Please Enter Your Email and Password', msg_type: "error" });
        }

        const pool = await sql.connect(config);  
        const request = new sql.Request(pool);

        request.input('EmailParam', sql.VarChar, email);
        request.query('SELECT * FROM users WHERE email = @EmailParam', async (error, result) => {
            if (error) {
                console.log('Error:', error);
                return;
            }

            console.log('Query Result:', result); // Log the entire query result
 
            const user = result.recordset[0];

          if (!user) {
                return res.status(401).render('index', { msg: 'Invalid credentials', msg_type: "error" });
            }

            console.log('User Object:', user); // Log the user object to check its structure

            // Check if the user object has a password property
            if (!user.hasOwnProperty('password')) {
                return res.status(401).render('index', { msg: 'No password found for the user', msg_type: "error" });
            }
           

            const trimmedPassword = password.trim();

            // Compare the hashed password with the input password
            const passwordMatch = await bcrypt.compare(trimmedPassword, user.password);

            console.log('Password Match Result:', passwordMatch);

            if (!passwordMatch) {
                return res.status(401).render('index', { msg: 'Invalid credentials', msg_type: "error" });
            } else {
                // Correct password, proceed to generate JWT token

                const id = user.ID; // Make sure the property name matches your DB schema
                const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN,
                });

                console.log("The Token is: " + token);
                const cookieOptions ={
                    expires: 
                    new Date(
                        Date.now() +
                        process.env.JWT_COOKIE_EXPIRES *24*60*60*1000
                    ),
                    httpOnly:true,
                };
                res.cookie("naveen:",token,cookieOptions);
                res.status(200).redirect("/dash");

            }
        });
 
    } catch (error) {
        console.log("naveen");
    }
};



exports.register =(req, res) =>
{   

    // res.send("Form submitted ")
    //console.log(name);
    // console.log(email);


console.log(req.body);
const{name,email,password,confirm_password}=req.body

sql.connect(config, function(err) {
    if (err) {
        console.log(err);
    }
    var request = new sql.Request();

    request.input('EmailParam', sql.VarChar, email);
    request.query('SELECT COUNT(*) AS count FROM users WHERE email=@EmailParam',async(error, result) => {
        if (error) {
            console.log('Error:', error);
            return;
        }
       const existingCount = result.recordset[0].count;

        if (existingCount > 0) { 
        return res.render('register', { msg: 'Email ID already taken', msg_type:"error" });
         }
         else if(password!==confirm_password)
         {
            return res.render('register', { msg: 'Password do not match', msg_type:"error" });
         }
         let hashedPassword =await bcrypt.hash(password,8);
         //console.log(hashedPassword);
         request.input('Name', sql.VarChar, name);
         request.input('Email', sql.VarChar, email);
         request.input('HashedPassword', sql.VarChar, hashedPassword);

         request.query('INSERT INTO users (name, email, password) VALUES (@Name, @Email, @HashedPassword)', (insertError, insertResult) => {
           if(error){
                console.log(error);
            }else{
                console.log(result);
                return res.render('register', { msg: 'User registration success', msg_type:"good" });
 
            }
        });
         
    });
});  
   
};  

exports.isLoggedIn = async (req, res, next) => {
    try {
        if (req.cookies.naveen) {
            console.log("Cookie Present");
        } else {
            console.log("Cookie Not Present");
            next();
        }
    } catch (error) {
        console.error("Error:", error);
    }
};


exports.forgotPassword = async (req, res) => {
    
    const { email } = req.body;

    // SQL Server configuration
    const config = {
        server: 'WIN-MUSC6MOGOU0\\SQLEXPRESS',
        database: 'login',
        driver: 'msnodesqlv8',
        options: {
            trustedConnection: true
        }
    };

    try {
        const pool = await sql.connect(config);

        // Check if the email exists in the database
        const queryResult = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM users WHERE email = @email');

        if (queryResult.recordset.length === 0) {
            return res.render('forgotpage', { msg: 'Failed to send reset email', msg_type:"error" })
        }

        // Email exists, generate a reset token
        const token = crypto.randomBytes(32).toString('hex');

        // Store the token and set an expiration date in the PasswordResetTokens table
        const insertTokenQuery = await pool.request()
            .input('email', sql.NVarChar, email)
            .input('token', sql.NVarChar, token)
            .input('expires', sql.DateTime, new Date(Date.now() + 3600000)) // Set an expiration date (e.g., 1 hour from now)
            .query('INSERT INTO PasswordResetTokens (email, token, expires) VALUES (@email, @token, @expires)');

        // Send a password reset link to the user's email
        const transporter = nodemailer.createTransport({
            // Configure your email service (e.g., SMTP settings)
                 host: 'smtp.gmail.com',
                 port: 465,
                secure: true, // Set to true for secure (SSL/TLS) connection
                auth: {
                    user: 'esspldummy18@gmail.com',
                    pass: 'ltbbkzepalbenyce'
    },

    // Increase the timeout (in milliseconds)
    timeout: 120000, // 60 seconds, adjust as needed
        });

        const mailOptions = {
            from: 'esspldummy18@gmail.com',
            to: email,
            subject: 'Password Reset Request',
            text: `To reset your password, click the following link: "http://localhost:5000/passreset?token=${token}`,
           // html: `To reset your password, click the following link: <a href="http://localhost:5000/passreset?token=${token}">Reset Password</a>`
        };              

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email error:', error);
                return res.render('forgotpage', { msg: 'Failed to send reset email', msg_type:"error" })
            } else {     
                console.log('Email sent:', info.response);
                return res.render('forgotpage', { msg: 'Mail sent succesfully', msg_type:"good" })
               
            }
        });
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    } finally {
        sql.close();
    }
};






exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    // SQL Server configuration
    const config = {
        server: 'WIN-MUSC6MOGOU0\\SQLEXPRESS',
        database: 'login',
        driver: 'msnodesqlv8',
        options: {
            trustedConnection: true
        }
    };
  

    try {
        const pool = await sql.connect(config);

        // Check if the token is valid and not expired
        const queryResult = await pool.request()
            .input('token', sql.NVarChar, token)
            .query('SELECT * FROM PasswordResetTokens WHERE token = @token AND expires > GETDATE()');

    

        // Valid token, hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the 'users' table
        const updateUserQuery = await pool.request()
            .input('email', sql.NVarChar, queryResult.recordset[0].email)
            .input('hashedPassword', sql.NVarChar, hashedPassword)
            .query('UPDATE users SET password = @hashedPassword WHERE email = @email');

        if (updateUserQuery.rowsAffected[0] === 1) {
            // Password successfully updated
            // Remove the used token from the 'PasswordResetTokens' table
            const deleteTokenQuery = await pool.request()
                .input('token', sql.NVarChar, token)
                .query('DELETE FROM PasswordResetTokens WHERE token = @token');

            if (deleteTokenQuery.rowsAffected[0] === 1) {
                // Token successfully deleted
                return res.status(200).json({ message: 'Password reset successful' });
            } else {
                // Failed to delete token
                return res.status(500).json({ error: 'Failed to delete token' });
            }
        } else {
            // Failed to update password
            return res.status(500).json({ error: 'Failed to update password' });l
        }
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        sql.close();
    }

  
};




/*exports.resetPassword = (req, res) => {
    const { token, newPassword } = req.body;

    // Verify the token (e.g., check it against the database)
    if (verifyToken(token)) {
        // Update the user's password with the new one
        const success = updatePassword(token, newPassword);

        if (success) {
            // Password reset successful, redirect to a success page
            res.redirect('/reset-success');
        } else {
            // Password reset failed, redirect to an error page
            res.redirect('/reset-error');
        }
    } else {
        // Handle invalid tokens (e.g., display an error page)
        res.redirect('/invalid-token');
    }
};*/



/*
exports.resetPassword = (req, res) => {
    const { token, newPassword } = req.body;

    // Verify the token (e.g., check it against the database)
    if (verifyToken(token)) {
        // Update the user's password with the new one
        const success = updatePassword(token, newPassword);

        if (success) {
            // Password reset successful, redirect to a success page
            res.redirect('/reset-success');
        } else {
            // Password reset failed, redirect to an error page
            res.redirect('/reset-error');
        }
    } else {
        // Handle invalid tokens (e.g., display an error page)
        res.redirect('/invalid-token');
    }
};*/


/*
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    const config = {
        server: 'WIN-MUSC6MOGOU0\\SQLEXPRESS',
        database: 'login',
        driver: 'msnodesqlv8',
        options: {
            trustedConnection: true
        }
    };
    try {
        // Connect to the SQL Server
        const pool = await sql.connect(config);

        // Check if the token is valid and not expired
        const queryResult = await pool.request()
            .input('token', sql.NVarChar, token)
            .query('SELECT * FROM PasswordResetTokens WHERE token = @token AND expires > GETDATE()');

        if (queryResult.recordset.length === 0) {
            // If the token is invalid or expired, redirect to the password reset page
            return res.redirect('/passreset'); 
        }

        // Valid token, hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the 'users' table
        const updateUserQuery = await pool.request()
            .input('email', sql.NVarChar, queryResult.recordset[0].email) // Assuming you have an 'email' column in your 'PasswordResetTokens' table
            .input('hashedPassword', sql.NVarChar, hashedPassword)
            .query('UPDATE users SET password = @hashedPassword WHERE email = @email');

        if (updateUserQuery.rowsAffected[0] === 1) {
            // Password successfully updated
            // Remove the used token from the 'PasswordResetTokens' table
            const deleteTokenQuery = await pool.request()
                .input('token', sql.NVarChar, token)
                .query('DELETE FROM PasswordResetTokens WHERE token = @token');

            return res.status(200).json({ message: 'Password reset successful' });
        } else {
            // Password update failed
            return res.status(500).json({ message: 'Failed to update password' });
        }
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    } finally {
        sql.close();
    }
};

*/

                    





exports.sideinput = async (req, res) => {
    const { Date, ConsultantName, TicketNumber, TypeOfTicket, ProcessDocumentRevision, Status, From, To, TicketAssignedDate, BriefDetails } = req.body;

    try {
        // Check if TicketNumber is null or undefined
        if (TicketNumber === null || TicketNumber === undefined) {
            return res.render('sideinput', { msg: 'Ticket Number is required', msg_type: 'error' });
        }

        // Define your SQL query to insert data into the database
        const query = `
            INSERT INTO details (Date, ConsultantName, TicketNumber, TypeOfTicket, ProcessDocumentRevision, Status, FromTime, ToTime, TicketAssignedDate, BriefDetails)
            VALUES (
                @Date,
                @ConsultantName,
                @TicketNumber,
                @TypeOfTicket,
                @ProcessDocumentRevision,
                @Status,
                @From,
                @To,
                @TicketAssignedDate,
                @BriefDetails
            )
        `;

        // Execute the SQL query with parameters
        const request = new sql.Request();
        request.input('Date', sql.Date, Date);
        request.input('ConsultantName', sql.NVarChar, ConsultantName);
        request.input('TicketNumber', sql.Int, TicketNumber);
        request.input('TypeOfTicket', sql.NVarChar, TypeOfTicket);
        request.input('ProcessDocumentRevision', sql.NVarChar, ProcessDocumentRevision);
        request.input('Status', sql.NVarChar, Status);
        request.input('From', sql.Time, From);
        request.input('To', sql.Time, To);
        request.input('TicketAssignedDate', sql.Date, TicketAssignedDate);
        request.input('BriefDetails', sql.NVarChar, BriefDetails);

        await request.query(query);

        console.log('Data inserted successfully.');
        return res.render('sideinput', { msg: 'Data inserted successfully', msg_type: 'good' });
    } catch (error) {
        console.error('Error inserting data:', error);
        return res.render('sideinput', { msg: 'Error inserting data', msg_type: 'error' });
    }
};






//////////////////////////UNDER DEVELOP///////////////////////////////////////

exports.getUserName = async (req, res) => {
    try {
        // Connect to the database
        const config = {
            server: 'WIN-MUSC6MOGOU0\\SQLEXPRESS',
            database: 'login',
            driver: 'msnodesqlv8',
            options: {
                trustedConnection: true
            }
        };

        const pool = await sql.connect(config);

        // Execute a SQL query to retrieve the user's name (replace this with your query)
        const result = await pool.request().query('SELECT name FROM users WHERE ID = 1'); // Assuming you have a user ID

        if (result.recordset.length > 0) {
            // Send the user's name as a JSON response
            res.json({ userName: result.recordset[0].name });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error retrieving user name:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        // Close the database connection
        sql.close();
    }
};






