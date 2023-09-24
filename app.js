const express = require("express");
const app = express();
const sql = require("mssql/msnodesqlv8");
const doenv = require("dotenv");
const path=require("path");
const hbs = require("hbs");
const cookieParser = require("cookie-parser");
//const dashboard = require('./script');



doenv.config(
    {
        path:'./.env',
    }
);
 
var config = {    
    database: 'login',
    server: 'WIN-MUSC6MOGOU0\\SQLEXPRESS',
    driver: 'msnodesqlv8',
   options: {       
     trustedConnection: true
    }  
 }; 



sql.connect(config, function(err) {
    if (err) {
        console.log(err);
    }
    var request = new sql.Request();
    request.input('nameValue', sql.NVarChar, 'naveenkishore86@gmail.com');
    request.query('SELECT * FROM users WHERE EMAIL = @nameValue', function(err, recordset) {
        if (err) {
            console.log(err);
        } else { 
            console.log('mysql connection success');
        }
    });
});

app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

app.use(express.static('/public'))
app.use(express.static(path.join(__dirname, 'public')));

const location = path.join(__dirname,"./public");
app.use(express.static(location));
app.set("view engine", "hbs")

const partialsPath = path.join(__dirname,"./views/partials");
hbs.registerPartials(partialsPath);


 app.use("/", require("./routes/pages"));
 app.use("/auth", require("./routes/auth"));



app.listen(5000, () =>
{
    console.log("sever started @ port 5000");
}); 



//i donty like this 