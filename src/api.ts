import http from 'http';
import path from 'path';
import express, { Application } from 'express';
import { configure, getLogger } from 'log4js';

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

// configure log4js and output a start marker
configure({
    appenders: {
        out: { type: 'stdout' },
        api: {
            type: 'file',
            filename: path.join(__dirname, '../', process.env.LOG_OUT!, 'api.log'),
            maxLogSize: 1000000,
            backups: 2,
            compress: true
        },
        http: {
            type: 'file',
            filename: path.join(__dirname, '../', process.env.LOG_OUT!, 'http.log'),
            maxLogSize: 1000000,
            backups: 2,
            compress: true
        }
    },
    categories: {
        default: { appenders: ['out', 'api'], level: 'debug' },
        http: { appenders: ['http'], level: 'debug' }
    }
});
const out = getLogger();
const httpOut = getLogger('http');
out.mark('-------- API START --------');
httpOut.mark('-------- API START --------');

// server
const server: http.Server = http.createServer(app);

// server error handling
server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.syscall !== 'listen') {
        out.fatal('Server: unknown error', error);
        throw error;
    }

    switch (error.code) {
        case 'EACCESS':
            out.fatal(`Server: port ${port} requires elevated privileges`);
            process.exit(1);
            break;

        case 'EADDRINUSE':
            out.fatal(`Server: port ${port} is already in use`);
            process.exit(1);
            break;

        default:
            out.fatal('Server: unknown error', error);
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

    out.info(`Server: listening on port ${str}`);

    DatabaseHelper.initialize().then(
        () => {
            out.info('Server: Database connection successful');

            ImageHelper.initialize();

            // initialize our Ethereum interface
            EthHelper.initialize().catch((err) => {
                out.fatal('Server: EthHelper initialization failed', err);
                process.exit(1);
            });
        },
        (err) => {
            out.fatal('Server: Database connection failed', err);
            process.exit(1);
        }
    );
});

// start server
server.listen(port);
