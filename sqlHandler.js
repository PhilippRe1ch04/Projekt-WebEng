function createSQLConnection(){
    var sqlcon = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "LbAN8YWQnwGFdCzRnJy0",
        database: "artgallery"
    });
      
    sqlcon.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    });
}

function query(){
    
}

