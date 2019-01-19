import * as express from 'express';
import { UserController } from './user.controller';

const router: express.Router = express.Router();
const controller = new UserController();
import { Validator } from 'express-json-validator-middleware';
const validator = new Validator({ allErrors: true, removeAdditional: true });
import {
    UserCreateSchema,
    UserQuerySchema,
    UserRoleQuerySchema,
    UserRoleSchema,
    UserUpdateSchema
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
    .get(controller.getAll)
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
        controller.register);


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
        controller.get)
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
        controller.update)
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
    .delete( validator.validate({params: UserQuerySchema}),controller.delete);

router
    .route('/users/:id/roles')
    /**
     * @api {post} /user/:id/roles Add role to user
     *
     * @apiGroup User
     *
     * @apiParam {String} id ObjectID or uuid according to database type (MongoDB/SQL-kind)
     *
     * @apiParam {String} roleId ObjectID or uuid according to database type (MongoDB/SQL-kind)
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 202 Accepted
     */
    .post(
        validator.validate({
            params: UserQuerySchema,
            body: UserRoleSchema
        }),
        controller.addRole.bind(controller)
    );

router
    .route('/users/:id/roles/:roleId')
    /**
     * @api {delete} /user/:id/roles/:roleId Remove role to user
     *
     * @apiGroup User
     *
     * @apiParam {String} id ObjectID or uuid according to database type (MongoDB/SQL-kind)
     * @apiParam {String} roleId ObjectID or uuid according to database type (MongoDB/SQL-kind)
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 202 Accepted
     */
    .delete(
        validator.validate({
            params: UserRoleQuerySchema
        }),
        controller.removeRole.bind(controller)
    );

export default router;
