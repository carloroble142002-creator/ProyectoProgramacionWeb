import React, { useState } from 'react';
import { StreamerAPI } from '../utils/api';

export default function StreamerDashboard({ streamerId, streamerName }:{
  streamerId: string, streamerName?: string
}) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState('stopped');

  async function start() {
    const res = await StreamerAPI.startSession({ streamerId, streamerName });
    setSessionId(res.id);
    setStatus('live');
  }

  async function stop() {
    if (!sessionId) return;
    const res = await StreamerAPI.stopSession({ sessionId });
    setStatus('stopped');
    setSessionId(null);
    alert(`Session stopped. Duration: ${res.session.durationHours} hours. Total hours: ${res.user.totalHours}`);
  }

  return (
    <div>
      <h3>Streamer Dashboard</h3>
      <div>Status: {status}</div>
      {status === 'stopped' ? <button onClick={start}>Start Stream</button> : <button onClick={stop}>Stop Stream</button>}
    </div>
  );
}
