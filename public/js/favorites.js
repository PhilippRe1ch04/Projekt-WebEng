var content = document.getElementById("classicContent");

function loadPost(id){
    var post = document.createElement('div');

    //call API to get random Post id
    fetch('/getPost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"postId": id})
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


var userId = sessionStorage.getItem("id");
if (userId != null){
    //API to get all data of post
    fetch('/getlikedPosts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"userId" : userId})
    })
    .then(response => response.json())
    .then(data =>{
        if(JSON.parse(data[0].likedPosts).length != 0){
            JSON.parse(data[0].likedPosts).forEach(postId => {
                loadPost(postId);
            });;
        }else{
            content.innerHTML ="<p>You have no favorite Posts yet. Please like some posts first.</p>";
        }
        
    })
    .catch(error => {
        console.error('Error:', error);
    });
}else{
    viewLogin();
}
