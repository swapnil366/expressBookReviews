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

// Task 10: Get all books using async/await with proper status handling
public_users.get('/', async (req, res) => {
  try {
    const fetchBooks = async () => {
      if (!books) {
        throw { status: 404, message: 'Books catalog not found' };
      }
      return books;
    };

    const allBooks = await fetchBooks();
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
});

// Task 11: Get book details based on ISBN using async/await with strict validation
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const fetchBookByISBN = async () => {
      const book = books[isbn];
      if (!book) {
        throw { status: 404, message: `Book with ISBN ${isbn} not found` };
      }
      return book;
    };

    const result = await fetchBookByISBN();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 404).json({ message: error.message || 'Book not found' });
  }
});

// Task 12: Get book details based on Author using async/await and explicit filtering
public_users.get('/author/:author', async (req, res) => {
  const targetAuthor = req.params.author.toLowerCase();
  try {
    const fetchBooksByAuthor = async () => {
      let matchedBooks = [];
      Object.keys(books).forEach((key) => {
        if (books[key].author.toLowerCase() === targetAuthor) {
          matchedBooks.push(books[key]);
        }
      });

      if (matchedBooks.length === 0) {
        throw { status: 404, message: `No books found for author: ${req.params.author}` };
      }
      return matchedBooks;
    };

    const result = await fetchBooksByAuthor();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 404).json({ message: error.message });
  }
});

// Task 13: Get book details based on Title using async/await and explicit filtering
public_users.get('/title/:title', async (req, res) => {
  const targetTitle = req.params.title.toLowerCase();
  try {
    const fetchBooksByTitle = async () => {
      let matchedBooks = [];
      Object.keys(books).forEach((key) => {
        if (books[key].title.toLowerCase().includes(targetTitle)) {
          matchedBooks.push(books[key]);
        }
      });

      if (matchedBooks.length === 0) {
        throw { status: 404, message: `No books found with title: ${req.params.title}` };
      }
      return matchedBooks;
    };

    const result = await fetchBooksByTitle();
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
