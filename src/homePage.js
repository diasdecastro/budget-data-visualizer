function renderPage() {
    let loginTab = document.getElementById("loginTab");
    let signupTab = document.getElementById("signupTab");

    let loginContainer = document.getElementById("login");
    let signupContainer = document.getElementById("signup");

    loginTab.className = "collapsedTab";
    signupTab.className = "hiddenTab";

    loginContainer.className = "collapsedForm";
    signupContainer.className = "hiddenForm";

    loginTab.addEventListener("click", () => {
        loginTab.className = "collapsedTab";
        signupTab.className = "hiddenTab";

        loginContainer.className = "collapsedForm";
        signupContainer.className = "hiddenForm";
    });

    signupTab.addEventListener("click", () => {
        loginTab.className = "hiddenTab";
        signupTab.className = "collapsedTab";

        loginContainer.className = "hiddenForm";
        signupContainer.className = "collapsedForm";
    });
}