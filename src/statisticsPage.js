/* data rendering */
function createForm(formType) {

    if (document.getElementById("canvasElem")) {
        document.getElementById("canvasElem").remove();
    }

    let formField = document.getElementById("statisticsForm"); 
    formField.innerHTML = "";

    let displayType = "Amount";

    let thisDate = new Date();
    let thisYear = thisDate.getFullYear();
    let thisWeek = thisDate.getWeek();
    let thisMonth = thisDate.getMonth(); 
    

    /* choose amount or category */

    let leftButton = document.createElement("button");
    let leftIcon = document.createElement("i");
    leftIcon.className = "fa fa-chevron-circle-left fa-lg";
    leftButton.appendChild(leftIcon);

    let rightButton = document.createElement("button");
    let rightIcon = document.createElement("i");
    rightIcon.className = "fa fa-chevron-circle-right fa-lg";
    rightButton.appendChild(rightIcon);

    let selectDisplay = document.createElement("div");
    selectDisplay.id = "displayFieldContainer";
    let displayField = document.createElement("span");
    displayField.innerHTML = displayType;
    selectDisplay.append(leftButton, displayField, rightButton)

    leftButton.addEventListener("click", () => {
        if (displayType === "Amount" ) {
            displayType = "Category";
            displayField.innerHTML = displayType;            
        } else {
            displayType = "Amount";
            displayField.innerHTML = displayType;
        }

        if (formType === "week") {
            document.getElementById("canvasElem").remove();
            getWeekData(thisYear, thisWeek, displayType);
        } else if (formType === "month") {
            document.getElementById("canvasElem").remove();
            getMonthData(thisYear, thisMonth + 1, displayType);
        } else {
            document.getElementById("canvasElem").remove();
            getYearData(thisYear, displayType);
        }
    });

    rightButton.addEventListener("click", () => {
        if (displayType === "Amount" ) {
            displayType = "Category";
            displayField.innerHTML = displayType;
        } else {
            displayType = "Amount";
            displayField.innerHTML = displayType;
        }

        if (formType === "week") {
            document.getElementById("canvasElem").remove();
            getWeekData(thisYear, thisWeek, displayType);
        } else if (formType === "month") {
            document.getElementById("canvasElem").remove();
            getMonthData(thisYear, thisMonth + 1, displayType);
        } else {
            document.getElementById("canvasElem").remove();
            getYearData(thisYear, displayType);
        }
    });


    /* minus button */    
    let decrease1 = document.createElement("button");
    let minusIcon1 = document.createElement("i");
    minusIcon1.className = "fa fa-minus-circle fa-lg";
    decrease1.appendChild(minusIcon1);

    let decrease2 = document.createElement("button");
    let minusIcon2 = document.createElement("i");
    minusIcon2.className = "fa fa-minus-circle fa-lg";
    decrease2.appendChild(minusIcon2);
    

    /* plus button */
    let increase1 = document.createElement("button");
    let plusIcon1 = document.createElement("i");
    plusIcon1.className = "fa fa-plus-circle fa-lg";
    increase1.appendChild(plusIcon1);

    let increase2 = document.createElement("button");
    let plusIcon2 = document.createElement("i");
    plusIcon2.className = "fa fa-plus-circle fa-lg";
    increase2.appendChild(plusIcon2);

    /* Form field for the year */

    /* year !!! SET OF BUTTONS 1 !!! */
    let selectYear = document.createElement("div");
    selectYear.className = "yearFieldContainer";
    let yearField = document.createElement("input");
    yearField.setAttribute("type", "number");
    yearField.setAttribute("min", "1000");
    yearField.setAttribute("max", "3000");
    yearField.defaultValue = thisYear;
    selectYear.append(decrease1, yearField, increase1);


    /* event listeners for changing years */

    decrease1.addEventListener("click", () => {
        document.getElementById("canvasElem").remove();
        thisYear --;
        yearField.value = thisYear;
        if (formType === "week") {
            document.getElementById("weekField").value = 1;
            thisWeek = 1;
            getWeekData(thisYear, 1, displayType);
        } else if (formType === "month") {
            document.getElementById("monthField").innerHTML = "January";
            thisMonth = 1;
            getMonthData(thisYear, 1, displayType);
        } else {
            getYearData(thisYear, displayType);
        }
    });

    increase1.addEventListener("click", () => {
        document.getElementById("canvasElem").remove();
        thisYear ++;
        yearField.value = thisYear;
        if (formType === "week") {
            document.getElementById("weekField").value = 1;
            thisWeek = 1;
            getWeekData(thisYear, 1, displayType);
        } else if (formType === "month") {
            document.getElementById("monthField").innerHTML = "January";
            thisMonth = 0;
            getMonthData(thisYear, 1, displayType);
        } else {
            getYearData(thisYear, displayType);
        }
    });

    /* Form-type Week */

    if (formType === "week"){       

        /* week !!! SET OF BUTTONS 2 !!! */
        let selectWeek = document.createElement("div");
        selectWeek.className = "weekFieldContainer";
        let weekField = document.createElement("input");
        weekField.id = "weekField";
        weekField.setAttribute("type", "number");
        weekField.setAttribute("min", "1");
        weekField.setAttribute("max", "52");
        weekField.defaultValue = thisWeek;
        selectWeek.append(decrease2, weekField, increase2);

        /* append children */
        formField.append(selectDisplay, selectYear, selectWeek);

        /* display data */
        getWeekData(thisYear, thisWeek, displayType);

        /* event listeners for changing weeks */
        
        decrease2.addEventListener("click", () => {
            document.getElementById("canvasElem").remove();
            if (thisWeek == "1") {
                thisWeek = 52;
                weekField.value = thisWeek;
                thisYear--;
                yearField.value = thisYear;
                getWeekData(thisYear, thisWeek, displayType);
            } else {
                thisWeek --;
                weekField.value = thisWeek;
                getWeekData(thisYear, thisWeek, displayType);
            }            
        });
        
        increase2.addEventListener("click", () => {
            document.getElementById("canvasElem").remove();
            if (thisWeek == "52") {
                thisWeek = 1;
                weekField.value = thisWeek;
                thisYear++;
                yearField.value = thisYear;
                getWeekData(thisYear, thisWeek, displayType);
            } else {
                thisWeek ++;
                weekField.value = thisWeek;
                getWeekData(thisYear, thisWeek, displayType);
            }            
        });

    } else if (formType === "month") {        

        let selectMonth = document.createElement("div");
        selectMonth.className = "monthFieldContainer";
        let monthField = document.createElement("span");
        monthField.id = "monthField";
        let monthSelection = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "Noverber", "December"];
        monthField.innerHTML = monthSelection[thisMonth];
        selectMonth.append(decrease2, monthField, increase2);

        /* append children */
        formField.append(selectDisplay , selectYear, selectMonth);

        /* display data */
        getMonthData(thisYear, thisMonth + 1, displayType); //months are 0-based in JS but 1-based in MySQL

        /* event listeners for changing months */

        decrease2.addEventListener("click", () => {
            document.getElementById("canvasElem").remove();
            if (thisMonth === 0) {
                thisMonth = 11;
                thisYear--;
                monthField.innerHTML = monthSelection[thisMonth];
                yearField.value = thisYear;
                getMonthData(thisYear, thisMonth + 1); //months are 0-based in JS but 1-based in MySQL
            } else {
                thisMonth--;
                monthField.innerHTML = monthSelection[thisMonth];
                getMonthData(thisYear, thisMonth + 1, displayType); //months are 0-based in JS but 1-based in MySQL
            }
            
        });
        
        increase2.addEventListener("click", () => {
            document.getElementById("canvasElem").remove();
            if (thisMonth === 11) {
                thisMonth = 0;
                thisYear++;
                monthField.innerHTML = monthSelection[thisMonth];
                yearField.value = thisYear;
                getMonthData(thisYear, thisMonth + 1, displayType); //months are 0-based in JS but 1-based in MySQL
            } else {
                thisMonth++;
                monthField.innerHTML = monthSelection[thisMonth];
                getMonthData(thisYear, thisMonth + 1, displayType); //months are 0-based in JS but 1-based in MySQL
            }
            
        });        

    } else if (formType === "year") {
        formField.append(selectDisplay, selectYear);
        getYearData(thisYear, displayType);
    }

}


