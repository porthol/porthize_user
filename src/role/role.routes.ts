import * as express from 'express';
import { RoleController } from './role.controller';
import { Validator } from 'express-json-validator-middleware';
import {
    RoleCreateSchema,
    RolePrivilegeQuerySchema,
    RolePrivilegeSchema,
    RoleQuerySchema,
    RoleUpdateSchema
} from './role.schemas';
import { RouterManager } from '../utils/router.manager';
import { internalAuthenticationMiddleware } from '../utils/internal-authentication.middleware';
import { internalAuthorizationMiddleware } from '../utils/internal-authorization.middleware';
import { internalDenyExternalRequestMiddleware } from '../utils/internal-deny-external-request';

const router: express.Router = express.Router();
const validator = new Validator({ allErrors: true, removeAdditional: true });
const roleController = new RoleController();

const routerManager = new RouterManager(router);

const resource = 'roles';
/**
 * @apiDefine Role Role
 *
 * List of endpoints for managing roles.
 */
routerManager
    .route('/roles')
    /**
     * @api {get} /roles Get role list
     *
     * @apiGroup Role
     *
     * @apiSuccess {array} roles
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 200 OK
     *     [{
     *        "id": "5b179f629fea4000ffcf2fbc",
     *        "name": "admin",
     *        "privileges":[]
     *    }]
     */
    .get({
        handlers: [
            internalAuthenticationMiddleware,
            internalAuthorizationMiddleware,
            roleController.getAll
        ],
        resource,
        action: 'read'
    })
    /**
     * @api {post} /roles Create role
     *
     * @apiGroup Role
     *
     * @apiParam {String} name
     *
     * @apiSuccess {String} name
     * @apiSuccess {String} id ObjectId
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 201 Created
     *     {
     *        "id": "5b179f629fea4000ffcf2fbc",
     *        "name": "admin",
     *        "privileges":[]
     *    }
     */
    .post({
        handlers: [
            validator.validate({
                body: RoleCreateSchema
            }),
            internalAuthenticationMiddleware,
            internalAuthorizationMiddleware,
            roleController.create
        ],
        resource,
        action: 'create'
    });

routerManager
    .route('/roles/:id')
    /**
     * @api {get} /roles/:id Get role
     *
     * @apiGroup Role
     *
     * @apiParam {String} id ObjectId
     *
     * @apiSuccess {String} name
     * @apiSuccess {String} id ObjectId
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 200 OK
     *     {
     *        "id": "5b179f629fea4000ffcf2fbc",
     *        "name": "admin",
     *        "privileges":[]
     *    }
     *
     * @apiErrorExample {json} Error role not found
     *     HTTP/1.1 404 Not Found
     *     {
     *       "error": {
     *          "code": "ERRNOTFOUND",
     *          "message": "Not found"
     *       }
     *     }
     */
    .get({
        handlers: [
            validator.validate({
                params: RoleQuerySchema
            }),
            internalAuthenticationMiddleware,
            internalAuthorizationMiddleware,
            roleController.get
        ],
        resource,
        action: 'read'
    })
    /**
     * @api {put} /roles/:id Update role
     *
     * @apiGroup Role
     *
     * @apiParam {String} id ObjectId
     *
     * @apiParam {String} name
     *
     * @apiSuccess {String} name
     * @apiSuccess {String} id ObjectId
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 200 OK
     *     {
     *        "id": "5b179f629fea4000ffcf2fbc",
     *        "name": "admin",
     *        "privileges":[]
     *    }
     *
     * @apiErrorExample {json} Error role not found
     *     HTTP/1.1 404 Not Found
     *     {
     *       "error": {
     *          "code": "ERRNOTFOUND",
     *          "message": "Not found"
     *       }
     *     }
     */
    .put({
        handlers: [
            validator.validate({
                body: RoleUpdateSchema,
                params: RoleQuerySchema
            }),
            internalAuthenticationMiddleware,
            internalAuthorizationMiddleware,
            roleController.update
        ],
        resource,
        action: 'update'
    })
    /**
     * @api {delete} /roles/:id Delete role
     *
     * @apiGroup Role
     *
     * @apiParam {String} id ObjectId
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 204 No Content
     *
     * @apiErrorExample {json} Error role not found
     *     HTTP/1.1 404 Not Found
     *     {
     *       "error": {
     *          "code": "ERRNOTFOUND",
     *          "message": "Not found"
     *       }
     *     }
     */
    .delete({
        handlers: [
            validator.validate({
                params: RoleQuerySchema
            }),
            internalAuthenticationMiddleware,
            internalAuthorizationMiddleware,
            roleController.remove
        ],
        resource,
        action: 'delete'
    });

routerManager
    .route('/roles/:id/privileges')
    /**
     * @api {post} /roles/:id/privileges Add privilege to role
     *
     * @apiGroup Role
     *
     * @apiParam {String} id ObjectId
     *
     * @apiSuccessExample {json} Success response
     *      HTTP/1.1 200 OK
     *      {
     *        "id": "5b179f629fea4000ffcf2fbc",
     *        "name": "admin",
     *        "privileges":[{
     *          "_id": "5b179f629fea4000ffcf2fbc",
     *          "resource": "user",
     *          "action":["find"]
     *          }]
     *      }
     *
     */
    .post({
        handlers: [
            validator.validate({
                params: RoleQuerySchema,
                body: RolePrivilegeSchema
            }),
            internalAuthenticationMiddleware,
            internalAuthorizationMiddleware,
            roleController.addPrivilege
        ],
        resource,
        action: 'updatePrivilege'
    });

routerManager
    .route('/roles/:id/privileges/:privilegeId')
    /**
     * @api {delete} /roles/:id/privileges/:privilegeId Remove privilege to role
     *
     * @apiGroup Role
     *
     * @apiParam {String} id ObjectId
     * @apiParam {String} privilegeId ObjectId
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 202 Accepted
     */
    .delete({
        handlers: [
            validator.validate({
                params: RolePrivilegeQuerySchema
            }),
            internalAuthenticationMiddleware,
            internalAuthorizationMiddleware,
            roleController.removePrivilege
        ],
        resource,
        action: 'updatePrivilege'
    });

routerManager
    .route('/roles/importPrivileges')
    .post({
        handlers: [
            internalDenyExternalRequestMiddleware,
            roleController.importPrivilege
        ]
    });

export default router;
