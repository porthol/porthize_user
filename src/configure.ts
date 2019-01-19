import * as express from 'express';
import UserRoutes from './user/user.routes';
import RoleRoutes from './role/role.routes';

/**
 * Function used to configure application
 *
 * @export
 * @param {object} [configuration]
 * @returns {Promise<express.Router[]>}
 */
export function configure(configuration?: object): express.Router[] {
    // Create a new router that will be exported and used by top-level app
    const router = express.Router();

    /**
     * Place here all middlewares that will be called BEFORE your API.
     */
    /**
     * End of "before" middlewares declaration
     */

    // Load all child routers that call your API.
    router.use('/api', UserRoutes);
    router.use('/api', RoleRoutes);

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
