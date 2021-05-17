import fs from 'fs';
import path from 'path';
import http from 'http';
import express, { Application, NextFunction, Request, Response } from 'express';

import { DatabaseHelper } from './helpers/database.helper';
import { cors } from './middleware/cors.middleware';
import { error } from './middleware/error.middleware';
import { apiRouter } from './routes/api.router';
import { EthHelper } from './helpers/eth.helper';
import { ImageHelper } from './helpers/image.helper';

// port
const port = process.env.SERVER_PORT!;

// app
const app: Application = express();
app.set('port', port);

// built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// custom cors middleware
app.use(cors);

// Viking image serves
app.use(process.env.IMAGE_VIKING_ENDPOINT!, express.static(ImageHelper.VIKING_OUT));

// API router
app.use('/', apiRouter);

// custom error handling middleware
app.use(error);

// server
const server: http.Server = http.createServer(app);

// server error handling
server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    switch (error.code) {
        case 'EACCESS':
            console.error(`Server: port ${port} requires elevated privileges`);
            process.exit(1);
            break;

        case 'EADDRINUSE':
            console.error(`Server: port ${port} is already in use`);
            process.exit(1);
            break;

        default:
            throw error;
    }
});

// server listening handler
server.on('listening', () => {
    const addr = server.address();
    let str = '';

    if (typeof addr === 'string') {
        str = `Port ${addr}`;
    }
    else if (addr) {
        str = `Port ${addr.port}`;
    }

    console.log(`Server: Listening on ${str}`);

    DatabaseHelper.initialize().then(
        () => {
            console.log('Server: Database connection successful');

            ImageHelper.initialize();

            // initialize our Ethereum interface
            EthHelper.initialize().catch((err) => {
                console.error('Server: EthHelper initialization failed:', err);
                process.exit(1);
            });
        },
        (err) => {
            console.error('Server: Database connection failed:', err);
            process.exit(1);
        }
    );
});

// start server
server.listen(port);
