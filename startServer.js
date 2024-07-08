const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

// MySQL connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'LbAN8YWQnwGFdCzRnJy0',
  database: 'artgallery'
};

const connection = mysql.createConnection(dbConfig);

// Connect to the database
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

// Define your routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

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