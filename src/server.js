const mysql = require('mysql');
const express = require('express');
var app = express();
const path = require('path');
const bodyparser = require('body-parser');
const moment = require('moment');
const { type } = require('os');
var cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();
// CORS on ExpressJS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // * allows any origin
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use(cookieParser());

app.set('trust proxy', 1);

app.use(cookieSession({
    name: 'session',
    keys: [process.env.KEY_ONE, process.env.KEY_TWO],
    secret: process.env.COOKIE_SECRET,
    secureProxy: true,
    maxAge: 60 * 60 * 1000 //1 hour    
}));

//if coockie exists and user no user, delete coockie
/* app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.value) {
        res.clearCookie('user_sid');
    }
    next();
}); */

//check if user is logged in. if logged in redirect to listpage
/* app.use((req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/list');
    } else {
        next();
    }
}); */

var db_config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
}

var mysqlConnection;

function handleDisconnect() {
    mysqlConnection = mysql.createConnection(db_config);

    mysqlConnection.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
          console.log('error when connecting to db:', err);
          setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
      });                                     // process asynchronous requests in the meantime.
                                              // If you're also serving http, display a 503 error.
      mysqlConnection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
          handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
          throw err;                                  // server variable configures this)
        }
      });
}

handleDisconnect();

mysqlConnection.connect((err) => {
    if(!err){
        console.log("DB connection success!");
    } else {
        console.log("DB connection failed \n Error: " + JSON.stringify(err, undefined, 2));
    }
});

app.listen(process.env.PORT || 3000);

app.use(express.static(path.join(__dirname, '/../')));

app.get('/', (req, res) => {
    if (req.session.value) {
        res.sendFile(path.join(__dirname, "/../listPage.html"));
    } else {
        res.sendFile(path.join(__dirname, "/../index.html"));
    }    
});

app.get('/404', (req, res) => {
    res.sendFile(path.join(__dirname, "/../errorPage.html"));
});

//############################## SIGN IN ##########################################

app.post('/signup', (req, res) => {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let confirm = req.body.confirm;
    var create = false;

    if (username && email && confirm && password) {

        let checkIfUsername = "SELECT * FROM accounts WHERE username = ?;";
        mysqlConnection.query(checkIfUsername, [username], (err, results, fields) => {
            if (err) {
                throw err;
                
            } else {

                if (results.length > 0) {                    
                    return res.end("Username not available");
                    
                }       
            }
        }); 

        let checkIfEmail = "SELECT * FROM accounts WHERE email = ?;";
        mysqlConnection.query(checkIfEmail, [email], (err, results, fields) => {
            if (err) {
                throw err;
                
            } else {
                if (results.length > 0) {
                    
                    return res.end("Email already registerd");      

                } else if (password != confirm) {
                    
                    return res.end("Passwords don't match");
                    
                } else {
                    let createTableForUser = "CREATE TABLE IF NOT EXISTS ?? ( day_date DATE, category VARCHAR(200), amount_cents INT, details VARCHAR(200), id INT AUTO_INCREMENT PRIMARY KEY )";
                    mysqlConnection.query(createTableForUser, [`${username}_budget_data`], (err, results, fields) => {
                        if (err) {
                            throw err;
                        } else {
                            req.session.value = username;

                            let signupQuery = "INSERT INTO accounts (id, username, password, email) VALUES (0, ?, ?, ?);";
                            mysqlConnection.query(signupQuery, [username, password, email], (err, results, fields) => {
                                if (err) {
                                    throw err;
                                } else {
                                    return res.end("success");
                                }
                            });
                        }
                    });
                }
            }
        });
       
    }
            
});

//############################## LOGIN ########################################


app.post('/login',  (req, res) => {
    let username = req.body.username;
    let password = req.body.password;    

    if (username && password) {
        let sqlSearchforMatchQuery = `SELECT * FROM accounts WHERE username = '${username}' AND password = '${password}';`;
        mysqlConnection.query(sqlSearchforMatchQuery, (err, results, fields) => {
            if(err) {
                throw err;
            }
            if (results.length > 0) {                  
                req.session.value = username;
                res.end("true");              
            } else {
                res.end("false");
            }
        });
    }
});

