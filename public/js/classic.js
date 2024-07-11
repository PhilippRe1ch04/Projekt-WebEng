var content = document.getElementById("classicContent");
document.addEventListener('scroll', scrolled);

function loadPost(){
    var post = document.createElement('div');

    //call API to get random Post id
    fetch('/getRandomPost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        //API to get all data of post
        fetch('/getPost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"postId" : data[0].id})
        })
        .then(response => response.json())
        .then(data =>{
            post.innerHTML = "<img src="+  data[0].href +" alt=" + data[0].title + " >";
            post.onclick = () => {
                viewContent(data[0].id);
            };
            content.appendChild(post);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
    
}

function scrolled() {
    if(window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        for (let i = 0; i < 3; i++) {
            loadPost();
        }
    }
    
}

for (let i = 0; i < 30; i++) {
    loadPost();
}