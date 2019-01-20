import * as express from 'express';
import { RoleController } from './role.controller';
import { Validator } from 'express-json-validator-middleware';
import { RoleCreateSchema, RoleQuerySchema, RoleUpdateSchema } from './role.schemas';

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
     * @api {get} /role Get role list
     *
     * @apiGroup Role
     *
     * @apiSuccess {array} roles
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 200 OK
     *     [{
     *        "id": "5b179f629fea4000ffcf2fbc",
     *        "name": "admin"
     *    }]
     */
    .get(roleController.getAll)
    /**
     * @api {post} /role Create role
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
     *       "name": "admin",
     *       "id": "5b179f629fea4000ffcf2fbc"
     *     }
     */
    .post(
        validator.validate({ body: RoleCreateSchema }),
        roleController.create
    );

router
    .route('/roles/:id')
    /**
     * @api {get} /role/:id Get role
     *
     * @apiGroup Role
     *
     * @apiParam {String} id ObjectID or uuid according to database type (MongoDB/SQL-kind)
     *
     * @apiSuccess {String} name
     * @apiSuccess {String} id ObjectID or uuid according to database type (MongoDB/SQL-kind)
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 200 OK
     *     {
     *        "id": "5b179f629fea4000ffcf2fbc",
     *        "name": "admin"
     *    }
     *
     * @apiErrorExample {json} Error role not found
     *     HTTP/1.1 404 Not Found
     *     {
     *       "error": {
     *         "name": "Error",
     *          "code": "ENOENT",
     *          "message": "Not found"
     *       }
     *     }
     */
    .get(
        validator.validate({ params: RoleQuerySchema }),
        roleController.get
    )
    /**
     * @api {put} /role/:id Update role
     *
     * @apiGroup Role
     *
     * @apiParam {String} id ObjectID or uuid according to database type (MongoDB/SQL-kind)
     *
     * @apiParam {String} name
     *
     * @apiSuccess {String} name
     * @apiSuccess {String} id ObjectID or uuid according to database type (MongoDB/SQL-kind)
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 200 OK
     *     {
     *        "id": "5b179f629fea4000ffcf2fbc",
     *        "name": "admin"
     *    }
     *
     * @apiErrorExample {json} Error user not found
     *     HTTP/1.1 404 Not Found
     *     {
     *       "error": {
     *         "name": "Error",
     *          "code": "ENOENT",
     *          "message": "Not found"
     *       }
     *     }
     */
    .put(
        validator.validate({ body: RoleUpdateSchema, params: RoleQuerySchema }),
        roleController.update
    )
    /**
     * @api {delete} /role/:id Delete role
     *
     * @apiGroup Role
     *
     * @apiParam {String} id ObjectID or uuid according to database type (MongoDB/SQL-kind)
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 204 No Content
     *
     * @apiErrorExample {json} Error user not found
     *     HTTP/1.1 404 Not Found
     *     {
     *       "error": {
     *         "name": "Error",
     *          "code": "ENOENT",
     *          "message": "Not found"
     *       }
     *     }
     */
    .delete(
        validator.validate({ params: RoleQuerySchema }),
        roleController.remove
    );

export default router;
