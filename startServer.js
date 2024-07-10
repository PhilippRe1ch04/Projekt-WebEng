//import dependencies
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

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

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Define routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Define routes
app.get('/classic', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'classic.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


/*=============================*/
//Handle Api requests

//checks if given username & password fits to db
app.post('/login', (req, res) => {
  const { uname, uemail, psw } = req.body;

  const query = 'SELECT * FROM user WHERE (username = ? OR email = ?) AND password = ?';
  connection.query(query, [uname, uemail, psw], (error, results) => {
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
  const query = 'INSERT INTO user (username, email, password) VALUES (?, ?, ?);';
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
  const query = 'SELECT id, href, title, date, likes FROM posts;';
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
  const {id} = req.body;
  const query = 'SELECT * FROM posts WHERE id = ? ;';
  connection.query(query, [id], (error, results) => {
    if (error) {
      console.error('Error fetching from database:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

//removes a  post by id 
app.post('/removePost', (req, res) => {
  const {id} = req.body;
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