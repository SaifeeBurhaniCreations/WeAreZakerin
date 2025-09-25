import { io } from 'socket.io-client';

// const socket = io('https://zakereenapi.sbcws.com', {
const socket = io('https://a462f1343bd3.ngrok-free.app', {
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

