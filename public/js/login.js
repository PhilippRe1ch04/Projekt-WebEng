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
            resultP.innerText = 'Registered successful!';
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
        uemail: formData.get('uemail'),
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
            resultP.innerText = 'Login successful!';
        } else {
            resultP.innerText = 'Invalid username or password';
        }
    })
    .catch(error => {
      console.error('Error:', error);
    });
}