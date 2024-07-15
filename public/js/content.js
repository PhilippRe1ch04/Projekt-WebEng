var commetCount = 0; 

function viewContent(postId){
    document.getElementById('contentPopUp').style.visibility = "visible";
    loadContent(postId);
}

//close content PopUp
function closeContent(){
    document.getElementById('contentPopUp').style.visibility = "hidden";
    try{
        getActiveScene().addListeners();
    }catch(e){
        //classic view
    }

    //reload favorites page to update liked posts
    if(location.href.endsWith("favorites")){
        location.reload();
    }
}

function loadContent(postId){
    //Api call --> get all information from post
    fetch('/getPost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"postId" : postId})
    })
    .then(response => response.json())
    .then(data => {
        //Api call --> update number of views
        fetch('/updatePostViews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"postId" : postId})
        })
        .catch(error => {
            console.error('Error:', error);
        });
        //set content of PopUp
        document.getElementById('image-holder').childNodes[1].src = data[0].href;
        document.getElementById('title').innerHTML = data[0].title;
        document.getElementById('artist').innerHTML = "@" + data[0].artist;
        document.getElementById('date').innerHTML = data[0].date;
        document.postId = postId;
    })
    .catch(error => {
        console.error('Error:', error);
    });

    if(sessionStorage.getItem("id") == null) return;
    //Api call --> get liked posts to check if current post is already liked
    fetch('/getLikedPosts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({userId : sessionStorage.getItem("id")})
    })
    .then(response => response.json())
    .then(data => {
        if(data[0].likedPosts.includes(postId)){
            document.getElementById("likebutton").innerText = "Dislike";
        }else{
            document.getElementById("likebutton").innerText = "Like";
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

//function to increment like counter of comment
function like(comment){
    var likeSpans = document.getElementById(comment).getElementsByTagName('span');
    var currLikes = likeSpans[0].innerText;
    likeSpans[0].innerText = parseInt(currLikes) + 1;
}

function likePostHandler(){
    if(sessionStorage.getItem("id") == null){
        viewLogin();
        return;
    }
    //Api call --> get liked posts to check if current post is already liked
    fetch('/getLikedPosts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"userId" : sessionStorage.getItem("id")})
    })
    .then(response => response.json())
    .then(data => {
        if(data[0].likedPosts.includes(document.postId)){
            dislikePost();
        }else{
            likePost();
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });

}

//function to like a post
function likePost(){
    var userId = sessionStorage.getItem("id");
    if(userId == null){
        viewLogin();
        return null;
    }
    
    var postId = document.postId;
    //call API to get created entry/user id
    fetch('/likePost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"userId" : userId, "postId" : postId})
    })
    .then(() =>{
        loadContent(postId);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
//function to dislike a Post
function dislikePost(){
    var postId = document.postId;
    var userId = sessionStorage.getItem("id");
    if(userId == null){
        viewLogin();
        return null;
    }
    
    //make API call to get all liked posts of user
    fetch('/getLikedPosts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"userId" : sessionStorage.getItem("id")})
    })
    .then(response => response.json())
    .then(data => {
        var index = JSON.parse(data[0].likedPosts).indexOf(postId);

        //API to remove post from liked list
        fetch('/dislikePost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"userId" : userId, "index" : index, "postId" : postId})
        })
        .then(() =>{
            loadContent(postId);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function comment(){
    commetCount += 1;
    var comment_holder = document.getElementById("comment-holder");
    var new_comment = document.createElement("div");
    new_comment.id = commetCount;
    new_comment.className = "comment";
    new_comment.innerHTML = `
    <p>`+ document.getElementById("comment-text").value +`</p>
    <button class="like-button" onclick='like(this.parentElement.id)'>Like</button>
    <span class="like-counter">0</span>`;
    document.getElementById("comment-text").value = "";
    comment_holder.appendChild(new_comment);

}

window.closeContent = closeContent;