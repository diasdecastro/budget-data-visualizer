/* Global variables */

var dateOrder = "asc";
var categoryOrder = "desc";
var amountOrder = "desc";
var detailsOrder = "desc";


function makeList(entries) {
    let results = JSON.parse(entries);
    let rootElem = document.getElementById("root");
    let listTable = document.createElement("table");
    listTable.id = "listTable";
    rootElem.appendChild(listTable);
    let listTableELem = document.getElementById("listTable");
    listTableELem.innerHTML = "<thead>" + 
                                    "<tr>" + 
                                        "<th id='dateCol'>Date   <a id='sortDate' href='#'><i class='fa fa-sort'></i></a></th>" + 
                                        "<th id='categoryCol'>Category   <a id='sortCategory' href='#'><i class='fa fa-sort'></i></a></th>" + 
                                        "<th id='amountCol'>Amount   <a id='sortAmount' href='#'><i class='fa fa-sort'></i></a></th>" +
                                        "<th id='categoryCol'>Details   <a id='sortDetails' href='#'><i class='fa fa-sort'></i></a></th>" +
                                        "<th></th>" + 
                                    "</tr>"+ 
                                "</thead>" +
                                "<tbody id='tableBody'></tbody>";    
    let tableBodyElem = document.getElementById("tableBody");
    for (let i = 0; i < results.length; i++) {
        let newRow = document.createElement("tr");
        newRow.id = "listRow";
        tableBodyElem.appendChild(newRow);                  
        for (let prop in results[i]) {
            if (results[i].hasOwnProperty(prop)) {
                let entry = document.createElement("td");
                entry.id = prop;
                if(prop == "day_date") {
                    /* handler for date column */
                    let day = new Date(results[i][prop]).getDate();
                    let month = new Date(results[i][prop]).getMonth();
                    let year = new Date(results[i][prop]).getFullYear();
                    let dateString = day + "/" + month + "/" + year;
                    entry.innerHTML = dateString;

                } else if(prop == "id") {
                    /* delete entry icon */
                    let deleteElem = document.createElement("a");
                    deleteElem.id = results[i][prop];
                    deleteElem.className = "deleteEntry";
                    deleteElem.innerHTML = "<i class='fa fa-trash'></i>";
                    deleteElem.addEventListener("click", () => { //onclick call deteleEntry function
                        deleteEntry(deleteElem.id);
                    });
            

                    let editElem = document.createElement("a");
                    editElem.id = results[i][prop];
                    deleteElem.className = "deleteEntry";
                    editElem.innerHTML = "<i class='fa fa-edit'></i>";

                    entry.appendChild(editElem);
                    entry.appendChild(deleteElem);
                    
                } else {
                    entry.innerHTML = results[i][prop];
                }
                newRow.appendChild(entry);                                    
            }
        }
    }
    addEventListeners();  
}


function getAllEntries() {
    let httpRequest = new XMLHttpRequest();

    httpRequest.open("GET", "http://localhost:3000/budget/", true);
    httpRequest.send();

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {   
                makeList(httpRequest.response);
            } else {
                alert("something wrong!");
            }
        }
    }
}


function handleChanges(column, order, minDate, maxDate, minAmountCents, maxAmountCents) {
    //filters();
    let httpRequest = new XMLHttpRequest();

    httpRequest.open("GET", `http://localhost:3000/budget?minDate=${minDate}&maxDate=${maxDate}&minAmountCents=${minAmountCents}&maxAmountCents=${maxAmountCents}&column=${column}&order=${order}`, true);
    httpRequest.send();

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                makeList(httpRequest.response);
            } else {
                alert("something wrong");
            }
        }
    }
}

/* Change Order handlers */

