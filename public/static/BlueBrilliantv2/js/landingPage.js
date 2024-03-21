const Login = document.getElementById("LoginButton");

const Register = document.getElementById("RegisterButton");

//Disable Scrolling
document.body.style.overflow = "hidden";

Login.addEventListener("click", function () { //THESE WILL REDIRECT YOU TO THE OTHER PAGES
    window.location.href = "./login";
});

Register.addEventListener("click", function () {
    window.location.href = "./register";
});
