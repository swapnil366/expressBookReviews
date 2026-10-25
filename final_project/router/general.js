const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const auth = require('./auth_users.js');

const public_users = express.Router();

// Register a new user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body || {};

  if (
    typeof username !== 'string' ||
    !username.trim() ||
    typeof password !== 'string' ||
    !password
  ) {
    return res.status(400).json({
      message: 'Valid username and password are required'
    });
  }

  if (auth.users.some(user => user.username === username)) {
    return res.status(409).json({
      message: 'Username already exists'
    });
  }

  auth.users.push({ username, password });

  return res.status(201).json({
    message: 'User registered successfully'
  });
});

// Internal endpoint for Axios book retrieval
public_users.get('/catalog/data', (req, res) => {
  if (
    !books ||
    typeof books !== 'object' ||
    Array.isArray(books) ||
    Object.keys(books).length === 0
  ) {
    return res.status(404).json({
      message: 'No books found'
    });
  }

  return res.status(200).json(books);
});

// Fetch books using Axios and async/await
const fetchBooks = async (req) => {
  const port = req.socket.localPort;
  const baseUrl = req.baseUrl;

  const response = await axios.get(
    `http://127.0.0.1:${port}${baseUrl}/catalog/data`,
    { timeout: 5000 }
  );

  return response.data;
};

// Handle Axios errors
const handleError = (res, error) => {
  if (error.response?.status === 404) {
    return res.status(404).json({
      message: 'No books found'
    });
  }

  return res.status(500).json({
    message: 'Error retrieving book details',
    error: error.message
  });
};

// Task 10: Get all books using Axios
public_users.get('/', async (req, res) => {
  try {
    const allBooks = await fetchBooks(req);

    if (
      !allBooks ||
      typeof allBooks !== 'object' ||
      Array.isArray(allBooks) ||
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

// Task 11: Get book by ISBN using Axios
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const allBooks = await fetchBooks(req);

    const book = allBooks[isbn];

    if (!book) {
      return res.status(404).json({
        message: 'Book not found for this ISBN'
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
    const author = req.params.author;

    if (
      typeof author !== 'string' ||
      !author.trim()
    ) {
      return res.status(400).json({
        message: 'Valid author name is required'
      });
    }

    const allBooks = await fetchBooks(req);

    if (
      !allBooks ||
      typeof allBooks !== 'object' ||
      Array.isArray(allBooks) ||
      Object.keys(allBooks).length === 0
    ) {
      return res.status(404).json({
        message: 'No books found'
      });
    }

    const targetAuthor = author.trim().toLowerCase();

    const matchedBooks = Object.values(allBooks).filter(
      book => {
        if (
          !book ||
          typeof book !== 'object' ||
          typeof book.author !== 'string'
        ) {
          return false;
        }

        return (
          book.author.trim().toLowerCase() ===
          targetAuthor
        );
      }
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
    const title = req.params.title;

    if (
      typeof title !== 'string' ||
      !title.trim()
    ) {
      return res.status(400).json({
        message: 'Valid book title is required'
      });
    }

    const allBooks = await fetchBooks(req);

    const targetTitle = title.trim().toLowerCase();

    const matchedBooks = Object.values(allBooks).filter(
      book => {
        if (
          !book ||
          typeof book !== 'object' ||
          typeof book.title !== 'string'
        ) {
          return false;
        }

        return book.title
          .trim()
          .toLowerCase()
          .includes(targetTitle);
      }
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
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  return res.status(200).json(book.reviews || {});
});

module.exports.general = public_users;
