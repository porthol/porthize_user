import * as express from 'express';
import ExampleRoutes from './example/example.routes';

/**
 * Function used to configure application
 *
 * @export
 * @param {object} [configuration]
 * @returns {Promise<express.Router[]>}
 */
export function configureRouter(configuration?: object): express.Router[] {
    // Create a new router that will be exported and used by top-level app
    const router = express.Router();

    // Load all child routers that call your API.
    router.use('/api', ExampleRoutes);

    // Create a private router
    const privateRouter = express.Router();

    // Your app-router is now configured, let's export it !
    return [router, privateRouter];
}
