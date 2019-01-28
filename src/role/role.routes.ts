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

const router: express.Router = express.Router();
const validator = new Validator({ allErrors: true, removeAdditional: true });
const roleController = new RoleController();

/**
 * @apiDefine Role Role
 *
 * List of endpoints for managing roles.
 */
router
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
    .get(roleController.getAll)
    /**
     * @api {post} /roles Create role
     *
     * @apiGroup Role
     *
     * @apiParam {String} name
     *
     * @apiSuccess {String} name
     * @apiSuccess {String} id ObjectID
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 201 Created
     *     {
     *        "id": "5b179f629fea4000ffcf2fbc",
     *        "name": "admin",
     *        "privileges":[]
     *    }
     */
    .post(
        validator.validate({ body: RoleCreateSchema }),
        roleController.create
    );

router
    .route('/roles/:id')
    /**
     * @api {get} /roles/:id Get role
     *
     * @apiGroup Role
     *
     * @apiParam {String} id ObjectID
     *
     * @apiSuccess {String} name
     * @apiSuccess {String} id ObjectID
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
    .get(
        validator.validate({ params: RoleQuerySchema }),
        roleController.get
    )
    /**
     * @api {put} /roles/:id Update role
     *
     * @apiGroup Role
     *
     * @apiParam {String} id ObjectID
     *
     * @apiParam {String} name
     *
     * @apiSuccess {String} name
     * @apiSuccess {String} id ObjectID
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
    .put(
        validator.validate({ body: RoleUpdateSchema, params: RoleQuerySchema }),
        roleController.update
    )
    /**
     * @api {delete} /roles/:id Delete role
     *
     * @apiGroup Role
     *
     * @apiParam {String} id ObjectID
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
    .delete(
        validator.validate({ params: RoleQuerySchema }),
        roleController.remove
    );

router
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
    .post(
        validator.validate({
            params: RoleQuerySchema,
            body: RolePrivilegeSchema
        }),
        roleController.addPrivilege
    );

router
    .route('/roles/:id/privileges/:privilegeId')
    /**
     * @api {delete} /roles/:id/privileges/:privilegeId Remove privilege to role
     *
     * @apiGroup Role
     *
     * @apiParam {String} id ObjectID
     * @apiParam {String} privilegeId ObjectID
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 202 Accepted
     */
    .delete(
        validator.validate({
            params: RolePrivilegeQuerySchema
        }),
        roleController.removePrivilege
    );

export default router;
