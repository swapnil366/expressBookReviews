const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');

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

// Task 10: Get all books in the local catalogue using async/await and a Promise
public_users.get('/', async (req, res) => {
  try {
    const getBooksList = new Promise((resolve, reject) => {
      resolve(books);
    });

    const allBooks = await getBooksList;
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving book list' });
  }
});

// Task 11: Get book details by ISBN using async/await and a Promise
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;

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
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

// Task 12: Get books by author using async/await and strict local filtering
public_users.get('/author/:author', async (req, res) => {
  const targetAuthor = req.params.author.toLowerCase();

  try {
    const getBooksByAuthor = new Promise((resolve, reject) => {
      let matchedBooks = [];
      const keys = Object.keys(books);

      keys.forEach((key) => {
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
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

// Task 13: Get books by title using async/await and strict local filtering
public_users.get('/title/:title', async (req, res) => {
  const targetTitle = req.params.title.toLowerCase();

  try {
    const getBooksByTitle = new Promise((resolve, reject) => {
      let matchedBooks = [];
      const keys = Object.keys(books);

      keys.forEach((key) => {
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
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
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
