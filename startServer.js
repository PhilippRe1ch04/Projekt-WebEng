//import dependencies
const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const fs = require('fs');

//init express app
const app = express();

//listen on port 3000
const PORT = process.env.PORT || 3000;

// MySQL connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'LbAN8YWQnwGFdCzRnJy0',
  database: 'artgallery'
};

// Connect to the database
const connection = mysql.createConnection(dbConfig);
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database');
});


app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Define routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Define routes
app.get('/classic', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'classic.html'));
});

app.get('/favorites', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favorites.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/addPost', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'addPost.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


/*=============================*/
//Handle Api requests

//checks if given username & password fits to db
app.post('/login', (req, res) => {
  const { uname, psw } = req.body;

  const query = 'SELECT * FROM user WHERE (username = ? OR email = ?) AND password = ?';
  connection.query(query, [uname, uname, psw], (error, results) => {
    if (error) {
      console.error('Error checking value in database:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  });
});

//register new user (create new entry in db)
app.post('/register', (req, res) => {
  const { uname, uemail, psw } = req.body;
  const query = 'INSERT INTO user (username, email, password, likedPosts) VALUES (?, ?, ?, "[]");';
  connection.query(query, [uname, uemail, psw], (error, results) => {
    if (error) {
      console.error('Error checking value in database:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.affectedRows > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  });
});

//returns all posts
app.post('/getPosts', (req, res) => {
  const query = 'SELECT * FROM posts;';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching from database:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

//return random post (for hallway scene --> show user posts in random order (duplicates could occure))
app.post('/getRandomPost', (req, res) => {
  const query = 'SELECT id, href FROM posts ORDER BY RAND() LIMIT 1;';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching from database:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

//returns all data of a post (requires id of  searched post)
app.post('/getPost', (req, res) => {
  const {postId} = req.body;
  const query = 'SELECT * FROM posts WHERE id = ? ;';
  connection.query(query, [postId], (error, results) => {
    if (error) {
      console.error('Error fetching from database:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

//increments number of views of post
app.post('/updatePostViews', (req, res) => {
  const {postId} = req.body;
  const query = 'UPDATE posts SET views = views + 1 WHERE id = ?;';
  connection.query(query, [postId], (error, results) => {
    if (error) {
      console.error('Error fetching from database:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});


//add post to liked list of user
app.post('/likePost', (req, res) => {
  const {userId, postId} = req.body;
  const query1 = `UPDATE user SET likedPosts = JSON_ARRAY_APPEND(likedPosts, '$', ?) WHERE id = ?;`;
  const query2 = `UPDATE posts SET likes = likes + 1 WHERE id = ?;`;
  connection.query(query1, [postId, userId], (error, results ) => {
    if (error) {
      console.error('Error executing query1:', error);
    } else {
      connection.query(query2, [postId], (error) => {
        if (error) {
          console.error('Error executing query2:', error);
        }
      });
    }
    res.json(results);
  });
});

//remove post from liked list of user
app.post('/dislikePost', (req, res) => {
  const {userId , index, postId} = req.body;
  
  const query1 = `UPDATE user SET likedPosts = JSON_REMOVE(likedPosts, '$[?]') WHERE id = ?;`;
  const query2 = ` UPDATE posts SET likes = likes - 1 WHERE id = ?;`;
  connection.query(query1, [index, userId], (error, results) => {
    if (error) {
      console.error('Error executing query1:', error);
    } else {
      console.log('Results query1:', results);
      connection.query(query2, [postId], (error, results) => {
        if (error) {
          console.error('Error executing query2:', error);
        } else {
          console.log('Results query2:', results);
        }
      });
    }
    res.json(results);
  });
});

//returns all liked Posts from user
app.post('/getLikedPosts', (req, res) => {
  const {userId} = req.body;
  const query = "SELECT likedPosts From user WHERE id = ?;";
  connection.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error fetching from database:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

//returns userId of user
app.post('/getUserID', (req, res) => {
  const {uname} = req.body;
  const query = 'SELECT id FROM user WHERE username = ?;';
  connection.query(query, [uname], (error, results) => {
    if (error) {
      console.error('Error fetching from database:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results[0].id);
  });
});


//removes a  post by id 
app.post('/removePost', (req, res) => {
  const {id} = req.body;

  const query = 'SELECT href FROM posts WHERE id = ?;';
    connection.query(query, [id], (error, results) => {
      if (error) {
        console.error('Error removing post from database:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      
      const filePath = path.join(__dirname, 'public', results[0].href);
      fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
    
        const query = 'DELETE FROM posts WHERE id = ?;';
        connection.query(query, [id], (error, results) => {
          if (error) {
            console.error('Error removing post from database:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
          }
          if (results.affectedRows > 0) {
            res.json({ success: true });
          } else {
            res.json({ success: false });
          }
        });
      });

    });
});

//uploads an Image to the server
app.post('/uploadPostImage', (req, res) => {
  const image = req.files.image;
  const title = req.body.title;
  const artist = req.body.artist;
  const comment = req.body.comment;

  let currentDate = new Date();
  let year = currentDate.getFullYear();
  let month = currentDate.getMonth() + 1; // starts with 0 (january)
  let day = currentDate.getDate();
  let hours = currentDate.getHours();
  let minutes = currentDate.getMinutes();
  let seconds = currentDate.getSeconds();

  //two digits
  if (month < 10) month = '0' + month;
  if (day < 10) day = '0' + day;
  if (hours < 10) hours = '0' + hours;
  if (minutes < 10) minutes = '0' + minutes;
  if (seconds < 10) seconds = '0' + seconds;

  // Concatenate date and time components into a single string
  let currentDateTimeString = '' + year + month + day + hours + minutes + seconds;

  // Move the uploaded image to server directory
  const dir = '/posts/' + currentDateTimeString + image.name;
  image.mv(__dirname + "/public" +dir, (err) => {
    if (err) {
        console.error(err);
        return res.status(500).send(err);
    }

    const query = 'INSERT INTO posts (`title`, `artist`, `href`, `description`) VALUES (?, ?, ?, ?);';
    connection.query(query, [title, artist, dir, comment], (error, results) => {
      if (error) {
        console.error('Error removing post from database:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (results.affectedRows > 0) {
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    });
  });
});