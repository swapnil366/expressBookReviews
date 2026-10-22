
const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');

const public_users = express.Router();

const OPEN_LIBRARY_API = 'https://openlibrary.org/search.json';

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

// Get all books in the local catalogue
public_users.get('/', (req, res) => {
  return res.status(200).json(books);
});

// Get book details by ISBN using Axios and async/await
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const response = await axios.get(OPEN_LIBRARY_API, {
      params: { isbn, fields: 'key,title,author_name,isbn,first_publish_year' },
      timeout: 10000
    });

    const results = response.data.docs || [];

    if (results.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(results);
  } catch (error) {
    return res.status(502).json({
      message: 'Unable to retrieve book details by ISBN'
    });
  }
});

// Get books by author using Axios and async/await
public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author;
    const response = await axios.get(OPEN_LIBRARY_API, {
      params: {
        author,
        fields: 'key,title,author_name,isbn,first_publish_year',
        limit: 100
      },
      timeout: 10000
    });

    const results = response.data.docs || [];

    if (results.length === 0) {
      return res.status(404).json({ message: 'No books found for this author' });
    }

    return res.status(200).json(results);
  } catch (error) {
    return res.status(502).json({
      message: 'Unable to retrieve books by author'
    });
  }
});

// Get books by title using Axios and async/await
public_users.get('/title/:title', async (req, res) => {
  try {
    const title = req.params.title;
    const response = await axios.get(OPEN_LIBRARY_API, {
      params: {
        title,
        fields: 'key,title,author_name,isbn,first_publish_year',
        limit: 100
      },
      timeout: 10000
    });

    const results = response.data.docs || [];

    if (results.length === 0) {
      return res.status(404).json({ message: 'No books found for this title' });
    }

    return res.status(200).json(results);
  } catch (error) {
    return res.status(502).json({
      message: 'Unable to retrieve books by title'
    });
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
