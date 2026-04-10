import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

const SERVER_URL = import.meta.env.VITE_API_URL || 'https://one00mexicanos-back.onrender.com';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connectedRoom, setConnectedRoom] = useState(() => {
    return sessionStorage.getItem('connectedRoom') || null;
  });

  useEffect(() => {
    const newSocket = io(SERVER_URL);

    newSocket.on('connect', () => {
        console.log('🔗 Conectado al servidor WebSocket Global:', newSocket.id);
        const savedRoom = sessionStorage.getItem('connectedRoom');
        if (savedRoom) {
           newSocket.emit('join_room', savedRoom);
        }
    });

    newSocket.on('disconnect', () => {
        console.log('⚠️ Desconectado del servidor WebSocket Global');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (connectedRoom) {
      sessionStorage.setItem('connectedRoom', connectedRoom);
      if (socket && socket.connected) {
         socket.emit('join_room', connectedRoom);
      }
    } else {
      sessionStorage.removeItem('connectedRoom');
    }
  }, [connectedRoom, socket]);

  return (
    <SocketContext.Provider value={{ socket, connectedRoom, setConnectedRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