function addEventListeners() {
    /* Order elements */
    document.getElementById("sortDate").addEventListener("click", () => { 
        changeOrder("day_date", dateOrder, "dateOrder"); 
    });
    document.getElementById("sortCategory").addEventListener("click", () => { 
        changeOrder("category", categoryOrder, "categoryOrder"); 
    });
    document.getElementById("sortAmount").addEventListener("click", () => { 
        changeOrder("amount_cents", amountOrder, "amountOrder"); 
    });
    document.getElementById("sortDetails").addEventListener("click", () => { 
        changeOrder("details", detailsOrder, "detailsOrder");
     });    
}

function changeOrder(column, order, columnName){    
    if (order == "asc") {
        handleChanges(column, order);
        window[columnName] = "desc";
    } else {
        handleChanges(column, order);
        window[columnName] = "asc";
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* Change Filters handlers */

function changeFilters(minDate, maxDate, inOrOut, minAmountCents, maxAmountCents) {

}

/* Insert new entry handles */

function createInsertForm() {
    if (!document.getElementById("formRow")){ //if for element doesn't already exist, create one
        let rootElem = document.getElementById("root")
        rootElem.innerHTML = "<form method='POST' id='insertForm' onsubmit='insertNewEntry(this.date.value, this.category.value, this.amountCents.value, this.details.value); return false'></form>" + 
                                "<input id='insertSubmit' type='submit' style='position:absolute; visibility: hidden; z-index:-1;'  form='insertForm'>" + rootElem.innerHTML;
        let tableBodyElem = document.getElementById("tableBody");        
        let newRow = document.createElement("tr");
        newRow.id = "formRow";
        newRow.innerHTML = "<td><input type='date' name='date' placeholder='Insert Date' autocomplete='off' form='insertForm' required/></td>" + 
                        "<td>" + 
                        "<select name='category' form='insertForm'>" + 
                            "<option value='Work'>Work</option>" + 
                            "<option value='Food'>Food</option>" +
                            "<option value='Other'>Other</option>" +
                        "</select>" +
                        "</td>" +
                        "<td><input type='number' step='1' min='0' max='9223372036854775806' name='amountCents' placeholder='Insert Amount' autocomplete='off' form='insertForm' required/></td>" +
                        "<td><input type='text' name='details' placeholder='Insert Details' autocomplete='off' form='insertForm' required/></td>" +
                        "<td class='cancel'><i class='fa fa-times'></i></td>";
        tableBodyElem.insertBefore(newRow, tableBodyElem.firstChild);
        document.addEventListener('keydown', (e) => {
            if (e.keyCode === 27) { //if escape key gets pressed, delete insert form
                if (document.getElementById("insertForm") && document.getElementById("insertSubmit")){
                    //if elements exist
                    document.getElementById("insertForm").remove();
                    document.getElementById("insertSubmit").remove();
                }
                newRow.remove();
            };
        })
    } else {
        return 0;
    }
        
}

//budget_data: day_date | category | amount_cents | details

function insertNewEntry(date, category, amountCents, details) {
    let httpRequest = new XMLHttpRequest();

    httpRequest.open("POST", "http://localhost:3000/budget/", true);
    httpRequest.setRequestHeader("Content-Type", "application/json");
    httpRequest.send(JSON.stringify({
        "day_date": date,
        "category": category,
        "amount_cents": amountCents,
        "details": details
    }));


    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                if(httpRequest.response == "Username not available" || httpRequest.response == "Different Emails") {
                    console.log("not success");
                } else {
                    console.log("success");
                }
            }
        }
    }
    document.getElementById("formRow").remove();
    getAllEntries();
}

/////////////////////////////////////////////////////////////////////////////

/* delete entry */

function deleteEntry(id) {
    let httpRequest = new XMLHttpRequest();

    httpRequest.open("DELETE", `http://localhost:3000/budget?id=${id}`, true);
    httpRequest.send();

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                if (httpRequest.response) {
                    console.log("Entry deleted");
                    getAllEntries();
                } else {
                    alert("Something Wrong");
                }
            }
        }
    }
}

