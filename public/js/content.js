function like(comment){
    var likeSpans = document.getElementById(comment).getElementsByTagName('span');
    var currLikes = likeSpans[0].innerText;
    likeSpans[0].innerText = parseInt(currLikes) + 1;
}

function comment(){

}