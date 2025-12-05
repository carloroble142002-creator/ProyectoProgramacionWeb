// gifts.js
const express = require('express');
const router = express.Router();
const store = require('../storage/jsonStore');

const NAME = 'gifts';

// GET /api/gifts  -> lista de regalos
router.get('/', (req, res) => {
  const gifts = store.read(NAME);
  res.json(gifts);
});

// POST /api/gifts -> crear regalo (streamer)
router.post('/', (req, res) => {
  const { name, cost, points } = req.body;
  if (!name || cost == null || points == null) return res.status(400).json({ error: 'name, cost, points required' });
  const gifts = store.read(NAME);
  const id = Date.now().toString();
  const gift = { id, name, cost: Number(cost), points: Number(points) };
  gifts.push(gift);
  store.write(NAME, gifts);
  res.status(201).json(gift);
});

// PUT /api/gifts/:id -> editar
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const gifts = store.read(NAME);
  const idx = gifts.findIndex(g => g.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  const { name, cost, points } = req.body;
  if (name) gifts[idx].name = name;
  if (cost != null) gifts[idx].cost = Number(cost);
  if (points != null) gifts[idx].points = Number(points);
  store.write(NAME, gifts);
  res.json(gifts[idx]);
});

// DELETE /api/gifts/:id -> eliminar
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  let gifts = store.read(NAME);
  const before = gifts.length;
  gifts = gifts.filter(g => g.id !== id);
  store.write(NAME, gifts);
  res.json({ deleted: before - gifts.length });
});

module.exports = router;
