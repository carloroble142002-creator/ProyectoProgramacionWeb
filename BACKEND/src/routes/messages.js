// messages.js
const express = require('express');
const router = express.Router();
const store = require('../storage/jsonStore');

const M = 'messages';
const U = 'users';

// GET /api/messages -> lista de mensajes (simple)
router.get('/', (req, res) => {
  const messages = store.read(M);
  res.json(messages);
});

// POST /api/messages -> enviar mensaje (espectador)
// body: { userId, userName, text }
router.post('/', (req, res) => {
  const { userId, userName, text } = req.body;
  if (!userId || !text) return res.status(400).json({ error: 'userId and text required' });
  const messages = store.read(M);
  const msg = { id: Date.now().toString(), userId, userName: userName || 'Anon', text, createdAt: new Date().toISOString() };
  messages.push(msg);
  store.write(M, messages);

  // sumar 1 punto al usuario
  const users = store.read(U);
  let user = users.find(u => u.id === userId);
  if (!user) {
    user = { id: userId, name: userName || 'Anon', points: 1, level: 1, totalHours: 0 };
    users.push(user);
  } else {
    user.points = (user.points || 0) + 1;
    // opcional: actualizar level por reglas (ejemplo simple)
    user.level = Math.floor(user.points / 10) + 1;
  }
  store.write(U, users);

  res.status(201).json({ message: msg, user });
});

module.exports = router;
