// GiftsList.tsx
import React, { useEffect, useState } from 'react';
import { GiftsAPI } from '../utils/api';

type Gift = { id: string, name: string, cost: number, points: number };

export default function GiftList() {
  const [gifts, setGift] = useState<Gift[]>([]);
  const [name, setName] = useState('');
  const [cost, setCost] = useState(0);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await GiftsAPI.list();
    setGift(data);
  }

  async function create() {
    await GiftsAPI.create({ name, cost, points });
    setName(''); setCost(0); setPoints(0);
    load();
  }

  async function remove(id: string) {
    await GiftsAPI.delete(id);
    load();
  }

  async function edit(g: Gift) {
    const newName = prompt('Nombre', g.name) || g.name;
    const newCost = Number(prompt('Cost', String(g.cost)) || g.cost);
    const newPoints = Number(prompt('Points', String(g.points)) || g.points);
    await GiftsAPI.update(g.id, { name: newName, cost: newCost, points: newPoints });
    load();
  }

  async function sendGift(g: Gift) {
    alert(`Enviando el regalo: ${g.name} 🎁`);

    // Si quieres conectarlo al backend, solo actívalo:
    // await GiftsAPI.send(g.id);

    // Por ahora no modificamos puntos para evitar errores
  }

  return (
    <div>
      <h3>Gifts</h3>
      <div>
        <input
          placeholder="name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          type="number"
          value={cost}
          onChange={e => setCost(Number(e.target.value))}
        />
        <input
          type="number"
          value={points}
          onChange={e => setPoints(Number(e.target.value))}
        />
        <button onClick={create}>Create</button>
      </div>

      <ul>
        {gifts.map(g => (
          <li key={g.id}>
            <b>{g.name}</b> — cost: {g.cost} — points: {g.points}

            <button onClick={() => edit(g)}>Edit</button>
            <button onClick={() => remove(g.id)}>Delete</button>

            {/* ⭐ NUEVO BOTÓN — ENVIAR REGALO ⭐ */}
            <button onClick={() => sendGift(g)}>
              Enviar regalo 🎁
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
