import { Request, Response, Router } from 'express';

const router = Router();

// GET /
router.get('/', (req: Request, res: Response): void => {
    res.status(200).json({ hello: 'metadata' });
});

export { router as metadataRouter };
