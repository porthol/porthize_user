import * as express from 'express';
import { UserController } from './user.controller';

const router: express.Router = express.Router();
const controller = new UserController();
import { Validator } from 'express-json-validator-middleware';
const validator = new Validator({ allErrors: true, removeAdditional: true });
import { UserCreateSchema, UserLoginSchema } from './user.schema';

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
    .get(controller.get);


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
     * @apiSuccess {String} username
     * @apiSuccess {String} email
     * @apiSuccess {String} id ObjectID or uuid according to database type (MongoDB/SQL-kind)
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 200 OK
     *     {
     *       "username": "foo",
     *       "email": "foo@bar.baz",
     *       "id": "5b179f629fea4000ffcf2fbc"
     *     }
     *
     * @apiErrorExample {json} Error user not found
     *     HTTP/1.1 404 Not found
     *     {
     *       "error": {
     *         "name": "Error",
     *         "message": "User not found"
     *       }
     *     }
     */
    .post(validator.validate({ body: UserLoginSchema }), controller.login);

export default router;
