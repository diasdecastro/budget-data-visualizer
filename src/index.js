/* imports */

/* Global variables */

var orderCol = "day_date"
var dateOrder = "asc";
var categoryOrder = "desc";
var amountOrder = "desc";
var detailsOrder = "desc";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* Data display functions */

function makeList(entries) {
    if (!document.getElementById("listTable")) {
        let listTable = document.createElement("table");
        let rootElem = document.getElementById("root");
        listTable.id = "listTable";
        rootElem.appendChild(listTable);
    }
    let results = JSON.parse(entries);                
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
                    attr = document.createAttribute("db_id"); //attrubute db_id for each row
                    attr.value = results[i][prop];
                    newRow.setAttributeNode(attr);

                    editDeleteButton(entry, results[i][prop]);
                 
                } else if(prop == "amount_cents") {
                    /* transforms cents in euros */
                    const formatter = new Intl.NumberFormat('de-DE', {
                        style: 'currency',
                        currency: 'EUR'
                    });
                    entry.innerHTML = formatter.format(results[i][prop] / 100);                                        
                } else {
                    entry.innerHTML = results[i][prop];
                }
                newRow.appendChild(entry);                                    
            }
        }
    }
    addEventsForWindow();
        
    
         
}

/* Order data */    

function changeOrder(column, order, columnName){    
    if (order == "asc") {
        handleChanges(column, order);
        window[orderCol] = column;
        window[columnName] = "desc";
    } else {
        handleChanges(column, order);
        window[orderCol] = column;
        window[columnName] = "asc";
    }
}

/* Filter data */

function filters() {
    /* Date */

    let dateCol = document.getElementById("dateFilter");
    dateCol.innerHTML = "<input id='minDate' name='minDate' type='date' value='2000-01-01'>" +
            "<lable for='minDate'>Min Date</lable>" +
            "<input id='maxDate' name='maxDate' type='date' value='2030-01-01'>" +
            "<label for='maxDate'>Max Date</label>";

    /* Category */

    let categoryCol = document.getElementById("categoryFilter");
    categoryCol.innerHTML = "<input type='checkbox' name='housing'>" +
                    "<lable for='Housing'>Housing</lable>" +
                    "<input type='checkbox' name='Tranportation'>" +
                    "<lable for='Transportation'>Transportation</lable>" +
                    "<input type='checkbox' name='Food'>" +
                    "<lable for='Food'>Food</lable>" +
                    "<input type='checkbox' name='Utilities'>" +
                    "<lable for='Utilities'>Utilities</lable>" +
                    "<input type='checkbox' name='Insurence'>" +
                    "<lable for='Insurance'>Insurence</lable>" +
                    "<input type='checkbox' name='Health'>" +
                    "<lable for='Health'>Health</lable>" +
                    "<input type='checkbox' name='Saving'>" +
                    "<lable for='Saving'>Saving</lable>" +
                    "<input type='checkbox' name='Other'>" +
                    "<lable for='Other'>Other</lable>"

    /* Amount */
    let amountCol = document.getElementById("amountFilter");

    let slider = document.createElement("div");
    noUiSlider.create(slider, {
        start: [2000, 8000],
        connect: true,
        range: {
            'min': 0,
            'max': 10000
        }
    });
    amountCol.appendChild(slider);

    /* output of slider values */

    let showMinValue = document.createElement("input");
    showMinValue.id = "minAmount";
    showMinValue.type = "number";
    showMinValue.name = "minAmount";
    showMinValue.step = "0.01";
    
    
    let showMaxValue = document.createElement("input");
    showMaxValue.id = "maxAmount";
    showMaxValue.type = "number";
    showMaxValue.name = "maxAmount";
    showMaxValue.step = "0.01";
    showMaxValue.setAttribute("form", "filterForm");

        
    amountCol.appendChild(showMinValue);
    amountCol.appendChild(showMaxValue);
    
    slider.noUiSlider.on('update', () => {
        showMinValue.value = slider.noUiSlider.get()[0];
        showMaxValue.value = slider.noUiSlider.get()[1];
    });

    showMinValue.addEventListener("change", () => {
        slider.noUiSlider.set([showMinValue.value, showMaxValue.value]);
    });

    showMaxValue.addEventListener("change", () => {
        slider.noUiSlider.set([showMinValue.value, showMaxValue.value]);
    });

    let submit = document.createElement("button");
    submit.innerHTML = "Submit";
    submit.addEventListener('click', () => {
        let minDate = document.getElementById("minDate").value;
        let maxDate = document.getElementById("maxDate").value;
        let minAmount = document.getElementById("minAmount").value;
        let maxAmount = document.getElementById("maxAmount").value;
        changeFilters(minDate, maxDate, minAmount, maxAmount);
    });

    document.getElementById("filters").appendChild(submit);

}

