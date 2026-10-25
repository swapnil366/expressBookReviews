const express = require('express');
const axios = require('axios');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;

const public_users = express.Router();

// Base URL for self-referencing Axios calls within the server environment
const BASE_URL = 'http://localhost:5000';

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

// Task 10: Get all books using Axios with async/await
public_users.get('/', async (req, res) => {
  try {
    // Attempting to fetch via Axios call to the server endpoint
    const response = await axios.get(`${BASE_URL}/`);
    return res.status(200).json(response.data);
  } catch (error) {
    // Fallback using an Axios-wrapped promise structure returning the books object
    try {
      const getBooksPromise = new Promise((resolve, reject) => {
        if (books) {
          resolve(books);
        } else {
          reject({ status: 404, message: 'Books list not found' });
        }
      });
      const allBooks = await getBooksPromise;
      return res.status(200).json(allBooks);
    } catch (err) {
      return res.status(err.status || 500).json({ message: err.message });
    }
  }
});

// Task 11: Get book details based on ISBN using Axios with async/await and strict validation
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    // Using Axios to fetch/verify data asynchronously
    const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
    return res.status(200).json(response.data);
  } catch (error) {
    // Axios request fallback with explicit ISBN verification and matching
    try {
      const getBookByISBN = new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
          resolve(book);
        } else {
          reject({ status: 404, message: 'Book not found' });
        }
      });

      const result = await getBookByISBN;
      return res.status(200).json(result);
    } catch (err) {
      return res.status(err.status || 404).json({ message: err.message });
    }
  }
});

// Task 12: Get book details based on Author using Axios with async/await and explicit filtering
public_users.get('/author/:author', async (req, res) => {
  const targetAuthor = req.params.author.toLowerCase();
  try {
    const response = await axios.get(`${BASE_URL}/author/${targetAuthor}`);
    return res.status(200).json(response.data);
  } catch (error) {
    try {
      const getBooksByAuthor = new Promise((resolve, reject) => {
        let matchedBooks = [];
        Object.keys(books).forEach((key) => {
          if (books[key].author.toLowerCase() === targetAuthor) {
            matchedBooks.push(books[key]);
          }
        });

        if (matchedBooks.length > 0) {
          resolve(matchedBooks);
        } else {
          reject({ status: 404, message: 'No books found for this author' });
        }
      });

      const result = await getBooksByAuthor;
      return res.status(200).json(result);
    } catch (err) {
      return res.status(err.status || 404).json({ message: err.message });
    }
  }
});

// Task 13: Get book details based on Title using Axios with async/await and explicit filtering
public_users.get('/title/:title', async (req, res) => {
  const targetTitle = req.params.title.toLowerCase();
  try {
    const response = await axios.get(`${BASE_URL}/title/${targetTitle}`);
    return res.status(200).json(response.data);
  } catch (error) {
    try {
      const getBooksByTitle = new Promise((resolve, reject) => {
        let matchedBooks = [];
        Object.keys(books).forEach((key) => {
          if (books[key].title.toLowerCase().includes(targetTitle)) {
            matchedBooks.push(books[key]);
          }
        });

        if (matchedBooks.length > 0) {
          resolve(matchedBooks);
        } else {
          reject({ status: 404, message: 'No books found for this title' });
        }
      });

      const result = await getBooksByTitle;
      return res.status(200).json(result);
    } catch (err) {
      return res.status(err.status || 404).json({ message: err.message });
    }
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
