var tbody = document.getElementById("tablebody");
if(sessionStorage.getItem("uname") != "admin") window.location.href = "/";

//add evenetListener on submit click of loginForm
document.getElementById('uploadPost').addEventListener('submit', function(event) {
    event.preventDefault();
    uploadPost();
});

//function to get all Posts from db (all db posts entries)
function getPosts() {
    return fetch('/getPosts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }else{
            return response.json();
        }
        
    })
    .then(data => {
        return data; // Return the fetched data
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        throw error; // Rethrow the error to propagate it further
    });
}

//function called to add posts to table in html file
//create for each db entry one row in table
function viewPosts(){
    //calls getPost function which returns all db post entries
    getPosts().then(posts => {
        if(posts){
            //create for each post a html row
            posts.forEach((post) => {
                var item = document.createElement("tr");
                item.innerHTML = 
                `<td class="id"> `+ post.id + `</td>
                <td><img class="preview" src="` + post.href + `" alt="preview"></td>
                <td>` + post.title + `</td>
                <td>`+ post.date + `</td>
                <td>`+ post.views + `</td>
                <td>` + post.likes + `</td>    
                <td>
                    <button>
                        <img width="25px" height="25px"  onclick="deletePost(this)" src="src/delete-button.png">
                    </button>
                    <button>
                        <img width="25px" height="25px" src="src/edit-button.png">
                    </button>
                </td>`;
                tbody.appendChild(item);
            });
        }else{ //if database is empty
            var text = document.createElement("p");
            text.innerText = "Aktuell gibt es keine Posts. Bitte füge zuerst einen hinzu.";
            tbody.parentNode.parentNode.append(text);
        }
        
    })
    .catch(error => {
        // Handle errors from fetch or JSON parsing
        console.error('Error fetching posts:', error);
    });
}

//function called to delete a Post entrie
function deletePost(e){
    let id = e.parentNode.parentNode.parentNode.childNodes[0].innerHTML; //get ID from Table

    //call API to remove db entry by id
    fetch('/removePost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: id })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("removed post successfully");
            location.reload();
        } else {
            alert("an error occurred");
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

//function to add new Post to database
function uploadPost() {
    const formData = new FormData(document.getElementById('uploadPost'));

    fetch('/uploadPostImage', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if(response.status == 200){
            closeAddPost();
            location.reload();
        }
    })
    .catch(error => {
        console.error('Fehler beim Hochladen der Bilddatei', error);
    });
}

function viewAddPost(){
    document.getElementById("addPostHolder").style.visibility = "visible";
}

function closeAddPost(){
    document.getElementById("addPostHolder").style.visibility = "hidden";
}
/*================*/
//on page load
viewPosts();

