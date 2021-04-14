import http from 'http';
import { app } from './app';

// configure the app
const port = 8080;
app.set('port', port);

// configure the server
const server: http.Server = http.createServer(app);

// set up error handling
server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.syscall !== 'listen') {
        throw error;
    };

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

// notify when started
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

// start the server
server.listen(port);