///////////////////////////////////////////////////////////////////////////////////////////////////////

/* Bar Chart creation */


/* TODO: Compare to week before */
function createWeekBarChart(data, year, weekNumber, begWeek, endWeek) {

    document.getElementById('noData').style.display = 'none';

    /* only one canvas element */
    if (!document.getElementById("canvasElem")) {
        let myCanvas = document.createElement("canvas");
        myCanvas.id = "canvasElem";
        document.getElementById("inner").appendChild(myCanvas);
    }

    let results = data;
    let canvasElem = document.getElementById("canvasElem");
    canvasElem.getContext("2d");

    let dataX = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let dataY = [0, 0, 0, 0, 0, 0, 0];
    
    


    for (let i = 0; i < results.length; i++) {
        switch(results[i]["day"]) {
            case "Sunday":
                dataY[0] = results[i]["sum"] / 100;
                break;
            case "Monday":
                dataY[1] = results[i]["sum"] / 100;
                break;
            case "Tuesday":
                dataY[2] = results[i]["sum"] / 100;
                break;
            case "Wednesday":
                dataY[3] = results[i]["sum"] / 100;
                break;
            case "Thursday":
                dataY[4] = results[i]["sum"] / 100;
                break;
            case "Friday":
                dataY[5] = results[i]["sum"] / 100;
                break;
            case "Saturday":
                dataY[6] = results[i]["sum"] / 100;
                break;
        }        
    }
        /* format date */

        //formats to dd.mm.yyyy
    let begDate = new Date(begWeek);
    let endDate = new Date(endWeek);
    let weekBegString = `${begDate.getDate()}.${begDate.getMonth() + 1}`;
    let weekEndString = `${endDate.getDate()}.${endDate.getMonth() + 1}`;

    let weekBarChart = new Chart( canvasElem, {
            type: 'bar',            
            data: {
                labels: dataX,
                datasets: [{
                    minBarLength: 200,
                    data: dataY,
                    backgroundColor: 'rgba(255, 192, 0, 0.3)',
                    borderColor: 'rgba(255, 192, 0, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                legend: {
                    display: false
                },

                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },

                title: {
                    display: true,
                    text: `Expenditure Overview for Week ${weekNumber} [${weekBegString} - ${weekEndString}] of ${year}`
                },
                
                tooltips: {
                    enabled: true,
                    mode: 'single',
                    callbacks: {
                        label: function(tooltipItems, data) { 
                            return formatter.format(tooltipItems.yLabel);
                        }
                    }
                },

                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuint'
                },

                /* removes percent value on top of the bars */
                plugins: {
                    labels: {
                      render: () => {}
                    }
                  }
            }                        
    });

    document.getElementById("inner").appendChild(canvasElem);

}