//############################## LOGOUT ########################################

app.post("/logout", (req, res) => {
    if (req.session.value) {        
        res.clearCookie('user_sid');
        req.session = null;
        res.send("logout");
    }
});

//############################### ROUTS FOR THE LISTING PAGE #############################################

//budget_data: day_date | category | amount_cents | details | id

app.get('/list', (req, res) => {
    if (req.session.value) {
        res.sendFile(path.join(__dirname, "/../listPage.html"));
    } else {
        res.sendFile(path.join(__dirname, "/../index.html"));
    }
});


//get entries
app.get('/list/budget', (req, res) => {
    if (!(req.session.value)) {
        res.sendFile(path.join(__dirname, "/../index.html"));        
    }
    //FILTERS TODO: Handle categories filters
    let minDate = (req.query.mindate != "undefined") ? "\'" + req.query.mindate + "\'" : `(SELECT MIN(day_date) from ${req.session.value}_budget_data)`;
    let maxDate = (req.query.maxdate != "undefined") ? "\'" + req.query.maxdate + "\'" : `(SELECT MAX(day_date) from ${req.session.value}_budget_data)`;
    let minAmountCents = (req.query.mincents != "undefined") ? req.query.mincents : 0;
    let maxAmountCents = (req.query.maxcents != "undefined") ? req.query.maxcents : 9223372036854775807; //infinity
    let categoryArr = req.query.category; //returns elements of the category Array as a string e.g. "Housing, Other"
    let categoryHandler = "";
    let page = req.query.page;
    let numberOfPages;

    mysqlConnection.query(`SELECT COUNT(*) FROM ${req.session.value}_budget_data;`, (err, results, fields) => {
        if (err) {
            throw err;
        } else {
            numberOfPages = results;
        }
    });

    if (categoryArr.length > 0) {
        categoryHandler = "AND category in " + "(" + categoryArr + ")";        
    }

    //ORDER BY COLUMN
    let column = (req.query.column != "undefined") ? req.query.column : "day_date";
    let order = (req.query.order != "undefined") ? req.query.order : "desc";
    
    let mySqlQuery = `SELECT * FROM ${req.session.value}_budget_data WHERE day_date >= ${minDate} AND day_date <= ${maxDate} AND amount_cents >= ${minAmountCents} AND amount_cents <= ${maxAmountCents} ${categoryHandler} ORDER BY ${column} ${order} LIMIT ${page}, 50;`;
    
    
    mysqlConnection.query(mySqlQuery, (err, results, fields) => {
        if (err) {
            throw err;
        } else {
            // console.log(results);
            res.json({
                results: results,
                numberOfPages: numberOfPages
            });
        }
    });     
       
});

//insert new entry
app.post('/list/budget', (req, res) => {

    if (!(req.session.value)) {
        res.sendFile(path.join(__dirname, "/../index.html"));        
    }

    let day_date = req.body.day_date;
    let category = req.body.category;
    let amount = req.body.amount * 100;
    let details = req.body.details;

    let insertNewEntry = `INSERT INTO ${req.session.value}_budget_data (id, day_date, category, amount_cents, details) VALUES (0, '${day_date}', '${category}', ${amount}, '${details}');`;
    mysqlConnection.query(insertNewEntry, (err, results, fields) => {
        if (err) {
            throw err;
        } else {
            res.send("New entry inserted!");
        }
    });
});

//delete entry
app.delete('/list/budget', (req, res) => {

    if (!(req.session.value)) {
        res.sendFile(path.join(__dirname, "/../index.html"));        
    }

    let id = req.query.id;

    let deleteQuery = `DELETE FROM ${req.session.value}_budget_data WHERE id = ${id};`;
    mysqlConnection.query(deleteQuery, (err, results, fields) => {
        if (err) {
            throw err;
        } else {
            res.send("Entry deleted");
        }
    })
});

