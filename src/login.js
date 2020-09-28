function login(username, password) {

    let httpRequest = new XMLHttpRequest();

    

    httpRequest.open("POST", "http://localhost:3000/login", true);
    httpRequest.setRequestHeader("Content-Type", "application/json");
    httpRequest.send(JSON.stringify({
        "username": username,
        "password": password
    }));

    if (document.querySelector(".loginError")) {
        document.querySelector(".loginError").remove();
    }

    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            // Everything is good, the response was received.             
            if (httpRequest.status === 200) {
                // Perfect!
                if(httpRequest.response === "false") {
                    let loginForm = document.getElementById("loginForm");
                    let errorMessege = document.createElement("div");
                    errorMessege.className = "loginError";
                    errorMessege.innerHTML = "Incorrect username/password";
                    loginForm.insertBefore(errorMessege, document.getElementById("loginSubmit"));
                    return;
                } else {
                    console.log("i'm here");
                    window.location.replace("http://localhost:3000/list");
                }                    
            }
        }
    }
}


