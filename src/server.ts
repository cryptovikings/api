import express, { Application } from 'express';
import http from 'http';
import dotenvSafe from 'dotenv-safe';

import { DBConnectionHelper } from './helpers/dbConnection.helper';
import { cors } from './middleware/cors.middleware';
import { error } from './middleware/error.middleware';
import { apiRouter } from './routes/api.router';

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

// Image hosting
app.use('/static', express.static(process.env.IMAGE_OUTPUT_VIKING!));

// API router
app.use('/api', apiRouter);

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
            console.error(`Port ${port} requires elevated privileges`);
            process.exit(1);
            break;

        case 'EADDRINUSE':
            console.error(`Port ${port} is already in use`);
            process.exit(1);
            break;

        default:
            throw error;
    }
});

// server listening handler
server.on('listening', () => {
    // connect to the database
    DBConnectionHelper.initialize().then(
        () => {
            console.log('Database connection successful');

            const addr = server.address();

            let str = '';

            if (typeof addr === 'string') {
                str = `Port ${addr}`;
            }
            else if (addr) {
                str = `Port ${addr.port}`;
            }

            console.log(`Listening on ${str}`)
        },
        (err) => {
            console.log('Database connection error:', err);
            process.exit(1);
        }
    ).catch((err) => {
        console.log('Database connection error:', err);
        process.exit(1);
    });
});

// start server
server.listen(port);
