// streamer.js
const express = require('express');
const router = express.Router();
const store = require('../storage/jsonStore');

const S = 'sessions';
const U = 'users';

// POST /api/streamer/session/start  body: { streamerId, streamerName }
router.post('/session/start', (req, res) => {
  const { streamerId, streamerName } = req.body;
  if (!streamerId) return res.status(400).json({ error: 'streamerId required' });
  const sessions = store.read(S);
  const session = { id: Date.now().toString(), streamerId, streamerName, startAt: new Date().toISOString(), endAt: null, durationHours: 0 };
  sessions.push(session);
  store.write(S, sessions);
  res.status(201).json(session);
});

// POST /api/streamer/session/stop  body: { sessionId }
router.post('/session/stop', (req, res) => {
  const { sessionId } = req.body;
  const sessions = store.read(S);
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return res.status(404).json({ error: 'session not found' });
  if (sessions[idx].endAt) return res.status(400).json({ error: 'already stopped' });
  const endAt = new Date();
  const startAt = new Date(sessions[idx].startAt);
  const durationMs = endAt - startAt;
  const durationHours = Number((durationMs / (1000 * 60 * 60)).toFixed(2));
  sessions[idx].endAt = endAt.toISOString();
  sessions[idx].durationHours = durationHours;
  store.write(S, sessions);

  // sumar horas al streamer en users
  const users = store.read(U);
  let user = users.find(u => u.id === sessions[idx].streamerId);
  if (!user) {
    user = { id: sessions[idx].streamerId, name: sessions[idx].streamerName || 'Streamer', points: 0, level: 1, totalHours: durationHours };
    users.push(user);
  } else {
    user.totalHours = (user.totalHours || 0) + durationHours;
  }
  store.write(U, users);

  res.json({ session: sessions[idx], user });
});

module.exports = router;
