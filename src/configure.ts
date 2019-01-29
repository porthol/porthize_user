import * as express from 'express';
import ExampleRoutes from './example/example.routes';
import { modelManager } from './utils/ModelManager';
import { ExampleModel } from './example';

/**
 * Function used to configure application
 *
 * @export
 * @param {object} [configuration]
 * @returns {Promise<express.Router[]>}
 */
export function configure(configuration?: object): express.Router[] {

  // Insert here all your model
  // Register models created
  modelManager.registerModel(ExampleModel);

  // Create a new router that will be exported and used by top-level app
  const router = express.Router();

  /**
   * Place here all middlewares that will be called BEFORE your API.
   */
  /**
   * End of "before" middlewares declaration
   */

  // Load all child routers that call your API.
  router.use('/api', ExampleRoutes);

  /**
   * Place here all middlewares that will be called AFTER your API.
   */
  /**
   * End of "after" middlewares declaration
   */

    // Create a private router
  const privateRouter = express.Router();

  // Your app-router is now configured, let's export it !
  return [router, privateRouter];
}
