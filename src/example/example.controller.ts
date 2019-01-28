import { ExampleService } from './example.service';
import { Request, Response } from 'express';
import * as httpStatus from 'http-status';
import { CustomError, CustomErrorCode } from '../utils/CustomError';
import { handleError } from '../utils/handleError.helper';

export class ExampleController {

  getAll(req: Request, res: Response): void {
    ExampleService.get().getAll(req.query)
      .then(examples => {
        res.status(httpStatus.OK)
          .send(examples);
      })
      .catch(err => {
        handleError(err, res);
      });
  }

  get(req: Request, res: Response): void {
    ExampleService.get().get(req.params.id, req.query)
      .then(example => {
        if (!example) {
          throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'example not found');
        } else {
          res.status(httpStatus.OK)
            .send(example);
        }
      })
      .catch(err => {
        handleError(err, res);
      });
  }

  register(req: Request, res: Response): void {
    ExampleService.get().create(req.body)
      .then(example => {
        res.status(httpStatus.CREATED)
          .send(example);
      })
      .catch(err => {
        handleError(err, res);
      });
  }

  update(req: Request, res: Response): void {
    ExampleService.get().update(req.params.id, req.body)
      .then(result => {
        if (result.nModified === 0) {
          throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'example not found');
        } else {
          // todo we should send back the example modified
          res.status(httpStatus.OK)
            .send(req.body);
        }
      })
      .catch(err => {
        handleError(err, res);
      });
  }

  delete(req: Request, res: Response): void {
    ExampleService.get().delete(req.params.id)
      .then(result => {
        if (result.n === 0) {
          throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'example not found');
        } else {
          res.status(httpStatus.NO_CONTENT)
            .send(result);
        }
      })
      .catch(err => {
        handleError(err, res);
      });
  }
}
