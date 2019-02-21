import { ExampleService } from './example.service';
import { NextFunction, Request, Response } from 'express';
import * as httpStatus from 'http-status';
import { CustomError, CustomErrorCode } from '../utils/custom-error';

export class ExampleController {
    getAll(req: Request, res: Response, next: NextFunction): void {
        ExampleService.get()
            .getAll(req.query)
            .then(examples => {
                res.status(httpStatus.OK).send(examples);
            })
            .catch(next);
    }

    get(req: Request, res: Response, next: NextFunction): void {
        ExampleService.get()
            .get(req.params.id, req.query)
            .then(example => {
                if (!example) {
                    throw new CustomError(
                        CustomErrorCode.ERRNOTFOUND,
                        'example not found'
                    );
                } else {
                    res.status(httpStatus.OK).send(example);
                }
            })
            .catch(next);
    }

    register(req: Request, res: Response, next: NextFunction): void {
        ExampleService.get()
            .create(req.body)
            .then(example => {
                res.status(httpStatus.CREATED).send(example);
            })
            .catch(next);
    }

    update(req: Request, res: Response, next: NextFunction): void {
        ExampleService.get()
            .update(req.params.id, req.body)
            .then(result => {
                if (result.nModified === 0) {
                    throw new CustomError(
                        CustomErrorCode.ERRNOTFOUND,
                        'example not found'
                    );
                } else {
                    // todo we should send back the example modified
                    res.status(httpStatus.OK).send(req.body);
                }
            })
            .catch(next);
    }

    delete(req: Request, res: Response, next: NextFunction): void {
        ExampleService.get()
            .delete(req.params.id)
            .then(result => {
                if (result.n === 0) {
                    throw new CustomError(
                        CustomErrorCode.ERRNOTFOUND,
                        'example not found'
                    );
                } else {
                    res.status(httpStatus.NO_CONTENT).send(result);
                }
            })
            .catch(next);
    }
}
