var tbody = document.getElementById("tablebody");

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
        console.log(data);
        return data; // Return the fetched data
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        throw error; // Rethrow the error to propagate it further
    });
}


function viewPosts(){
    getPosts().then(posts => {
        if(posts){
            posts.forEach((post) => {
                var item = document.createElement("tr");
                item.innerHTML = 
                `<td class="id"> `+ post.id + `</td>
                <td><img class="preview" src="` + post.href + `" alt="preview"></td>
                <td>` + post.title + `</td>
                <td>`+ post.date + `</td>
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
        }else{
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

function deletePost(e){
    let id = e.parentNode.parentNode.parentNode.childNodes[0].innerHTML; 

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

viewPosts();

