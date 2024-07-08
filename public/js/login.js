document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    login();
});

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    register();
});

function changeMethod(){
    let firsts = document.getElementsByClassName("first");
    if(firsts[0].classList.contains("active")){
        firsts[0].classList.remove("active");
        firsts[1].classList.add("active");
    }else{
        firsts[1].classList.remove("active");
        firsts[0].classList.add("active");
    }
}

function register(){
    const formData = new FormData(document.getElementById('registerForm'));
    const data = {
        uname: formData.get('uname'),
        uemail: formData.get('uemail'),
        psw: formData.get('psw')
    };

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


function login() {
    const formData = new FormData(document.getElementById('loginForm'));
    const data = {
        uname: formData.get('uname'),
        psw: formData.get('psw')
    };

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