/* TODO: compare to month before */
function createMonthBarChart(data, year, month) {
    
    document.getElementById('noData').style.display = 'none';

    /* only one canvas element */
    if (!document.getElementById("canvasElem")) {
        let myCanvas = document.createElement("canvas");
        myCanvas.id = "canvasElem";
        document.getElementById("inner").appendChild(myCanvas);
    }

    let monthSelection = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "Noverber", "December"];
   
    let canvasElem = document.getElementById("canvasElem");
    
    /* arrays with days */

    dataX = [];
    dataY = [];
    let numberOfDays = 31;

    switch(month) {        
        case 4:
        case 6:
        case 9:
        case 11:
            numberOfDays = 30;
            break;
        case 2:
            numberOfDays = 28
            break;        
    }

    for(let i = 1; i <= numberOfDays; i++) {
        dataX.push(i);
        dataY.push(0); 
    }

    for(let i = 0; i < data.length; i++) {
        let date = new Date(data[i]["date"]);
        dataY[date.getDate() - 1] = data[i]["sum"] / 100;
    } 

   

    let monthBarChart = new Chart( canvasElem, {
        type: 'bar',            
        data: {
            labels: dataX,
            datasets: [{
                minBarLength: 200,
                data: dataY,
                backgroundColor: 'rgba(99, 0, 148, 0.3)',
                borderColor: 'rgba(99, 0, 148, 1)',
                borderWidth: 2
            }]
        },
        options: {
            legend: {
                display: false
            },

            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },

            title: {
                display: true,
                text: `Expenditure Overview for ${monthSelection[month - 1]} ${year}`
            },
            
            tooltips: {
                enabled: true,
                mode: 'single',
                callbacks: {
                    label: function(tooltipItems, data) { 
                        return formatter.format(tooltipItems.yLabel);
                    }
                }
            },

            animation: {
                duration: 1000,
                easing: 'easeInOutQuint'
            },

            /* removes percent value on top of the bars */
            plugins: {
                labels: {
                  render: () => {}
                }
            }
        }                        
    });

    document.getElementById("inner").appendChild(canvasElem);   

}

