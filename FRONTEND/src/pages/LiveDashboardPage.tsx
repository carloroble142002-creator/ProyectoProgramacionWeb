import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveUser, updateUser } from '../utils/storage';
import { getStreamerLevelInfo } from '../utils/leveling';
// import { useNotification } from '../context/NotificationContext';
import Chat from '../components/Chat';
import GiftModal from '../components/GiftModal';
import './LiveDashboardPage.css';
import { streamHeartbeat, endStream, createStream, getUser } from '../utils/api';

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

export default function LiveDashboardPage() {
  const navigate = useNavigate();
  // const { showNotification } = useNotification();
  const [user, setUser] = useState(getActiveUser());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sid, setSid] = useState<string>('');
  const [isGiftModalOpen, setGiftModalOpen] = useState(false);
  const createdRef = useRef(false);

  useEffect(() => {
    const handleUserChange = () => {
      const currentUser = getActiveUser();
      setUser(currentUser);
      if (!currentUser) { navigate('/login'); }
    };
    window.addEventListener("userChanged", handleUserChange);
    if (!user) { navigate('/login'); }
    return () => window.removeEventListener("userChanged", handleUserChange);
  }, [navigate, user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ensure = async () => {
      const u = getActiveUser();
      if (!u) return;
      try {
        await getUser(u.id);
      } catch {
        navigate('/login');
        return;
      }
      const existing = sessionStorage.getItem('current_stream_id') || '';
      if (/^\d+$/.test(existing)) { setSid(existing); return; }
      if (createdRef.current) return;
      try {
        const created = await createStream({ usuario_id: u.id, titulo: 'Transmisión en vivo', descripcion: '' });
        const id = String(created.id);
        sessionStorage.setItem('current_stream_id', id);
        setSid(id);
        createdRef.current = true;
      } catch {}
    };
    ensure();
  }, [user]);

  useEffect(() => {
    let t: number | undefined;
    if (sid && user) {
      t = window.setInterval(async () => {
        try {
          const resp = await streamHeartbeat(sid, 1, user.id);
          const u = resp.usuario;
          const mapped = { ...user, streamerHours: u.horas_streamer, points: u.puntos, nivel_actual: u.nivel_actual } as any;
          updateUser(mapped);
          window.dispatchEvent(new CustomEvent('userChanged'));
          // también actualizamos el estado local para reflejar de inmediato
          // evitando depender solo del evento
          // @ts-ignore
          setUser(mapped);
        } catch {
          // si falla el heartbeat (stream finalizado/inválido), recreamos el stream y seguimos
          try {
            const created = await createStream({ usuario_id: user.id, titulo: 'Transmisión en vivo', descripcion: '' });
            const id = String(created.id);
            sessionStorage.setItem('current_stream_id', id);
            setSid(id);
          } catch {}
        }
      }, 1000);
    }
    return () => { if (t) window.clearInterval(t); };
  }, [user, sid]);

  const handleEndStream = async () => {
    if (!user) return;
    const sid = sessionStorage.getItem('current_stream_id');
    if (sid) {
      try { await endStream(sid); } catch {}
      sessionStorage.removeItem('current_stream_id');
    }
    navigate("/estadisticas");
  };

  if (!user) { return <p>Cargando...</p>; }

  const streamerHours = user.streamerHours || 0;
  const levelInfo = getStreamerLevelInfo(streamerHours);

  return (
    <>
      <div className="live-dashboard-layout">
        <div className="live-main-content">
          <div className="live-video-player">
            <p>Simulación de Video EN VIVO</p>
          </div>
          <div className="live-controls-info">
            <div className="live-indicator-timer">
              <span className="live-indicator">● EN VIVO</span>
              <span>{formatTime(elapsedTime)}</span>
            </div>
            <div className="streamer-level-info">
              Nivel Streamer: <strong>{levelInfo.levelName}</strong> ({levelInfo.progress}% para el sig.)
            </div>
            <button onClick={() => setGiftModalOpen(true)} className="view-gifts-button">
              🎁 Ver Regalos
            </button>
            <button onClick={handleEndStream} className="end-stream-button">
              Detener Transmisión
            </button>
          </div>
        </div>
        <div className="live-chat-panel">
          <Chat />
        </div>
      </div>
      {isGiftModalOpen && (
        <GiftModal
          onClose={() => setGiftModalOpen(false)}
          isStreamerSelfView={true}
        />
      )}
    </>
  );
}
