import express, { Application, NextFunction, Request, Response } from 'express';
import http from 'http';
import { apiRouter } from './routes/api.router';

// port
const port = 8080;

// app + middleware
const app: Application = express();
app.set('port', port);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS
app.use((req: Request, res: Response, next: NextFunction): void => {
    // TODO: restrict origin if applicable for deployment
    res.header('Access-Control-Allow-Origin', '*');

    // TODO evaluate ongoing
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');

    // TODO evaluate ongoing
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');

    next();
});

// API router
app.use('/api', apiRouter);

// error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({ name: err.name, message: err.message });
});

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
