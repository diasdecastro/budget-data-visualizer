const mysql = require('mysql');
const express = require('express');
var app = express();
const bodyparser = require('body-parser');

// CORS on ExpressJS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // * allows any origin
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyparser.json());

var mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'myPassword12',
    database:'nodelogin',
    multipleStatements: true
});

mysqlConnection.connect((err) => {
    if(!err){
        console.log("DB connection success");
    } else {
        console.log("DB connection failed \n Error: " + JSON.stringify(err, undefined, 2));
    }
});

app.listen(3000, () => console.log("Express server is runnung at port 3000"));

//############################### OPERATIONS ON BUDGET_DATA TABLE (GETERS) #############################################

//budget_data: day_date | in_or_out | category | amount_cents | details

//get entries
app.get('/budget', (req, res) => {    
    //FILTERS TODO: Handle categories filters
    let minDate = (req.query.mindate) ? req.query.mindate : "(SELECT MIN(day_date) from budget_data)";
    let maxDate = (req.query.maxdate) ? req.query.maxdate : "(SELECT MAX(day_date) from budget_data)";
    let minAmountCents = (req.query.mincents) ? req.query.mincents : -9223372036854775807; // -infinity TODO: make it 0
    let maxAmountCents = (req.query.maxcents) ? req.query.maxcents : 9223372036854775807; //infinity

    //ORDER BY COLUMN
    let column = (req.query.column) ? req.query.column : "day_date";
    let order = (req.query.order) ? req.query.order : "desc";
    
    let mySqlQuery = `SELECT * FROM budget_data WHERE day_date >= ${minDate} AND day_date <= ${maxDate} AND amount_cents >= ${minAmountCents} AND amount_cents <= ${maxAmountCents} ORDER BY ${column} ${order};`;    
    mysqlConnection.query(mySqlQuery, (err, results, fields) => {
        if (err) {
            throw err;
        } else {
            console.log(results);
            res.send(results);
        }
    });     
       
});



//############################### OPERATIONS ON BUDGET_DATA TABLE (SETERS) #############################################

//insert new entry
app.post('/budget', (req, res) => {
    let day_date = req.body.day_date;
    let category = req.body.category;
    let amount_cents = req.body.amount_cents;
    let details = req.body.details;

    let insertNewEntry = "INSERT INTO budget_data (id, day_date, category, amount_cents, details) VALUES (0, ?, ?, ?, ?);";
    mysqlConnection.query(insertNewEntry, [day_date, category, amount_cents, details], (err, results, fields) => {
        if (err) {
            throw err;
        } else {
            res.send("New entry inserted!");
        }
    });
});

//alter entry
app.put('')