import * as express from 'express';
import { UserController } from './user.controller';

const router: express.Router = express.Router();
const userController = new UserController();
import { Validator } from 'express-json-validator-middleware';
const validator = new Validator({ allErrors: true, removeAdditional: true });
import {
    UserCreateSchema,
    UserQuerySchema,
    UserRoleQuerySchema,
    UserRoleSchema,
    UserUpdateSchema,
    UserLoginSchema
} from './user.schema';

// todo add control of authorization and authentication

router
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
    .get(userController.getAll)
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
     * @apiSuccess {String} password Hashed password
     * @apiSuccess {String} id ObjectID
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 201 Created
     *     {
     *       "username": "foo",
     *       "email": "foo@bar.baz",
     *       "password": "xqPGyK3yWtIsCupTiyajMZJMKs9Oeby3",
     *       "id": "5b179f629fea4000ffcf2fbc",
     *       "roles":[]
     *     }
     */
    .post(
        validator.validate({body: UserCreateSchema}),
        userController.register);

router
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
    .post(validator.validate({ body: UserLoginSchema }), userController.login);

router
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
    .get(userController.isTokenValid);

router
    .route('/users/current')
    /**
     * @api {get} /users/me Retrieve current user
     *
     * @apiGroup User
     *
     * @apiSuccess {String} username
     * @apiSuccess {String} id ObjectID
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
    .get(userController.current);

router.route('/users/:id')
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
    .get(
        validator.validate({
            params: UserQuerySchema
        }),
        userController.get)
    /**
     * @api {put} /users/:id Update user
     *
     * @apiGroup User
     *
     * @apiParam {String} id ObjectID
     *
     * @apiParam {String} [username] Must be unique
     * @apiParam {String} [email] Must be unique
     *
     * @apiSuccess {String} username
     * @apiSuccess {String} email
     * @apiSuccess {String} password Hashed password
     * @apiSuccess {String} id ObjectID
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
    .put(
        validator.validate({params: UserQuerySchema, body: UserUpdateSchema}),
        userController.update)
    /**
     * @api {delete} /users/:id Delete user
     *
     * @apiGroup User
     *
     * @apiParam {String} id ObjectID
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
    .delete( validator.validate({params: UserQuerySchema}),userController.remove);

router
    .route('/users/:id/roles')
    /**
     * @api {post} /user/:id/roles Add role to user
     *
     * @apiGroup User
     *
     * @apiParam {String} id ObjectID
     *
     * @apiParam {String} roleId ObjectID
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 202 Accepted
     */
    .post(
        validator.validate({
            params: UserQuerySchema,
            body: UserRoleSchema
        }),
        userController.addRole
    );

router
    .route('/users/:id/roles/:roleId')
    /**
     * @api {delete} /user/:id/roles/:roleId Remove role to user
     *
     * @apiGroup User
     *
     * @apiParam {String} id ObjectID
     * @apiParam {String} roleId ObjectID
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 202 Accepted
     */
    .delete(
        validator.validate({
            params: UserRoleQuerySchema
        }),
        userController.removeRole
    );

export default router;
