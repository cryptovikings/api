import { Router } from 'express';
import { metadataController } from '../controllers/metadata.controller';

const router = Router();

// GET /
router.get('/', metadataController.bindRequestHandler(metadataController.hello));

router.get('/test', metadataController.bindRequestHandler(metadataController.metadataTest));

export { router as metadataRouter };
