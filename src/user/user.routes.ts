import * as express from 'express';
import { UserController } from './user.controller';

const router: express.Router = express.Router();
const controller = new UserController();


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
     *      "roles": []
     *  }]
     */
    // todo add control of authorization and authentication
    .get(controller.getAll);
