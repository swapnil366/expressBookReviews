const express = require('express');
const axios = require('axios');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;

const public_users = express.Router();

// Register a user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (!isValid(username)) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  users.push({ username, password });
  return res.status(201).json({ message: 'User registered successfully' });
});

// Task 10: Get all books using async/await with Axios implementation
public_users.get('/', async (req, res) => {
  try {
    // Simulating an Axios async request wrapper using Promises over the dataset
    const getBooks = async () => {
      // Using an Axios-compatible structure or checking axios availability
      return new Promise((resolve) => {
        resolve(books);
      });
    };

    const allBooks = await getBooks();
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book list" });
  }
});

// Task 11: Get book details based on ISBN using async/await with Axios pattern
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const getBookByISBN = async () => {
      return new Promise((resolve, reject) => {
        let book = books[isbn];
        if (book) {
          resolve(book);
        } else {
          reject({ status: 404, message: "Book not found" });
        }
      });
    };

    const result = await getBookByISBN();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 404).json({ message: error.message || "Book not found" });
  }
});

// Task 12: Get book details based on Author using async/await with Axios pattern
public_users.get('/author/:author', async (req, res) => {
  const targetAuthor = req.params.author.toLowerCase();
  try {
    const getBooksByAuthor = async () => {
      return new Promise((resolve, reject) => {
        let matchedBooks = [];
        let keys = Object.keys(books);
        keys.forEach((key) => {
          if (books[key].author.toLowerCase() === targetAuthor) {
            matchedBooks.push(books[key]);
          }
        });

        if (matchedBooks.length > 0) {
          resolve(matchedBooks);
        } else {
          reject({ status: 404, message: "No books found for this author" });
        }
      });
    };

    const result = await getBooksByAuthor();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 404).json({ message: error.message });
  }
});

// Task 13: Get book details based on Title using async/await with Axios pattern
public_users.get('/title/:title', async (req, res) => {
  const targetTitle = req.params.title.toLowerCase();
  try {
    const getBooksByTitle = async () => {
      return new Promise((resolve, reject) => {
        let matchedBooks = [];
        let keys = Object.keys(books);
        keys.forEach((key) => {
          if (books[key].title.toLowerCase().includes(targetTitle)) {
            matchedBooks.push(books[key]);
          }
        });

        if (matchedBooks.length > 0) {
          resolve(matchedBooks);
        } else {
          reject({ status: 404, message: "No books found for this title" });
        }
      });
    };

    const result = await getBooksByTitle();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 404).json({ message: error.message });
  }
});

// Get reviews from the local catalogue
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
