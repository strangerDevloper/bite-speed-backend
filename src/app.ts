import express, { Express } from 'express';
import { Server } from 'http';
import { apiRoutes } from './api';

const app: Express = express();

app.use(express.json({ limit: '50mb' }));

app.get('/',(req, res) => {
    res.status(200).json({ message: 'Welcome to bitespeed' });
});

app.use('/api/v1', apiRoutes);

const startApp = (port: number): Server => {
    const server = app.listen(port, () => {
        console.log(`Express is listening at ${port}`);
    });
    return server;
};

export { app, startApp };