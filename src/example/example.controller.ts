import { ExampleService } from './example.service';
import { Request, Response } from 'express';
import * as httpStatus from 'http-status';
import { CustomError } from '../utils/CustomError';

export class ExampleController {

    getAll(req: Request, res: Response): void {
        ExampleService.get().getAll(req.query)
            .then(examples => {
                res.status(httpStatus.OK)
                    .send(examples);
            })
            .catch(err => {
                res.status(httpStatus.INTERNAL_SERVER_ERROR)
                    .send(new CustomError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error', err));
            });
    }

    get(req: Request, res: Response): void {
        ExampleService.get().get(req.params.id , req.query)
            .then(example => {
                if(!example){
                    res.status(httpStatus.NOT_FOUND)
                        .send(new CustomError(404, 'Example not found', null));
                }else{
                    res.status(httpStatus.OK)
                        .send(example);
                }
            })
            .catch(err => {
                res.status(httpStatus.INTERNAL_SERVER_ERROR)
                    .send(new CustomError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error', err));
            });
    }

    register(req: Request, res: Response): void {
        ExampleService.get().create(req.body)
            .then(example => {
                res.status(httpStatus.CREATED)
                    .send(example);
            })
            .catch(err => {
                res.status(httpStatus.BAD_REQUEST)
                    .send(new CustomError(httpStatus.INTERNAL_SERVER_ERROR, 'Bad request', err));
            });
    }

    update(req: Request, res: Response): void {
        ExampleService.get().update(req.params.id,req.body)
            .then(result => {
                if(result.nModified === 0){
                    res.status(httpStatus.NOT_FOUND)
                        .send(new CustomError(404, 'Example not found', null));
                }else{
                    // todo we should send back the example modified
                    res.status(httpStatus.OK)
                        .send(req.body);
                }
            })
            .catch(err => {
                res.status(httpStatus.BAD_REQUEST)
                    .send(new CustomError(httpStatus.BAD_REQUEST, 'Bad request', err));
            });
    }

    delete(req: Request, res: Response): void{
        ExampleService.get().delete(req.params.id)
            .then(result => {
                if(result.n === 0){
                    res.status(httpStatus.NOT_FOUND)
                        .send(new CustomError(404, 'Example not found', null));
                }else{
                    res.status(httpStatus.NO_CONTENT)
                        .send(result);
                }
            })
            .catch(err => {
                res.status(httpStatus.BAD_REQUEST)
                    .send(new CustomError(httpStatus.BAD_REQUEST, 'Bad request', err));
            });
    }
}
