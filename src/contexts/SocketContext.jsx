import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

const SERVER_URL = 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connectedRoom, setConnectedRoom] = useState(null);

  useEffect(() => {
    const newSocket = io(SERVER_URL, {
        transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
        console.log('🔗 Conectado al servidor WebSocket Global:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
        console.log('⚠️ Desconectado del servidor WebSocket Global');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connectedRoom, setConnectedRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
