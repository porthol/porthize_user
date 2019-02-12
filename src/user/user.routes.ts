import * as express from 'express';
import { UserController } from './user.controller';
import { Validator } from 'express-json-validator-middleware';
import {
    UserAuthorizedSchema,
    UserCreateSchema,
    UserLoginSchema,
    UserMicroServiceSchema,
    UserQuerySchema,
    UserRenewBotTokenSchema,
    UserRoleQuerySchema,
    UserRoleSchema,
    UserUpdateSchema
} from './user.schema';
import { internalAuthenticationMiddleware } from '../utils/internal-authentication.middleware';
import { RouterManager } from '../utils/router.manager';
import { internalAuthorizationMiddleware } from '../utils/internal-authorization.middleware';
import { denyExternalRequestMiddleware } from '../utils/deny-external-request.middleware';

const router: express.Router = express.Router();
const userController = new UserController();

const validator = new Validator({ allErrors: true, removeAdditional: true });

const routerManager = new RouterManager(router);

const resource = 'users';

routerManager
    .route('/users')
    /**
     * @api {get} /users Get users list
     *
     * @apiGroup User
     *
     * @apiSuccess {array} users
     *
     * @apiSuccessExample {json} Success response
     *  HTTP/1.1 200 OK
     *  [{
     *      "id":"4f5e5a1d236c67b874b4b5e5d",
     *      "username":"FooBar",
     *      "email":"toto@me.com",
     *      "password": "cBjkxqPGyK3yWtIsCupTiyaj",
     *      "roles": []
     *  }]
     */
    .get({
        handlers: [
            internalAuthenticationMiddleware,
            internalAuthorizationMiddleware,
            userController.getAll
        ],
        resource,
        action: 'read'
    })
    /**
     * @api {post} /users Create user
     *
     * @apiGroup User
     *
     * @apiParam {String} username Must be unique
     * @apiParam {String} email Must be unique
     * @apiParam {String} password Plain-text password
     *
     * @apiSuccess {String} username
     * @apiSuccess {String} email
     * @apiSuccess {String} id ObjectId
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 201 Created
     *     {
     *       "username": "foo",
     *       "email": "foo@bar.baz",
     *       "id": "5b179f629fea4000ffcf2fbc",
     *       "roles":[]
     *     }
     */
    .post({
        handlers: [
            validator.validate({ body: UserCreateSchema }),
            userController.register
        ]
    });

routerManager
    .route('/token')
    /**
     * @api {get} /token Verify the token sent
     *
     * @apiGroup User
     *
     * @apiHeader {String} Authorization Bearer Schema
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 204 No Content
     */
    .get({
        handlers: [
            userController.isTokenValid
        ]
    });

routerManager
    .route('/users/login')
    /**
     * @api {get} /users/login Login user
     *
     * @apiGroup User
     *
     * @apiParam {String} [username] Optional only if email is provided
     * @apiParam {String} [email] Optional only if username is provided
     * @apiParam {String} password Plain-text password
     *
     * @apiSuccess {String} token A jwt token
     * @apiSuccess {number} iat Timestamp in secs
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 200 OK
     *     {
     *          "token": "a.jwt.token",
     *          "iat": 1548088387
     *     }
     *
     * @apiErrorExample {json} Error user not found
     *     HTTP/1.1 404 Not found
     *     {
     *       "error": {
     *         "name": "ERRNOTFOUND",
     *         "message": "User not found"
     *       }
     *     }
     */
    .post({
        handlers: [
            validator.validate({
                body: UserLoginSchema
            }),
            userController.login
        ]
    });

routerManager
    .route('/users/current')
    /**
     * @api {get} /users/me Retrieve current user
     *
     * @apiGroup User
     *
     * @apiSuccess {String} username
     * @apiSuccess {String} id ObjectId
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 200 OK
     *     {
     *          "username": "John",
     *          "iat": 1548088387
     *     }
     *
     * @apiErrorExample {json} Error user not found
     *     HTTP/1.1 400 Bad Request
     *     {
     *       "error": {
     *         "name": "ERRBADREQUEST",
     *         "message": "No token found"
     *       }
     *     }
     */
    .get({
        handlers: [
            internalAuthenticationMiddleware,
            userController.current
        ]
    })
    /**
     * @api {put} /users/:id Update user
     *
     * @apiGroup User
     *
     * @apiParam {String} id ObjectId
     *
     * @apiParam {String} [username] Must be unique
     * @apiParam {String} [email] Must be unique
     *
     * @apiSuccess {String} username
     * @apiSuccess {String} email
     * @apiSuccess {String} password Hashed password
     * @apiSuccess {String} id ObjectId
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 200 OK
     *     {
     *        "id": "5b179f629fea4000ffcf2fbc",
     *        "username": "foo",
     *        "email": "foo@bar.baz",
     *        "password": "xqPGyK3yWtIsCupTiyajMZJMKs9Oeby3",
     *        "roles": []
     *    }
     *
     */
    .put({
        handlers: [
            internalAuthenticationMiddleware,
            internalAuthorizationMiddleware,
            validator.validate({
                body: UserUpdateSchema
            }),
            userController.updateMe
        ],
        resource,
        action: 'updateMe'
    });

