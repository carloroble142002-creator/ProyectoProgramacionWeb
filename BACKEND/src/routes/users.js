// users.js
const express = require('express');
const router = express.Router();
const store = require('../storage/jsonStore');
const U = 'users';

router.get('/', (req, res) => {
  const users = store.read(U);
  res.json(users);
});

module.exports = router;
