import * as express from 'express';
import UserRoutes from './user/user.routes';
import PrivilegeRoutes from './privilege/privilege.routes';
import RoleRoutes from './role/role.routes';
import { serviceManager } from './utils/service.manager';
import { RoleService } from './role';
import { UserService } from './user';
import { PrivilegeService } from './privilege';

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

    /**
     * Place here all middlewares that will be called BEFORE your API.
     */
    /**
     * End of "before" middlewares declaration
     */

    // Load all child routers that call your API.
    router.use('/api', UserRoutes);
    router.use('/api', RoleRoutes);
    router.use('/api', PrivilegeRoutes);

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

export function configureServices() {
    // Insert here all your model
    // Register models created
    serviceManager.registerService(UserService.get());
    serviceManager.registerService(PrivilegeService.get());
    serviceManager.registerService(RoleService.get());
}