routerManager
    .route('/users/:id')
    /**
     * @api {get} /users/:id Get one user
     *
     * @apiGroup User
     *
     * @apiSuccess {array} users
     *
     * @apiSuccessExample {json} Success response
     *  HTTP/1.1 200 Created
     *  {
     *       "username": "foo",
     *       "email": "foo@bar.baz",
     *       "password": "xqPGyK3yWtIsCupTiyajMZJMKs9Oeby3",
     *       "id": "5b179f629fea4000ffcf2fbc",
     *       "roles":[]
     *     }
     */
    .get({
        handlers: [
            internalAuthenticationMiddleware,
            internalAuthorizationMiddleware,
            validator.validate({
                params: UserQuerySchema
            }),
            userController.get
        ],
        resource,
        action: 'read'
    })
    /**
     * @api {put} /users/:id Update user
     *
     * @apiGroup User
     *
     * @apiParam {String} id ObjectId
     *
     * @apiParam {String} [username] Must be unique
     * @apiParam {String} [email] Must be unique
     *
     * @apiSuccess {String} username
     * @apiSuccess {String} email
     * @apiSuccess {String} password Hashed password
     * @apiSuccess {String} id ObjectId
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 200 OK
     *     {
     *        "id": "5b179f629fea4000ffcf2fbc",
     *        "username": "foo",
     *        "email": "foo@bar.baz",
     *        "password": "xqPGyK3yWtIsCupTiyajMZJMKs9Oeby3",
     *        "roles": []
     *    }
     *
     */
    .put({
        handlers: [
            internalAuthenticationMiddleware,
            internalAuthorizationMiddleware,
            validator.validate({
                params: UserQuerySchema,
                body: UserUpdateSchema
            }),
            userController.update
        ],
        resource,
        action: 'update'
    })
    /**
     * @api {delete} /users/:id Delete user
     *
     * @apiGroup User
     *
     * @apiParam {String} id ObjectId
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 204 No Content
     *
     * @apiErrorExample {json} Error user not found
     *     HTTP/1.1 404 Not Found
     *     {
     *       "code": "ERRNOTFOUND",
     *       "message": "Not found"
     *     }
     */
    .delete({
        handlers: [
            internalAuthenticationMiddleware,
            internalAuthorizationMiddleware,
            validator.validate({
                params: UserQuerySchema
            }),
            userController.remove
        ],
        resource,
        action: 'delete'
    });

routerManager
    .route('/users/isAuthorized')
    /**
     * @api {post} /users/isAuthorized Check if current user can perfom this request
     *
     * @apiGroup User
     *
     * @apiParam {String} url url of the request
     *
     * @apiParam {String} method [GET,POST,PUT,DELETE] case insensitive
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 204 No Content
     *
     */
    .post({
        handlers: [
            internalAuthenticationMiddleware,
            validator.validate({
                body: UserAuthorizedSchema
            }),
            userController.isAuthorized
        ]
    });

routerManager
    .route('/users/:id/roles')
    /**
     * @api {post} /users/:id/roles Add role to user
     *
     * @apiGroup User
     *
     * @apiParam {String} id ObjectId
     *
     * @apiParam {String} roleId ObjectId
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 202 Accepted
     */
    .post({
        handlers: [
            internalAuthenticationMiddleware,
            internalAuthorizationMiddleware,
            validator.validate({
                params: UserQuerySchema,
                body: UserRoleSchema
            }),
            userController.addRole
        ],
        resource,
        action: 'updateRole'
    });

routerManager
    .route('/users/:id/roles/:roleId')
    /**
     * @api {delete} /users/:id/roles/:roleId Remove role to user
     *
     * @apiGroup User
     *
     * @apiParam {String} id ObjectId
     * @apiParam {String} roleId ObjectId
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 202 Accepted
     */
    .delete({
        handlers: [
            internalAuthenticationMiddleware,
            internalAuthorizationMiddleware,
            validator.validate({
                params: UserRoleQuerySchema
            }),
            userController.removeRole
        ],
        resource,
        action: 'updateRole'
    });

    // todo add api doc

routerManager
    .route('/users/registerMicroService')
    .post({
        handlers: [
            denyExternalRequestMiddleware,
            validator.validate({
                body: UserMicroServiceSchema
            }),
            userController.registerMicroService
        ]
    });

routerManager
    .route('/users/renewBotToken')
    .post({
        handlers: [
            denyExternalRequestMiddleware,
            validator.validate({
                body: UserRenewBotTokenSchema
            }),
            userController.renewToken
        ]
    });

export default router;
