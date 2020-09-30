function signup(username, email, password, confirm) {    

    let httpRequest = new XMLHttpRequest();

    httpRequest.open("POST", "https://my-expenditure-overview.herokuapp.com/signup", true);
    httpRequest.setRequestHeader("Content-Type", "application/json");
    httpRequest.send(JSON.stringify({
        "username": username,
        "email": email,
        "password": password,
        "confirm": confirm
            
    }));

    if (document.querySelector(".signupError")) {
        document.querySelector(".signupError").remove();
    }

    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            // Everything is good, the response was received.  
            if (httpRequest.status === 200) {
                // Perfect!   //NOT TESTED YET!!!!!!    TEST IT!!!!!!!!!!           
                if(httpRequest.response === "success") {
                    window.location.replace("https://my-expenditure-overview.herokuapp.com/list"); 
                } else {
                    let signupForm = document.getElementById("signupForm");
                    let errorMessege = document.createElement("div");
                    errorMessege.className = "signupError";
                    errorMessege.innerHTML = httpRequest.response;
                    signupForm.insertBefore(errorMessege, document.getElementById("signupSubmit"));          
                }
            }
        }
    }
    return;
}