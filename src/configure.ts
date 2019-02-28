import * as express from 'express';
import UserRoutes from './user/user.routes';
import PrivilegeRoutes from './privilege/privilege.routes';
import RoleRoutes from './role/role.routes';
import HealthRoutes from './utils/health.routes';

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
    router.use('/api', UserRoutes);
    router.use('/api', RoleRoutes);
    router.use('/api', PrivilegeRoutes);

    // health route
    router.use('/api', HealthRoutes);

    // Create a private router
    const privateRouter = express.Router();

    // Your app-router is now configured, let's export it !
    return [router, privateRouter];
}
