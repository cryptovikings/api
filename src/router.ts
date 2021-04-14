import { Request, Response, Router } from 'express';

// system Router
const router = Router();

// GET /
router.get('/', (req: Request, res: Response): void => {
    res.status(200).json({ hello: 'world' });
});

// fallback route
router.use('*', (req: Request, res: Response): void => {
    res.status(404).json({ message: 'Endpoint Not Found' });
});

export { router };