function createYearBarChart(data, year) {    

    document.getElementById('noData').style.display = 'none';

    /* only one canvas element */
    if (!document.getElementById("canvasElem")) {
        let myCanvas = document.createElement("canvas");
        myCanvas.id = "canvasElem";
        document.getElementById("inner").appendChild(myCanvas);
    }

    let canvasElem = document.getElementById("canvasElem");

    let dataX = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "Noverber", "December"];
    let dataY = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    for(let i = 0; i < data.length; i++) {
        dataY[data[i]["month"] - 1] = data[i]["sum"] / 100;
    }

    

    let yearBarChart = new Chart( canvasElem, {
        type: 'bar',            
        data: {
            labels: dataX,
            datasets: [{
                minBarLength: 200,
                data: dataY,
                backgroundColor: 'rgba(0, 66, 199, 0.3)',
                borderColor: 'rgba(0, 66, 199, 1)',
                borderWidth: 2
            }]
        },
        options: {
            legend: {
                display: false
            },

            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },

            title: {
                display: true,
                text: `Expenditure Overview for the year ${year}`
            },
            
            tooltips: {
                enabled: true,
                mode: 'single',
                callbacks: {
                    label: function(tooltipItems, data) { 
                        return formatter.format(tooltipItems.yLabel);
                    }
                }
            },

            animation: {
                duration: 1000,
                easing: 'easeInOutQuint'
            },

            /* removes percent value on top of the bars */
            plugins: {
                labels: {
                  render: () => {}
                }
            }
        }                        
    });

    document.getElementById("inner").appendChild(canvasElem);   

}

///////////////////////////////////////////////////////////////////////////////////////////////////////

/* Doughnut Chart creation */

function createDoughnutChart (data, titleString, noDataString) {

    /* document.getElementById("inner").style.height = "60vh"; */
    document.getElementById('noData').style.display = 'none';
    
    // only one canvas element 
    if (!document.getElementById("canvasElem")) {
        let myCanvas = document.createElement("canvas");
        myCanvas.id = "canvasElem";
        document.getElementById("inner").appendChild(myCanvas);
    }    

    let results = data;
    let canvasElem = document.getElementById("canvasElem");
    canvasElem.getContext("2d");    

    let dataX = [];
    let dataY = [];

    for (let i = 0; i < results.length; i++) {
        dataX.push(results[i]["category"]);
        dataY.push(results[i]["sum"] / 100);
    }

    /* Line below helps display "No data available", if dataY has length 0 */

    let animationDuration = (dataY.length === 0) ? 0 : 1000;

    let weekDouChart = new Chart( canvasElem, {
    type: 'outlabeledDoughnut',            
    data: {
            labels: dataX,
            datasets: [{
                minBarLength: 200,
                data: dataY,
                backgroundColor: [
                    'rgba(10, 201, 0, 0.3)', //grün
                    'rgba(255, 73, 73, 0.3)', //rot
                    'rgba(43, 85, 255, 0.3)', //blau?
                    'rgba(242, 242, 53, 0.3)', //gelb
                    'rgba(53, 242, 242, 0.3)', //türkis
                    'rgba(242, 31, 217, 0.3)', //pink
                    'rgba(242, 136, 31, 0.3)', // orange
                    'rgba(31, 231, 242, 0.3)', //hellblau                 
                ],
                borderColor: [
                    'rgba(10, 201, 0, 1)', //grün
                    'rgba(255, 73, 73, 1)', //rot
                    'rgba(43, 85, 255, 1)', //blau?
                    'rgba(242, 242, 53, 1)', //gelb
                    'rgba(53, 242, 242, 1)', //türkis
                    'rgba(242, 31, 217, 1)', //pink
                    'rgba(242, 136, 31, 1)', // orange
                    'rgba(31, 231, 242, 1)', //hellblau      
                ],
                borderWidth: 2
            }]
        },
        options: {
            legend: {
                display: false
            },  

            maintainAspectRatio : false,
            
            scales: {                
                xAxes: [{
                    display: false
                  }],
                  yAxes: [{
                    display: false
                  }]
            },

            title: {
                display: true,
                text: titleString
            },
            
            tooltips: {
                enabled: true,
                mode: 'single',
                callbacks: {
                    title: function(tooltipItem, data) {
                        return data.labels[tooltipItem.index];
                    },
                    label: function(tooltipItem, data) { 
                        return data.labels[tooltipItem.index] + ": " + formatter.format(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]);
                    }
                }
            },

            animation: {
                duration: animationDuration,
                easing: 'easeInOutQuint',
                onComplete: function(animation) {
                    if (dataY.length === 0) {
                      document.getElementById('noData').style.display = 'block';
                      document.getElementById('noDataTitle').innerHTML = noDataString;
                      document.getElementById('canvasElem').style.display = 'none';
                    }
                  }
            },

            plugins: {               
                outlabels: {
                    text: '%l %p',
                    color: 'black'                  
                }                
            }             
        }                        
    });
    
    document.getElementById("inner").appendChild(canvasElem);

}