function changeFilters(minDate, maxDate, minAmount, maxAmount) {
    console.log("Min Date" + minDate);
    console.log("Max Date" + maxDate);
    console.log("Min Amount" + minAmount);
    console.log("Max Amount" + maxAmount);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////

/* Helper functions */

function createInsertEditForm(action, editId) {
    if (!document.getElementById("formRow")){ //if for element doesn't already exist, create one
        let rootElem = document.getElementById("root");
        if (action == "insert") {
            rootElem.innerHTML = `<form method='POST' id='insertForm' onsubmit='insertNewEntry(this.date.value, this.category.value, this.amount.value, this.details.value); return false'></form>` + 
                                "<input id='insertSubmit' type='submit' style='position:absolute; visibility: hidden; z-index:-1;'  form='insertForm'>" + rootElem.innerHTML;
        } else if (action == "edit") {
            rootElem.innerHTML = `<form method='POST' id='insertForm' onsubmit='editEntry(${editId}, this.date.value, this.category.value, this.amount.value, this.details.value); return false'></form>` + 
                                "<input id='insertSubmit' type='submit' style='position:absolute; visibility: hidden; z-index:-1;'  form='insertForm'>" + rootElem.innerHTML;
        
        }
        let tableBodyElem = document.getElementById("tableBody");        
        let newRow = document.createElement("tr");
        newRow.id = "formRow";
        newRow.innerHTML = "<td><input type='date' name='date' placeholder='Insert Date' autocomplete='off' form='insertForm' required/></td>" + 
                        "<td>" + 
                        "<select name='category' form='insertForm'>" + 
                            "<option value='Housing'>Housing</option>" + 
                            "<option value='Tranportation'>Transportation</option>" +
                            "<option value='Food'>Food</option>" +
                            "<option value='Utilities'>Utilities</option>" +
                            "<option value='Insurence'>Insurence</option>" +
                            "<option value='Health'>Health</option>" +
                            "<option value='Saving'>Saving</option>" +
                            "<option value='Other'>Other</option>" +
                        "</select>" +
                        "</td>" +
                        "<td><input type='number' step='0.01' min='0' max='9223372036854775806' name='amount' placeholder='Insert Amount' autocomplete='off' form='insertForm' required/></td>" +
                        "<td><input type='text' name='details' placeholder='Insert Details' autocomplete='off' form='insertForm' required/></td>" +
                        "<td class='cancel'><i class='fa fa-times'></i></td>";
                        
                        
        if (action == "insert"){
            tableBodyElem.insertBefore(newRow, tableBodyElem.firstChild);
        } else if (action == "edit") {
            console.log(editId);
            editElem = document.querySelector(`tr[db_id="${editId}"]`);
            editElem.innerHTML = newRow.innerHTML;
        }

        document.querySelectorAll('.cancel').forEach( item => {
            item.addEventListener("click", () => {

                if (document.getElementById("insertForm") && document.getElementById("insertSubmit")){
                    //if elements exist
                    document.getElementById("insertForm").remove();
                    document.getElementById("insertSubmit").remove();
                }
                newRow.remove();   
            });
        });


        
        document.addEventListener('keydown', (e) => {
            if (e.keyCode === 27) { //if escape key gets pressed, delete insert form

                /* removeInsertEditForm(newRow, "edit"); */

                if (document.getElementById("insertForm") && document.getElementById("insertSubmit")){
                    //if elements exist
                    document.getElementById("insertForm").remove();
                    document.getElementById("insertSubmit").remove();
                }
                if (action == "edit") {                   
                    getEntries();
                }
                newRow.remove();
            };
        });

    } else {
        return 0;
    }   
}

function editDeleteButton(row, id) {
    /* delete entry icon */
    let deleteElem = document.createElement("a");
    deleteElem.id = id;
    deleteElem.className = "deleteEntry";
    deleteElem.innerHTML = "<i class='fa fa-trash'></i>";
    deleteElem.addEventListener("click", () => { //onclick call deteleEntry function
        deleteEntry(deleteElem.id);
    });

    /* edit entry icon */
    let editElem = document.createElement("a");
    editElem.id = id;
    editElem.className = "editEntry";
    editElem.innerHTML = "<i class='fa fa-edit'></i>";
    editElem.addEventListener("click", () => { //onclick call editEntry function
        console.log(editElem.id);
        createInsertEditForm("edit", editElem.id);
    });

    row.appendChild(editElem);
    row.appendChild(deleteElem);
}

/* Change Order handlers */

function addEventsForWindow() {
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
    document.getElementById("insertEntry").addEventListener("click", () => {
        createInsertEditForm('insert');
    });
    
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* AJAX requests */

function getEntries(column, order, minDate, maxDate, minAmountCents, maxAmountCents) {
    //filters();
    let httpRequest = new XMLHttpRequest();

    httpRequest.open("GET", `http://localhost:3000/budget?minDate=${minDate}&maxDate=${maxDate}&minAmountCents=${minAmountCents}&maxAmountCents=${maxAmountCents}&column=${column}&order=${order}`, true);
    httpRequest.send();

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                filters();
                makeList(httpRequest.response);
            } else {
                alert("something wrong");
            }
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////

/* insert new entry */

function insertNewEntry(date, category, amount, details) {
    let httpRequest = new XMLHttpRequest();

    httpRequest.open("POST", "http://localhost:3000/budget/", true);
    httpRequest.setRequestHeader("Content-Type", "application/json");
    httpRequest.send(JSON.stringify({
        "day_date": date,
        "category": category,
        "amount": amount,
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
    getEntries();
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
                    getEntries();
                } else {
                    alert("Something Wrong");
                }
            }
        }
    }
}

///////////////////////////////////////////////////////

/* edit entry */

function editEntry(id, date, category, amount, details) {   
    let httpRequest = new XMLHttpRequest();

    httpRequest.open("PUT", `http://localhost:3000/budget?id=${id}&date=${date}&category=${category}&amount=${amount}&details=${details}`);
    httpRequest.send();

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                console.log("Entry updated");
                getEntries();
            } else {
                alert("Something wrong")
            }
        }
    }
}