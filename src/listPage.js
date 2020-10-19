/* imports */

/* Global variables */

var orderCol = "day_date"; //ordered by this column
var pageNum = 0;

/* order varables */
var day_date = "desc";
var category = "desc";
var amount_cents = "desc";
var details = "desc";

/* filter variables */
var minDateVar = "2000-01-01";
var maxDateVar = "2030-01-01";
var categoriesVar;
var minAmountVar = 0;
var maxAmountVar = 9223372036854775; //infinity

/* helpers to check if insert or hide/collapse filters have events */
var insertHasEvent = false;
var hideCollapseHasEvent = false;
var escapeRemoveEvent = false;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* Data display functions */

function makeList(entries) {
    if (!document.getElementById("listTable")) {
        let listTable = document.createElement("table");
        let rootElem = document.getElementById("root");
        listTable.id = "listTable";
        rootElem.appendChild(listTable);
    }
    let results = entries;                
    let listTableELem = document.getElementById("listTable");
    listTableELem.innerHTML = "<thead>" + 
                                    "<tr>" + 
                                        "<th id='dateCol'><span class='dateSpan'>Date</span>   <a id='sortDate' title='Sort' href='#'><i class='fa fa-sort'></i></a></th>" + 
                                        "<th id='categoryCol'>Category   <a id='sortCategory' title='Sort' href='#'><i class='fa fa-sort'></i></a></th>" + 
                                        "<th id='amountCol'>Amount   <a id='sortAmount' title='Sort' href='#'><i class='fa fa-sort'></i></a></th>" +
                                        "<th id='detailsCol'>Details   <a id='sortDetails' title='Sort' href='#'><i class='fa fa-sort'></i></a></th>" +
                                        "<th id='action'>Action</th>" + 
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
                    let dateString = day + "/" + (month + 1) + "/" + year;
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
                } else if (prop == "details") {
                    let container = document.createElement("div");
                    container.innerHTML = results[i][prop];
                    entry.appendChild(container);                                                     
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

function changeOrder(column, order){    
    if (order == "asc") {
        orderCol = column;
        window[column] = "desc";
    } else {
        orderCol = column;
        window[column] = "asc";
    }
    getEntries(column, window[column], minDateVar, maxDateVar, minAmountVar*100, maxAmountVar*100, categoriesVar);
}

/* Filter data */

function filters() {
    /* Date */
    if (!document.getElementById("dateFilter").innerHTML){
    
        let dateCol = document.getElementById("dateFilter");
        let dateContainer = document.createElement("div");
        dateContainer.innerHTML = "<lable for='minDate'>Min Date</lable>" +        
                "<input id='minDate' name='minDate' type='date' value='2000-01-01'>" +
                "<label for='maxDate'>Max Date</label>" +
                "<input id='maxDate' name='maxDate' type='date' value='2030-01-01'>";
        dateCol.appendChild(dateContainer);

        /* Category */

        let categoryCol = document.getElementById("categoryFilter");
        categoryCol.innerHTML = "<div class='categCol'>" +
                                    "<div class='input'>" +
                                        "<input class='categoryCheck' type='checkbox' name='housing'>" +
                                        "<lable for='Housing'>Housing</lable>" +
                                    "</div>" +
                                    "<div class='input'>" +
                                        "<input class='categoryCheck' type='checkbox' name='Transportation'>" +
                                        "<lable for='Transportation'>Transportation</lable>" +
                                    "</div>" +
                                    "<div class='input'>" +
                                        "<input class='categoryCheck' type='checkbox' name='Food'>" +
                                        "<lable for='Food'>Food</lable>" +
                                    "</div>" +
                                    "<div class='input'>" +
                                        "<input class='categoryCheck' type='checkbox' name='Utilities'>" +
                                        "<lable for='Utilities'>Utilities</lable>" +
                                     "</div>" +
                                "</div>" +
                                "<div class='categCol'>" +
                                    "<div class='input'>" +
                                        "<input class='categoryCheck' type='checkbox' name='Insurance'>" +
                                        "<lable for='Insurance'>Insurance</lable>" +
                                    "</div>" +
                                    "<div class='input'>" +
                                        "<input class='categoryCheck' type='checkbox' name='Health'>" +
                                        "<lable for='Health'>Health</lable>" +
                                    "</div>" + 
                                    "<div class='input'>" +
                                        "<input class='categoryCheck' type='checkbox' name='Saving'>" +
                                        "<lable for='Saving'>Saving</lable>" +
                                    "</div>"+
                                    "<div class='input'>" +
                                        "<input class='categoryCheck' type='checkbox' name='Other'>" +
                                        "<lable for='Other'>Other</lable>" +
                                    "</div>" +
                                "</div>";

        /* Amount */

        let amountCol = document.getElementById("amountFilter");

        let slider = document.createElement("div");
        noUiSlider.create(slider, {
            start: [0, 10000],
            connect: true,
            range: {
                'min': 0,
                'max': 10000
            }
        });
        amountCol.appendChild(slider);

        /* output of slider values */

        let minValueSpan = document.createElement("div");
        minValueSpan.id = "minValueSpan";
        let showMinValue = document.createElement("input");
        showMinValue.id = "minAmount";
        showMinValue.type = "number";
        showMinValue.name = "minAmount";
        showMinValue.step = "0.01";
        
        let maxValueSpan = document.createElement("div");
        maxValueSpan.id = "maxValueSpan";
        let showMaxValue = document.createElement("input");
        showMaxValue.id = "maxAmount";
        showMaxValue.type = "number";
        showMaxValue.name = "maxAmount";
        showMaxValue.step = "0.01";
        showMaxValue.setAttribute("form", "filterForm");

            
        minValueSpan.appendChild(showMinValue);
        maxValueSpan.appendChild(showMaxValue);
        amountCol.appendChild(minValueSpan);
        amountCol.appendChild(maxValueSpan);
        
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

        /* Button to submit filters */

        let submitContainer = document.createElement("div");
        submitContainer.id = "submitContainer";
        let submit = document.createElement("button");
        submit.innerHTML = "Submit";
        submit.addEventListener('click', () => {
            let minDate = document.getElementById("minDate").value;
            let maxDate = document.getElementById("maxDate").value;
            let minAmount = document.getElementById("minAmount").value;
            let maxAmount = document.getElementById("maxAmount").value;
            changeFilters(minDate, maxDate, minAmount, maxAmount);
        });

        submitContainer.appendChild(submit);
        document.getElementById("filters").appendChild(submitContainer);
    }
}

function changeFilters(minDate, maxDate, minAmount, maxAmount) {

    let categoryCheckElems = document.getElementsByClassName("categoryCheck");
    let chekedBoxes = [];

    for(let i = 0; i < categoryCheckElems.length; i++){
        if (categoryCheckElems[i].checked) {
            chekedBoxes.push(categoryCheckElems[i].name);
        }
    }    

    minDateVar = minDate;
    maxDateVar = maxDate;
    minAmountVar = minAmount;
    maxAmountVar = maxAmount;
    categoriesVar = chekedBoxes;

    getEntries("day_date", "desc", minDateVar, maxDateVar, minAmountVar*100, maxAmountVar*100, categoriesVar);
}

function nextPage() {
    pageNum += 1;
    getEntries();
}

function prevPage() {
    pageNum -= 1;
    getEntries();
}

///////////////////////////////////////////////////////////////////////////////////////////////////////

/* Helper functions */

function createInsertEditForm(action, editId) {    
    if (!document.getElementById("insertForm")){ //if for element doesn't already exist, create one
        let rootElem = document.getElementById("root");
        if (action == "insert") {
            rootElem.innerHTML = `<form method='POST' id='insertForm' onsubmit='insertNewEntry(this.date.value, this.category.value, this.amount.value, this.details.value); return false'></form>` + 
                                "<input id='insertSubmit' type='submit' style='position:absolute; visibility: hidden; z-index:-1;'  form='insertForm'>" + rootElem.innerHTML;
        } else if (action == "edit") {
            rootElem.innerHTML = `<form method='POST' id='insertForm' onsubmit='editEntry(${editId}, this.date.value, this.category.value, this.amount.value, this.details.value, ${orderCol}); return false'></form>` + 
                                "<input id='insertSubmit' type='submit' style='position:absolute; visibility: hidden; z-index:-1;'  form='insertForm'>" + rootElem.innerHTML;
        
        }
        let tableBodyElem = document.getElementById("tableBody");        
        let newRow = document.createElement("tr");
        newRow.id = "formRow";
        newRow.innerHTML = "<td><input type='date' name='date' placeholder='Insert Date' autocomplete='off' form='insertForm' required/></td>" + 
                        "<td>" + 
                        "<select name='category' form='insertForm'>" + 
                            "<option value='Housing'>Housing</option>" + 
                            "<option value='Transportation'>Transportation</option>" +
                            "<option value='Food'>Food</option>" +
                            "<option value='Utilities'>Utilities</option>" +
                            "<option value='Insurance'>Insurance</option>" +
                            "<option value='Health'>Health</option>" +
                            "<option value='Saving'>Saving</option>" +
                            "<option value='Other'>Other</option>" +
                        "</select>" +
                        "</td>" +
                        "<td><input type='number' step='0.01' min='0' max='10000' name='amount' placeholder='Insert Amount' autocomplete='off' form='insertForm' required/></td>" +
                        "<td><input type='text' name='details' placeholder='Insert Details' autocomplete='off' form='insertForm' required/></td>" +
                        "<td class='cancel'><i class='fa fa-times'></i></td>";
                        
                        
        if (action == "insert"){
            tableBodyElem.insertBefore(newRow, tableBodyElem.firstChild);
        } else if (action == "edit") {
            editElem = document.querySelector(`tr[db_id="${editId}"]`);
            editElem.className = "editRow";
            editElem.innerHTML = newRow.innerHTML;
        }

        document.querySelectorAll('.cancel').forEach( item => {
            item.addEventListener("click", () => {

                if (action == "edit") {
                    document.getElementById("insertForm").remove();
                    document.getElementById("insertSubmit").remove();
                    getEntries(orderCol, window[orderCol], minDateVar, maxDateVar, minAmountVar*100, maxAmountVar*100, categoriesVar);
                } else if (document.getElementById("insertForm") && document.getElementById("insertSubmit")){
                    //if elements exist
                    document.getElementById("insertForm").remove();
                    document.getElementById("insertSubmit").remove();
                    getEntries(orderCol, window[orderCol], minDateVar, maxDateVar, minAmountVar*100, maxAmountVar*100, categoriesVar);
                }
                newRow.remove();   
            });
        });


        if (!escapeRemoveEvent) {

            document.addEventListener('keydown', (e) => {
                if (e.keyCode === 27) { //if escape key gets pressed, delete insert form
    
                    if (action == "edit") {                   
                        document.getElementById("insertForm").remove();
                        document.getElementById("insertSubmit").remove();
                        getEntries(orderCol, window[orderCol], minDateVar, maxDateVar, minAmountVar*100, maxAmountVar*100, categoriesVar);
                    } else if (document.getElementById("insertForm") && document.getElementById("insertSubmit")){
                        //if elements exist
                        document.getElementById("insertForm").remove();
                        document.getElementById("insertSubmit").remove();
                        getEntries(orderCol, window[orderCol], minDateVar, maxDateVar, minAmountVar*100, maxAmountVar*100, categoriesVar);
                    }
                    newRow.remove();
                    escapeRemoveEvent = true;
                }
            });
        }
        
    } else {
        return 0;
    } 
    addEventsForWindow();  
}

function editDeleteButton(row, id) {
    /* delete entry icon */
    let deleteElem = document.createElement("a");
    deleteElem.id = id;
    deleteElem.className = "deleteEntry";
    deleteElem.innerHTML = "<i class='fa fa-trash'></i>";
    deleteElem.title = "Delete";
    deleteElem.addEventListener("click", () => { //onclick call deteleEntry function
        deleteEntry(deleteElem.id);
    });

    /* edit entry icon */
    let editElem = document.createElement("a");
    editElem.id = id;
    editElem.className = "editEntry";
    editElem.innerHTML = "<i class='fa fa-edit'></i>";
    editElem.title = "Edit";
    editElem.addEventListener("click", () => { //onclick call editEntry function
        createInsertEditForm("edit", editElem.id);
    });

    row.appendChild(editElem);
    row.appendChild(deleteElem);
}

/* Event listeners */

function addEventsForWindow() {

    /* hide, collapse filters */
    let filterToggle = document.getElementById("filterToggle");
    let filterContainer = document.getElementById("filters");
    let hideCollapseButton = document.getElementById("hideCollapse");
    hideCollapseButton.title = "Collapse";
    if (!hideCollapseHasEvent){
        hideCollapseButton.addEventListener("click", () => {
            if (filterContainer.className == "filter hidden") {
                hideCollapseButton.className = "fa fa-angle-up";
                hideCollapseButton.title = "Hide";
                filterContainer.className = "filter collapse";
                filterToggle.className = "collapseToggle";
                
            } else {
                hideCollapseButton.className = "fa fa-angle-down";
                hideCollapseButton.title = "Collapse";
                filterContainer.className = "filter hidden";
                filterToggle.className = "hiddenToggle";
                
            }
        });

        hideCollapseHasEvent = true;
    }
    

    /* Order elements */

    document.getElementById("sortDate").addEventListener("click", () => { 
        changeOrder("day_date", day_date);
    });
    document.getElementById("sortCategory").addEventListener("click", () => { 
        changeOrder("category", category); 
    });
    document.getElementById("sortAmount").addEventListener("click", () => { 
        changeOrder("amount_cents", amount_cents); 
    });
    document.getElementById("sortDetails").addEventListener("click", () => { 
        changeOrder("details", details);
    });
    if (!insertHasEvent){
        document.getElementById("insertEntry").addEventListener("click", () => {
            createInsertEditForm('insert');
        }); 
        insertHasEvent = true;
    }   
      
    
}

function pageNavRender (lastPage) {
    if(pageNum === 0) {
        document.getElementById("prev").className = "hide";    
        document.getElementById("next").className = "show";    
    } else if (pageNum === lastPage) {
        document.getElementById("prev").className = "show";    
        document.getElementById("next").className = "hide";  
    } else {
        document.getElementById("prev").className = "show";    
        document.getElementById("next").className = "show";  
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* AJAX requests */

function getEntries(column, order, minDate, maxDate, minAmountCents, maxAmountCents, categories) {

    let httpRequest = new XMLHttpRequest();
    let categ = (categories) ? categories : [];
    let categoryArray = [];

    for (let i = 0; i < categ.length; i++) {
        categoryArray.push("\'" + categ[i] + "\'")
    }

    httpRequest.open("GET", `https://my-expenditure-overview.herokuapp.com/list/budget?mindate=${minDate}&maxdate=${maxDate}&mincents=${minAmountCents}&maxcents=${maxAmountCents}&category=${categoryArray}&column=${column}&order=${order}&page=${pageNum*50}`, true);
    httpRequest.send();

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                filters();
                let formattedResponse = JSON.parse(httpRequest.response)
                makeList(formattedResponse["results"]);       
                pageNavRender(Math.ceil(formattedResponse["numberOfPages"][0]["count"] / 50) - 1);
                
            } else {
                window.location.replace("https://my-expenditure-overview.herokuapp.com/404");
            }
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////

/* insert new entry */

function insertNewEntry(date, category, amount, details) {
    let httpRequest = new XMLHttpRequest();

    httpRequest.open("POST", "https://my-expenditure-overview.herokuapp.com/list/budget/", true);
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

    httpRequest.open("DELETE", `https://my-expenditure-overview.herokuapp.com/list/budget?id=${id}`, true);
    httpRequest.send();

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                if (httpRequest.response) {
                    console.log("Entry deleted");
                    getEntries();
                } else {
                    window.location.replace("https://my-expenditure-overview.herokuapp.com/404");
                }
            }
        }
    }
}

///////////////////////////////////////////////////////

/* edit entry */

function editEntry(id, date, category, amount, details, keepOrderCol) {   
    let httpRequest = new XMLHttpRequest();

    httpRequest.open("PUT", `https://my-expenditure-overview.herokuapp.com/list/budget?id=${id}&date=${date}&category=${category}&amount=${amount}&details=${details}`);
    httpRequest.send();

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                console.log("Entry updated");
                getEntries(orderCol, keepOrderCol, minDateVar, maxDateVar, minAmountVar*100, maxAmountVar*100, categoriesVar);
            } else {
                window.location.replace("https://my-expenditure-overview.herokuapp.com/404");
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
            } else {
                window.location.replace("https://my-expenditure-overview.herokuapp.com/404");
            }
        }
    }
}