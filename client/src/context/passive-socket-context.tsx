"use client"
import { serverBaseURL } from '@/lib/network';
import React, { createContext, useContext, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export const SocketContext = createContext<Socket | null>(null);

type Props = {
    children: React.ReactNode;
};

export const PassiveSocketProvider = ({ children,}: Props) => {

    const [socket] = React.useState(() => io(serverBaseURL.href + 'passive', {
        withCredentials: true,
        transports: ["websocket"],
        autoConnect: true
    }));

    useEffect(() => {
        return () => {
            socket.disconnect();
        };
    }, [socket]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const usePassiveSocketContext = () => {
    const socket = useContext(SocketContext);
    if (!socket) {
        throw new Error('usePassiveSocketContext must be used within a <SocketProvider>');
    }
    return socket;
};