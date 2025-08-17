import { io } from 'socket.io-client';

const socket = io('https://zakereenapi.sbcws.com', {
    autoConnect: true,
    transports: ['websocket', 'polling']
});

socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
});

socket.on('connect_error', (err) => {
    console.log('❌ Socket connection error:', err.message);
});

export { socket }

