import * as express from 'express';
import { UserController } from './user.controller';

const router: express.Router = express.Router();
const controller = new UserController();

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
     *      "password": "$2b$10$nxptcBjkxqPGyK3yWtIsCupTiyajMZJMKs9Oeby3Z6lS126irwv2q",
     *      "password": "cBjkxqPGyK3yWtIsCupTiyaj",
     *      "roles": []
     *  }]
     */
    .get(controller.getAll);
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

export default router;
