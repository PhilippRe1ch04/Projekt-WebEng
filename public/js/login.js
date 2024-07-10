let username = sessionStorage.getItem("uname");
if(username != null){
    document.getElementById("username").innerHTML = username;
    document.getElementById("loginbutton").innerText = "Logout";
}

//add evenetListener on submit click of loginForm
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    login();
});

//add eventListener on submit click of registerForm
document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    register();
});

window.viewLogin = viewLogin;
window.closeLogin = closeLogin;

//function to show login as PopUp 
function viewLogin(){
    if(sessionStorage.getItem("uname") != null){
        sessionStorage.removeItem("uname");
        sessionStorage.removeItem("id");
        document.getElementById("username").innerText = "guest";
        document.getElementById("loginbutton").innerText = "Login";
        return;
    }
    closeContent();
    try{
        getActiveScene().removeListeners();
    }catch(e){
        //classic view
    }
    
    let loginDiv = document.getElementById("loginPopUp");
    loginDiv.style.visibility = 'visible';
}

//function to hide login PopUp
function closeLogin(){
    try{
        getActiveScene().addListeners();
    }catch(e){
        //classic view
    }
    
    let loginDiv = document.getElementById("loginPopUp");
    loginDiv.style.visibility = 'hidden';
}

//function called to switch forms
function changeMethod(){
    let firsts = document.getElementsByClassName("first"); //first is parent div
    if(firsts[0].classList.contains("active")){
        firsts[0].classList.remove("active");
        firsts[1].classList.add("active");
    }else{
        firsts[1].classList.remove("active");
        firsts[0].classList.add("active");
    }
}

//function called on register submit click
function register(){
    //get form input
    const formData = new FormData(document.getElementById('registerForm'));
    const data = {
        uname: formData.get('uname'),
        uemail: formData.get('uemail'),
        psw: formData.get('psw')
    };

    //call API to add new user entry in db
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        const resultP = document.getElementById('registerResult');
        if (data.success) {  

            //call API to get created entry/user id
            fetch('/getUserID', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData.get('uname'))
            })
            .then(response => response.json())
            .then(data => {
                sessionStorage.setItem("id", data);
                sessionStorage.setItem("username", formData.get("uname"));
            })
            .catch(error => {
                console.error('Error:', error);
            });

            resultP.innerText = 'Registered successful!';
            document.getElementById("username").innerText = formData.get('uname');
            document.getElementById("loginbutton").innerText = "Logout";
            closeLogin();
        } else {
            resultP.innerText = 'Username or Email is already used.';
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

//function called on loginForm submit click
function login() {
    //get input from login form
    const formData = new FormData(document.getElementById('loginForm'));
    const data = {
        uname: formData.get('uname'),
        psw: formData.get('psw')
    };

    //call API to check if user input matches a db entry
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        const resultP = document.getElementById('loginResult');
        if (data.success) {

            //call API to get created entry/user id
            fetch('/getUserID', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"uname" : formData.get('uname')})
            })
            .then(response => response.json())
            .then(data => {
                sessionStorage.setItem("id", data);
                sessionStorage.setItem("uname", formData.get("uname"));
            })
            .catch(error => {
                console.error('Error:', error);
            });

            resultP.innerText = 'Login successful!';
            document.getElementById("username").innerText = formData.get('uname');
            document.getElementById("loginbutton").innerText = "Logout";
            closeLogin();
        } else {
            resultP.innerText = 'Invalid username or password';
        }
    })
    .catch(error => {
      console.error('Error:', error);
    });
}