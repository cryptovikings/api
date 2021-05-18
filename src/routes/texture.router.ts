import { Router } from 'express';
import { textureController } from '../controllers/textureController';

/** The Router handling the /viking route collection */
const textureRouter = Router();

/** GET /texture/:fileName => (textureController).retrieveTextureImage */
textureRouter.get('/:fileName', textureController.bindRequestHandler(textureController.retrieveTextureImage));

// export the configured Router
export { textureRouter };
