// Chat.tsx
import React, { useEffect, useState } from 'react';
import { MessagesAPI, UsersAPI } from '../utils/api';

export default function Chat({ currentUserId, currentUserName }:{
  currentUserId: string, currentUserName?: string
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  useEffect(()=>{ load(); loadUsers(); }, []);

  async function load() {
    const data = await MessagesAPI.list();
    setMessages(data);
  }
  async function loadUsers() {
    const data = await UsersAPI.list();
    setUsers(data);
  }

  async function send() {
    if (!text) return;
    await MessagesAPI.send({ userId: currentUserId, userName: currentUserName, text });
    setText('');
    await load();
    await loadUsers();
  }

  function getLevel(userId: string) {
    const u = users.find(x => x.id === userId);
    return u ? u.level : 1;
  }

  return (
    <div>
      <h3>Chat</h3>
      <div style={{ maxHeight: 300, overflow: 'auto', border: '1px solid #ccc' }}>
        {messages.map(m => (
          <div key={m.id}>
            <strong>{m.userName} (Lv {getLevel(m.userId)})</strong>: {m.text}
          </div>
        ))}
      </div>
      <div>
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Escribe..." />
        <button onClick={send}>Enviar</button>
      </div>
    </div>
  );
}
