import { Viking, VikingModel } from '../models/mongoose/viking.model';
import { AbstractService } from './abstract/abstract.service';

/**
 * The VikingService, designed to handle database interactivity for the VikingModel
 */
class VikingService extends AbstractService<Viking> {

    /**
     * Constructor. Specify the Model as the VikingModel
     */
    constructor() {
        super(VikingModel);
    }
}

/** Export a singleton of the VikingService */
export const vikingService = new VikingService();
