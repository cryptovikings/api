import { AbstractController } from './abstract/abstract.controller';

/**
 * The TestController, designed to handle the /test route collection
 *
 * Implements temporary response handlers for testing internal functionality
 */
class TestController extends AbstractController {
    // currently empty
}

/** Export a singleton of the TestController so that we can reference its instance methods in Router configuration */
export const testController = new TestController();
