const express = require("express");
const axios = require("axios");
const books = require("./booksdb.js");
const public_users = express.Router();

// Internal endpoint for Axios requests
public_users.get("/catalog/data", (req, res) => {
  return res.status(200).json(books);
});

// Task 10: Get all books using Axios
public_users.get("/", async (req, res) => {
  try {
    const url = `${req.protocol}://${req.get("host")}${req.baseUrl}/catalog/data`;
    const response = await axios.get(url);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Task 11: Get book by ISBN using Axios
public_users.get("/isbn/:isbn", async (req, res) => {
  try {
    const url = `${req.protocol}://${req.get("host")}${req.baseUrl}/catalog/data`;
    const response = await axios.get(url);
    const book = response.data[req.params.isbn];

    if (book) return res.status(200).json(book);

    return res.status(404).json({
      message: "Book not found"
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Task 12: Get books by author using Axios
public_users.get("/author/:author", async (req, res) => {
  try {
    const url = `${req.protocol}://${req.get("host")}${req.baseUrl}/catalog/data`;
    const response = await axios.get(url);

    const result = Object.values(response.data).filter(
      book => book.author.toLowerCase() ===
        req.params.author.toLowerCase()
    );

    if (result.length > 0) {
      return res.status(200).json(result);
    }

    return res.status(404).json({
      message: "No books found for this author"
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Task 13: Get books by title using Axios
public_users.get("/title/:title", async (req, res) => {
  try {
    const url = `${req.protocol}://${req.get("host")}${req.baseUrl}/catalog/data`;
    const response = await axios.get(url);

    const result = Object.values(response.data).filter(
      book => book.title.toLowerCase() ===
        req.params.title.toLowerCase()
    );

    if (result.length > 0) {
      return res.status(200).json(result);
    }

    return res.status(404).json({
      message: "No books found with this title"
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get book review
public_users.get("/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
