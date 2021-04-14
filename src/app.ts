import express, { Application, NextFunction, Request, Response } from 'express';
import { router } from './router';

// app + middleware
const app: Application = express()
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

// system router
app.use('/api', router);

// error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({ name: err.name, message: err.message });
});

export { app };
