import { config } from 'dotenv';
import { startApp } from './app';
import { dbManager } from './config/db';
import { Server } from 'http';
import { Socket } from 'net';

config();

const port = +(process.env.PORT || 8080);

let server: Server;
const sockets = new Set<Socket>();

// Graceful shutdown handler
const gracefulShutdown = () => {
    console.log('Starting graceful shutdown...');
    
    // Close server
    if (server) {
        server.close(() => {
            console.log('Server closed');
            
            // Close all sockets
            sockets.forEach(socket => {
                socket.destroy();
            });
            
            // Disconnect from database
            dbManager.close()
                .then(() => {
                    console.log('Database disconnected');
                    process.exit(0);
                })
                .catch(err => {
                    console.error('Error disconnecting from database:', err);
                    process.exit(1);
                });
        });
    }
};

// Handle process termination
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Connect to database and start server
dbManager
    .connect()
    .then(() => {
        console.log('Connected to Database');
        
        // Start the server
        server = startApp(port);
        
        // Set server timeout
        server.timeout = 55000;
        
        // Handle timeout events
        server.on('timeout', (socket: Socket) => {
            console.log('Request timeout - closing socket');
            socket.destroy();
        });

        // Track open sockets
        server.on('connection', (socket: Socket) => {
            sockets.add(socket);
            socket.on('close', () => sockets.delete(socket));
        });

        // Handle server errors
        server.on('error', (error: Error) => {
            console.error('Server error:', error);
        });
    })
    .catch((err) => {
        console.error('Failed to start application:', err);
        process.exit(1);
    });
