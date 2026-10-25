const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const isValid = require('./auth_users.js').isValid;
const users = require('./auth_users.js').users;

const public_users = express.Router();

// Register a user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  if (!isValid(username)) {
    return res.status(409).json({
      message: 'Username already exists'
    });
  }

  users.push({ username, password });

  return res.status(201).json({
    message: 'User registered successfully'
  });
});

// Internal catalogue endpoint for Axios requests
public_users.get('/catalog/data', (req, res) => {
  if (!books || Object.keys(books).length === 0) {
    return res.status(404).json({
      message: 'No books found'
    });
  }

  return res.status(200).json(books);
});

// Helper function: retrieve catalogue using Axios
const fetchBooks = async (req) => {
  const port = req.socket.localPort;
  const url =
    `http://127.0.0.1:${port}${req.baseUrl}/catalog/data`;

  const response = await axios.get(url, {
    timeout: 5000
  });

  return response.data;
};

// Helper function: handle Axios errors
const handleError = (res, error) => {
  const status = error.response?.status || 500;

  return res.status(status).json({
    message:
      error.response?.data?.message ||
      error.message ||
      'Internal server error'
  });
};

// Task 10: Get all books using Axios and async/await
public_users.get('/', async (req, res) => {
  try {
    const allBooks = await fetchBooks(req);

    // Handle missing or empty catalogue
    if (
      !allBooks ||
      Object.keys(allBooks).length === 0
    ) {
      return res.status(404).json({
        message: 'No books found'
      });
    }

    return res.status(200).json(allBooks);

  } catch (error) {
    return handleError(res, error);
  }
});

// Task 11: Get book details by ISBN using Axios
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const allBooks = await fetchBooks(req);
    const isbn = req.params.isbn;

    const book = allBooks[isbn];

    if (!book) {
      return res.status(404).json({
        message: 'Book not found for the given ISBN'
      });
    }

    return res.status(200).json(book);

  } catch (error) {
    return handleError(res, error);
  }
});

// Task 12: Get books by Author using Axios
public_users.get('/author/:author', async (req, res) => {
  try {
    const allBooks = await fetchBooks(req);

    const targetAuthor =
      req.params.author.trim().toLowerCase();

    const matchedBooks = Object.values(allBooks).filter(
      (book) =>
        book.author &&
        book.author.toLowerCase() === targetAuthor
    );

    if (matchedBooks.length === 0) {
      return res.status(404).json({
        message: 'No books found for this author'
      });
    }

    return res.status(200).json(matchedBooks);

  } catch (error) {
    return handleError(res, error);
  }
});

// Task 13: Get books by Title using Axios
public_users.get('/title/:title', async (req, res) => {
  try {
    const allBooks = await fetchBooks(req);

    const targetTitle =
      req.params.title.trim().toLowerCase();

    const matchedBooks = Object.values(allBooks).filter(
      (book) =>
        book.title &&
        book.title.toLowerCase().includes(targetTitle)
    );

    if (matchedBooks.length === 0) {
      return res.status(404).json({
        message: 'No books found for this title'
      });
    }

    return res.status(200).json(matchedBooks);

  } catch (error) {
    return handleError(res, error);
  }
});

// Get book reviews by ISBN
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
