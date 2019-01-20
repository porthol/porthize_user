import * as express from 'express';
import { Validator } from 'express-json-validator-middleware';
import { ExampleController } from './example.controller';
import { ExampleCreateSchema, ExampleUpdateSchema } from './example.schema';

const router: express.Router = express.Router();
const controller = new ExampleController();
const validator = new Validator({ allErrors: true, removeAdditional: true });

// todo add control of authorization and authentication

router
    .route('/examples')
    /**
     * @api {get} /examples Get examples list
     *
     * @apiGroup Example
     *
     * @apiSuccess {array} examples
     *
     * @apiSuccessExample {json} Success response
     *  HTTP/1.1 200 OK
     *  [{
     *      "id":"4f5e5a1d236c67b874b4b5e5d",
     *      "name":"FooBar",
     *      "createdDate": "01-01-2000T10:10:10.000Z",
     *      "positions": [{
     *        "latitude":"1.00",
     *        "longitude":"2.00",
     *        "date":"01-01-2000T10:10:10.000Z"
     *      }]
     *  }]
     */
    .get(controller.getAll)
    /**
     * @api {post} /examples Create example
     *
     * @apiGroup Example
     *
     * @apiParam {String} name
     * @apiParam {Boolean} enabled
     *
     * @apiSuccess {String} name
     * @apiSuccess {Boolean} enabled
     * @apiSuccess {String} createdDate
     * @apiSuccess {String} id ObjectID
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 201 Created
     *     {
     *      "id":"4f5e5a1d236c67b874b4b5e5d",
     *      "name":"FooBar",
     *      "createdDate": "01-01-2000T10:10:10.000Z",
     *      "positions": [{
     *        "latitude":"1.00",
     *        "longitude":"2.00",
     *        "date":"01-01-2000T10:10:10.000Z"
     *      }]
     *  }
     */
    .post(
        validator.validate({body: ExampleCreateSchema}),
        controller.register);


router.route('/examples/:id')
    /**
     * @api {get} /examples/:id Get one example
     *
     * @apiGroup Example
     *
     * @apiSuccess {array} examples
     *
     * @apiSuccessExample {json} Success response
     *  HTTP/1.1 200 OK
     *  {
     *      "id":"4f5e5a1d236c67b874b4b5e5d",
     *      "name":"FooBar",
     *      "createdDate": "01-01-2000T10:10:10.000Z",
     *      "positions": [{
     *        "latitude":"1.00",
     *        "longitude":"2.00",
     *        "date":"01-01-2000T10:10:10.000Z"
     *      }]
     *  }
     */
    .get(controller.get)
    /**
     * @api {put} /example/:id Update example
     *
     * @apiGroup Example
     *
     * @apiParam {String} id ObjectID
     *
     * @apiParam {String} [examplename] Must be unique
     * @apiParam {String} [email] Must be unique
     *
     * @apiSuccess {String} examplename
     * @apiSuccess {String} email
     * @apiSuccess {String} password Hashed password
     * @apiSuccess {String} id ObjectID
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 200 OK
     *     {
     *      "id":"4f5e5a1d236c67b874b4b5e5d",
     *      "name":"FooBar",
     *      "createdDate": "01-01-2000T10:10:10.000Z",
     *      "positions": [{
     *        "latitude":"1.00",
     *        "longitude":"2.00",
     *        "date":"01-01-2000T10:10:10.000Z"
     *      }]
     *  }
     */
    .put(
        validator.validate({body: ExampleUpdateSchema}),
        controller.update)
    /**
     * @api {delete} /example/:id Delete example
     *
     * @apiGroup Example
     *
     * @apiParam {String} id ObjectID
     *
     * @apiSuccessExample {json} Success response
     *     HTTP/1.1 204 No Content
     *
     * @apiErrorExample {json} Error example not found
     *     HTTP/1.1 404 Not Found
     *     {
     *       "code": "ERRNOTFOUND",
     *       "message": "Not found"
     *     }
     */
    .delete(controller.delete);

export default router;
