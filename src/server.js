const mysql = require('mysql');
const express = require('express');
var app = express();
const path = require('path');
const bodyparser = require('body-parser');
const moment = require('moment');
const { type } = require('os');
// CORS on ExpressJS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // * allows any origin
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
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

app.use(express.static(path.join(__dirname, '/../')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "/../homePage.html"));
});

//############################### ROUTERS FOR THE LISTING PAGE #############################################

//budget_data: day_date | category | amount_cents | details | id

app.get('/list', (req, res) => {
    res.sendFile(path.join(__dirname, "/../listPage.html"));
});


//get entries
app.get('/list/budget', (req, res) => {    
    //FILTERS TODO: Handle categories filters
    let minDate = (req.query.mindate != "undefined") ? "\'" + req.query.mindate + "\'" : "(SELECT MIN(day_date) from budget_data)";
    let maxDate = (req.query.maxdate != "undefined") ? "\'" + req.query.maxdate + "\'" : "(SELECT MAX(day_date) from budget_data)";
    let minAmountCents = (req.query.mincents != "undefined") ? req.query.mincents : 0;
    let maxAmountCents = (req.query.maxcents != "undefined") ? req.query.maxcents : 9223372036854775807; //infinity
    let categoryArr = req.query.category; //returns elements of the category Array as a string e.g. "Housing, Other"
    let categoryHandler = "";
    
    if (categoryArr.length > 0) {
        categoryHandler = "AND category in " + "(" + categoryArr + ")";        
    }

    //ORDER BY COLUMN
    let column = (req.query.column != "undefined") ? req.query.column : "day_date";
    let order = (req.query.order != "undefined") ? req.query.order : "desc";
    
    let mySqlQuery = `SELECT * FROM budget_data WHERE day_date >= ${minDate} AND day_date <= ${maxDate} AND amount_cents >= ${minAmountCents} AND amount_cents <= ${maxAmountCents} ${categoryHandler} ORDER BY ${column} ${order};`;
    
    // console.log(mySqlQuery);
    mysqlConnection.query(mySqlQuery, (err, results, fields) => {
        if (err) {
            throw err;
        } else {
            // console.log(results);
            res.send(results);
        }
    });     
       
});

//insert new entry
app.post('/list/budget', (req, res) => {
    let day_date = req.body.day_date;
    let category = req.body.category;
    let amount = req.body.amount * 100;
    let details = req.body.details;

    let insertNewEntry = "INSERT INTO budget_data (id, day_date, category, amount_cents, details) VALUES (0, ?, ?, ?, ?);";
    mysqlConnection.query(insertNewEntry, [day_date, category, amount, details], (err, results, fields) => {
        if (err) {
            throw err;
        } else {
            res.send("New entry inserted!");
        }
    });
});

//delete entry
app.delete('/list/budget', (req, res) => {
    let id = req.query.id;

    let deleteQuery = "DELETE FROM budget_data WHERE id = ?;";
    mysqlConnection.query(deleteQuery, [id], (err, results, fields) => {
        if (err) {
            throw err;
        } else {
            res.send("Entry deleted");
        }
    })
});

/* update entry */
app.put('/list/budget', (req, res) => {
    let id = req.query.id;
    let date = req.query.date;
    let category = req.query.category;
    let amount = req.query.amount * 100;
    let details = req.query.details;

    let updateQuery = `UPDATE budget_data SET day_date = '${date}', category = '${category}', amount_cents = ${amount}, details = '${details}' WHERE ID = ${id}`;
    mysqlConnection.query(updateQuery, (err, results, fields) => {
        if (err) {
            throw err;
        } else {
            res.send("Entry updated");
        }
    }) 
});


//budget_data: day_date | category | amount_cents | details | id

//############################### ROUTERS FOR THE STATISTICS PAGE (SETERS) #############################################

app.get('/statistics', (req, res) => {
    res.sendFile(path.join(__dirname, "/../statisticsPage.html"));
});

/* date calculations */

function getBeginEndOfWeek (year, weekNumber) {
    
    let begin = moment().year(year).week(weekNumber).weekday(0).format("YYYY-MM-DD");
    let end = moment().year(year).week(weekNumber).weekday(6).format("YYYY-MM-DD");
    console.log(begin + " : " + end);
    return [begin, end];
}



/* How much  */


app.get('/statistics/weekly', (req, res) => {
    let year = req.query.year;
    let weekNumber = req.query.weekNumber;
    let displayType = req.query.displayType;
    let dates = getBeginEndOfWeek(year, weekNumber);
    let getWeeklyQuery = "";

    if (displayType == "Amount") {
        console.log("comming here");
        getWeeklyQuery = `SELECT day_date AS date, DAYNAME(day_date) AS day, SUM(amount_cents) AS sum FROM budget_data WHERE day_date >= '${dates[0]}' AND day_date <= '${dates[1]}' GROUP BY 1, 2;`;
    } else {
        getWeeklyQuery = `SELECT category, SUM(amount_cents) AS sum FROM budget_data WHERE day_date >= '${dates[0]}' AND day_date <= '${dates[1]}' GROUP BY 1`;
    }
    console.log(getWeeklyQuery);
    
    mysqlConnection.query(getWeeklyQuery, (err, results, fields) => {
        if (err) {
            throw err;
        } else {
            console.log(results);
            if (displayType === "Amount") {
                console.log("comming here too");
                res.json({
                    begWeek: dates[0],
                    endWeek: dates[1],
                    results: results
                });
            } else {
                res.json({
                    begWeek: dates[0],
                    endWeek: dates[1],
                    results: results
                });
            }
        }
    });
});

app.get('/statistics/monthly', (req, res) => {
    let year = req.query.year;
    let month = req.query.month;
    let displayType = req.query.displayType;
    let getMonthlyQuery = "";

    if (displayType === "Amount") {
        getMonthlyQuery = `SELECT day_date AS date, SUM(amount_cents) AS sum FROM budget_data WHERE MONTH(day_date) = ${month} and YEAR(day_date) = ${year} GROUP BY 1`;
    } else {
        getMonthlyQuery = `SELECT category, SUM(amount_cents) AS sum FROM budget_data WHERE MONTH(day_date) = ${month} AND YEAR(day_date) =${year} GROUP BY 1;`;
    }
    console.log(getMonthlyQuery);

    mysqlConnection.query(getMonthlyQuery, (err, results, fields) => {
        if (err) {
            throw err;
        } else {
            console.log(results);
            res.send(results);
        }
    });

});

app.get('/statistics/yearly', (req, res) => {
    let year = req.query.year;
    let displayType = req.query.displayType;
    let getYearlyQuery = "";

    if (displayType === "Amount") {
        getYearlyQuery = `SELECT MONTH(day_date) AS month, SUM(amount_cents) AS sum FROM budget_data WHERE YEAR(day_date) = ${year} GROUP BY 1`;
    } else {
        getYearlyQuery = `SELECT category, SUM(amount_cents) AS sum FROM budget_data WHERE YEAR(day_date) = ${year} GROUP BY 1;`
    }
    console.log(getYearlyQuery);

    mysqlConnection.query(getYearlyQuery, (err, results, fields) => {
        if (err) {
            throw err;
        } else {
            console.log(results);
            res.send(results)
        }
    });
});
