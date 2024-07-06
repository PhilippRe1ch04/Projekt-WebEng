function closeContent(){
    document.getElementById('content').style.visibility = 'hidden';
    activeScene.addEventListeners();
}

function like(comment){
    var likeSpans = document.getElementById(comment).getElementsByTagName('span');
    console.log(likeSpans[0]);
    var currLikes = likeSpans[0].innerText;
    likeSpans[0].innerText = parseInt(currLikes) + 1;
}

function comment(){

}