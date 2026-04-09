import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Idealmente, esto podría provenir de un archivo de entorno
const SERVER_URL = import.meta.env.VITE_API_URL || 'https://one00mexicanos-back.onrender.com';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SERVER_URL);

    newSocket.on('connect', () => {
        console.log('🔗 Conectado al servidor WebSocket:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
        console.log('⚠️ Desconectado del servidor WebSocket');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return socket;
};
