import express, { Application } from 'express';
import http from 'http';
import { DBConnectionHelper } from './helpers/dbConnection.helper';
import { cors } from './middleware/cors.middleware';
import { error } from './middleware/error.middleware';
import { apiRouter } from './routes/api.router';

// port
const port = 8080;

// app
const app: Application = express();
app.set('port', port);

// built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// custom cors middleware
app.use(cors);

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
    DBConnectionHelper.initialize();

    const addr = server.address();

    let str = '';

    if (typeof addr === 'string') {
        str = `Port ${addr}`;
    }
    else if (addr) {
        str = `Port ${addr.port}`;
    }

    console.log(`Listening on ${str}`)
});

// start server
server.listen(port);
