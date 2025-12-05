const API_BASE = 'http://localhost:3000/api';

async function request(path: string, method = 'GET', body?: any) {
  const opts: any = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return await res.json();
}

export const GiftsAPI = {
  list: () => request('/gifts'),
  create: (data: any) => request('/gifts', 'POST', data),
  update: (id: string, data: any) => request(`/gifts/${id}`, 'PUT', data),
  delete: (id: string) => request(`/gifts/${id}`, 'DELETE'),
};

export const MessagesAPI = {
  list: () => request('/messages'),
  send: (data: any) => request('/messages', 'POST', data),
};

export const StreamerAPI = {
  startSession: (data: any) => request('/streamer/session/start', 'POST', data),
  stopSession: (data: any) => request('/streamer/session/stop', 'POST', data),
};

export const UsersAPI = {
  list: () => request('/users'),
};
