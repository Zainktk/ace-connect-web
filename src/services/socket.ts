import { io, Socket } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://ace-connect.onrender.com';

class SocketService {
    public socket: Socket | null = null;

    connect() {
        if (!this.socket) {
            this.socket = io(URL, {
                transports: ['websocket'],
                autoConnect: true
            });

            this.socket.on('connect', () => {
                console.log('Socket connected:', this.socket?.id);
            });

            this.socket.on('disconnect', () => {
                console.log('Socket disconnected');
            });
        }
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinMatch(matchId: number) {
        if (this.socket) {
            this.socket.emit('join_match', matchId);
        }
    }

    sendMessage(matchId: number, senderId: number, content: string) {
        if (this.socket) {
            this.socket.emit('send_message', { matchId, senderId, content });
        }
    }

    onNewMessage(callback: (message: any) => void) {
        if (this.socket) {
            this.socket.on('new_message', callback);
        }
    }

    offNewMessage() {
        if (this.socket) {
            this.socket.off('new_message');
        }
    }
}

export const socketService = new SocketService();
