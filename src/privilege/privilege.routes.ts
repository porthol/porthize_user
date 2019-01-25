import * as express from 'express';
import { PrivilegeController } from './privilege.controller';
import { Validator } from 'express-json-validator-middleware';
import { PrivilegeCreateSchema, PrivilegeQuerySchema, PrivilegeUpdateSchema } from './privilege.schemas';

const router: express.Router = express.Router();
const validator = new Validator({ allErrors: true, removeAdditional: true });
const privilegeController = new PrivilegeController();

/**
 * @apiDefine Privilege Privilege
 *
 * List of endpoints for managing privileges.
 */
router
    .route('/privileges')
    /**
     * @api {get} /privilege Get privilege list
     *
     * @apiGroup Privilege
     *
     * @apiSuccess {array} privileges
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 200 OK
     *     [{
     *        "_id": "5b179f629fea4000ffcf2fbc",
     *        "resource": "user",
     *        "action":["find"]
     *    }]
     */
    .get(privilegeController.getAll)
    /**
     * @api {post} /privilege Create privilege
     *
     * @apiGroup Privilege
     *
     * @apiParam {String} resource,
     * @apiParam {String} actions
     *
     * @apiSuccess {String} resource
     * @apiSuccess {String} id ObjectID
     * @apiSuccess {String[]} actions
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 201 Created
     *     {
     *        "_id": "5b179f629fea4000ffcf2fbc",
     *        "resource": "user",
     *        "action":["find"]
     *    }
     */
    .post(
        validator.validate({ body: PrivilegeCreateSchema }),
        privilegeController.create
    );

router
    .route('/privileges/:id')
    /**
     * @api {get} /privilege/:id Get privilege
     *
     * @apiGroup Privilege
     *
     * @apiParam {String} id ObjectID or uuid according to database type (MongoDB/SQL-kind)
     *
     * @apiSuccess {String} name
     * @apiSuccess {String} id ObjectID or uuid according to database type (MongoDB/SQL-kind)
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 200 OK
     *     {
     *        "_id": "5b179f629fea4000ffcf2fbc",
     *        "resource": "user",
     *        "action":["find"]
     *    }
     *
     * @apiErrorExample {json} Error privilege not found
     *     HTTP/1.1 404 Not Found
     *     {
     *       "error": {
     *          "code": "ERRNOTFOUND",
     *          "message": "Not found"
     *       }
     *     }
     */
    .get(
        validator.validate({ params: PrivilegeQuerySchema }),
        privilegeController.get
    )
    /**
     * @api {put} /privilege/:id Update privilege
     *
     * @apiGroup Privilege
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
     *        "_id": "5b179f629fea4000ffcf2fbc",
     *        "resource": "user",
     *        "action":["find"]
     *    }
     *
     * @apiErrorExample {json} Error user not found
     *     HTTP/1.1 404 Not Found
     *     {
     *       "error": {
     *          "code": "ERRNOTFOUND",
     *          "message": "Not found"
     *       }
     *     }
     */
    .put(
        validator.validate({ body: PrivilegeUpdateSchema, params: PrivilegeQuerySchema }),
        privilegeController.update
    )
    /**
     * @api {delete} /privilege/:id Delete privilege
     *
     * @apiGroup Privilege
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
     *          "code": "ERRNOTFOUND",
     *          "message": "Not found"
     *       }
     *     }
     */
    .delete(
        validator.validate({ params: PrivilegeQuerySchema }),
        privilegeController.remove
    );

export default router;