///////////////////////////////////////////////////////////////////////////////////////////////////////

/* Ajax requests */

function getWeekData(year, weekNumber, displayType) {
    let httpRequest = new XMLHttpRequest();

    
    httpRequest.open("GET", `https://my-expenditure-overview.herokuapp.com/statistics/weekly?year=${year}&weekNumber=${weekNumber}&displayType=${displayType}`, true);
    httpRequest.send();

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                let formatedResponse = JSON.parse(httpRequest.response);
                if (displayType === "Amount") {                    
                    createWeekBarChart(formatedResponse["results"], year, weekNumber, formatedResponse["begWeek"], formatedResponse["endWeek"]);
                } else {
                    let begDate = new Date(formatedResponse["begWeek"]);
                    let endDate = new Date(formatedResponse["endWeek"]);
                    let weekBegString = `${begDate.getDate()}.${begDate.getMonth() + 1}`;
                    let weekEndString = `${endDate.getDate()}.${endDate.getMonth() + 1}`;

                    let titleString = `Expenditure Overview for Week ${weekNumber} [${weekBegString} - ${weekEndString}] of ${year}`;
                    let noDataString = `Week ${weekNumber} [${weekBegString} - ${weekEndString}] of ${year}`;

                    createDoughnutChart(formatedResponse["results"], titleString, noDataString);
                }
            } else {
                alert("Something wrong");
            }
        }
    }
}

function getMonthData(year, month, displayType) {
    let httpRequest = new XMLHttpRequest();

    

    httpRequest.open("GET", `https://my-expenditure-overview.herokuapp.com/statistics/monthly?year=${year}&month=${month}&displayType=${displayType}`, true);
    httpRequest.send();

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {                
                let formatedResponse = JSON.parse(httpRequest.response);
                if (displayType === "Amount") {
                    createMonthBarChart(formatedResponse , year, month);
                } else {
                    let monthSelection = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "Noverber", "December"];
                    let titleString = `Expenditure Overview for ${monthSelection[month - 1]} ${year}`;
                    let noDataString = `${monthSelection[month - 1]} ${year}`;
                    createDoughnutChart(formatedResponse, titleString, noDataString);
                }
            } else {
                alert("Something wrong");
            }
        }
    }
}

function getYearData(year, displayType) {
    let httpRequest = new XMLHttpRequest();

    

    httpRequest.open("GET", `https://my-expenditure-overview.herokuapp.com/statistics/yearly?year=${year}&displayType=${displayType}`, true);
    httpRequest.send();

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status == 200) {
                let formatedResponse = JSON.parse(httpRequest.response);
                if (displayType === "Amount") {
                    createYearBarChart(formatedResponse, year);
                } else {
                    let titleString = `Expenditure Overview for the year ${year}`;
                    let noDataString = `Year ${year}`;
                    createDoughnutChart(formatedResponse, titleString, noDataString);
                }
            } else {
                alert("Something Wrong");
            }
        }
    }
}

////////////////////////////////////////////////////////////////

/* logout */

function logout() {
    let httpRequest = new XMLHttpRequest();

    httpRequest.open("POST", 'https://my-expenditure-overview.herokuapp.com/logout');
    httpRequest.send(JSON.stringify(null));

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                window.location.replace("https://my-expenditure-overview.herokuapp.com");
            }
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////

/* helper functions */

Date.prototype.getWeek = function() {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                          - 3 + (week1.getDay() + 6) % 7) / 7);
}

const formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
});

