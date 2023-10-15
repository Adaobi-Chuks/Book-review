const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  const _user = users.find((user) => user.username === username);

  return (_user && (_user.password === password));
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  
  if (authenticatedUser(userName, password)) {
    // You can create a JWT token for the user here and return it
    const token = jwt.sign({ userName }, 'fingerprint_customer');
    return res.status(200).json({ message: "Login successful", token });
  } else {
    return res.status(401).json({ message: "Login failed" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.user; 

  if (!review) {
    return res.status(400).json({ message: "Review content is required" });
  }

  if (books[isbn]) {
    // Update or add the review in the books object
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added/modified successfully" });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user;
  if (books[isbn] && books[isbn].reviews && books[isbn].reviews[username]) {
    // Check if the user is allowed to delete the review
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: 'Review deleted successfully' });
  } else {
    return res.status(404).json({ message: 'Review not found or you do not have permission to delete it' });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
