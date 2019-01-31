import * as express from 'express';
import { PrivilegeController } from './privilege.controller';
import { Validator } from 'express-json-validator-middleware';
import {
    PrivilegeAddRouteSchema,
    PrivilegeCreateSchema,
    PrivilegeQuerySchema,
    PrivilegeResourceQuerySchema,
    PrivilegeUpdateSchema
} from './privilege.schemas';

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
     * @api {get} /privileges Get privilege list
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
     * @api {post} /privileges Create privilege
     *
     * @apiGroup Privilege
     *
     * @apiParam {String} resource,
     * @apiParam {String} actionsAvailable
     *
     * @apiSuccess {String} resource
     * @apiSuccess {String} id ObjectId
     * @apiSuccess {String[]} actionsAvailable
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
        validator.validate({
            body: PrivilegeCreateSchema
        }),
        privilegeController.create
    );

router
    .route('/privileges/:id')
    /**
     * @api {get} /privileges/:id Get privilege
     *
     * @apiGroup Privilege
     *
     * @apiParam {String} id ObjectId
     *
     * @apiSuccess {String} name
     * @apiSuccess {String} id ObjectId
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
        validator.validate({
            params: PrivilegeQuerySchema
        }),
        privilegeController.get
    )
    /**
     * @api {put} /privileges/:id Update privilege
     *
     * @apiGroup Privilege
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
        validator.validate({
            body: PrivilegeUpdateSchema,
            params: PrivilegeQuerySchema
        }),
        privilegeController.update
    )
    /**
     * @api {delete} /privileges/:id Delete privilege
     *
     * @apiGroup Privilege
     *
     * @apiParam {String} id ObjectId
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
        validator.validate({
            params: PrivilegeQuerySchema
        }),
        privilegeController.remove
    );

router
    .route('/privileges/:resource/routes')
    /**
     * @api {post} /privilege/:id Add routes
     *
     * @apiGroup Privilege
     *
     * @apiParam {String} resource resource name string
     *
     * @apiParam {String} action name of the action bind
     * @apiParam {String[]} routes routes list to this action
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
    .post(
        validator.validate({
            params: PrivilegeResourceQuerySchema,
            body: PrivilegeAddRouteSchema
        }),
        privilegeController.addRoutes
    );

export default router;