/* update entry */
app.put('/list/budget', (req, res) => {

    if (!(req.session.value)) {
        res.sendFile(path.join(__dirname, "/../index.html"));        
    }

    let id = req.query.id;
    let date = req.query.date;
    let category = req.query.category;
    let amount = req.query.amount * 100;
    let details = req.query.details;

    let updateQuery = `UPDATE ${req.session.value}_budget_data SET day_date = '${date}', category = '${category}', amount_cents = ${amount}, details = '${details}' WHERE ID = ${id}`;
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
    if (req.session.value) {
        res.sendFile(path.join(__dirname, "/../statisticsPage.html"));
    } else {
        res.sendFile(path.join(__dirname, "/../index.html"));
    }    
});

/* date calculations */

function getBeginEndOfWeek (year, weekNumber) {
    
    let begin = moment().year(year).week(weekNumber).weekday(0).format("YYYY-MM-DD");
    let end = moment().year(year).week(weekNumber).weekday(6).format("YYYY-MM-DD");
    return [begin, end];
}



/* How much  */


app.get('/statistics/weekly', (req, res) => {

    if (!(req.session.value)) {
        res.sendFile(path.join(__dirname, "/../index.html"));        
    }

    let year = req.query.year;
    let weekNumber = req.query.weekNumber;
    let displayType = req.query.displayType;
    let dates = getBeginEndOfWeek(year, weekNumber);
    let getWeeklyQuery = "";

    if (displayType == "Amount") {
        getWeeklyQuery = `SELECT day_date AS date, DAYNAME(day_date) AS day, SUM(amount_cents) AS sum FROM ${req.session.value}_budget_data WHERE day_date >= '${dates[0]}' AND day_date <= '${dates[1]}' GROUP BY 1, 2;`;
    } else {
        getWeeklyQuery = `SELECT category, SUM(amount_cents) AS sum FROM ${req.session.value}_budget_data WHERE day_date >= '${dates[0]}' AND day_date <= '${dates[1]}' GROUP BY 1`;
    }
    
    mysqlConnection.query(getWeeklyQuery, (err, results, fields) => {
        if (err) {
            throw err;
        } else {
            if (displayType === "Amount") {
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

    if (!(req.session.value)) {
        res.sendFile(path.join(__dirname, "/../index.html"));        
    }

    let year = req.query.year;
    let month = req.query.month;
    let displayType = req.query.displayType;
    let getMonthlyQuery = "";

    if (displayType === "Amount") {
        getMonthlyQuery = `SELECT day_date AS date, SUM(amount_cents) AS sum FROM ${req.session.value}_budget_data WHERE MONTH(day_date) = ${month} and YEAR(day_date) = ${year} GROUP BY 1`;
    } else {
        getMonthlyQuery = `SELECT category, SUM(amount_cents) AS sum FROM ${req.session.value}_budget_data WHERE MONTH(day_date) = ${month} AND YEAR(day_date) =${year} GROUP BY 1;`;
    }

    mysqlConnection.query(getMonthlyQuery, (err, results, fields) => {
        if (err) {
            throw err;
        } else {
            res.send(results);
        }
    });

});

app.get('/statistics/yearly', (req, res) => {

    if (!(req.session.value)) {
        res.sendFile(path.join(__dirname, "/../index.html"));        
    }

    let year = req.query.year;
    let displayType = req.query.displayType;
    let getYearlyQuery = "";

    if (displayType === "Amount") {
        getYearlyQuery = `SELECT MONTH(day_date) AS month, SUM(amount_cents) AS sum FROM ${req.session.value}_budget_data WHERE YEAR(day_date) = ${year} GROUP BY 1`;
    } else {
        getYearlyQuery = `SELECT category, SUM(amount_cents) AS sum FROM ${req.session.value}_budget_data WHERE YEAR(day_date) = ${year} GROUP BY 1;`
    }

    mysqlConnection.query(getYearlyQuery, (err, results, fields) => {
        if (err) {
            throw err;
        } else {
            res.send(results)
        }
    });
});


