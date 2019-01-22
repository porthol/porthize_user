import { UserService } from './user.service';
import { Request, Response } from 'express';
import * as httpStatus from 'http-status';
import { CustomError, CustomErrorCode } from '../utils/CustomError';
import { handleError } from '../utils/handleErrorHelper';
import { JsonWebTokenError } from 'jsonwebtoken';

export class UserController {

    getAll(req: Request, res: Response): void {
        UserService.get().getAll(req.query)
            .then(users => {
                res.status(httpStatus.OK)
                    .send(users);
            })
            .catch(err => {
                handleError(err, res);
            });
    }

    get(req: Request, res: Response): void {
        UserService.get().get(req.params.id, req.query)
            .then(user => {
                if (!user) {
                    throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'User not found');
                } else {
                    res.status(httpStatus.OK)
                        .send(user);
                }
            })
            .catch(err => {
                handleError(err, res);
            });
    }

    register(req: Request, res: Response): void {
        UserService.get().create(req.body)
            .then(user => {
                res.status(httpStatus.CREATED)
                    .send(user);
            })
            .catch(err => {
                handleError(err, res);
            });
    }

    update(req: Request, res: Response): void {
        UserService.get().update(req.params.id, req.body)
            .then(user => {
                res.status(httpStatus.OK)
                    .send(user);
            })
            .catch(err => {
                handleError(err, res);
            });
    }

    remove(req: Request, res: Response): void {
        UserService.get().remove(req.params.id)
            .then(result => {
                if (result.n === 0) {
                    throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'User not found');
                } else {
                    res.status(httpStatus.NO_CONTENT)
                        .send(result);
                }
            })
            .catch(err => {
                handleError(err, res);
            });
    }

    addRole(req: Request, res: Response): void {
        UserService.get().addRole(req.params.id, req.body.roleId)
            .then(user => {
                res.status(httpStatus.OK)
                    .send(user);
            })
            .catch(err => {
                handleError(err, res);
            });
    }

    removeRole(req: Request, res: Response): void {
        UserService.get().removeRole(req.params.id, req.params.roleId)
            .then(user => {
                res.status(httpStatus.OK)
                    .send(user);
            })
            .catch(err => {
                handleError(err, res);
            });
    }

    login(req: Request, res: Response): void {
        UserService.get().login(req.body)
            .then(token => {
                res.status(httpStatus.CREATED)
                    .send(token);
            })
            .catch(err => {
                handleError(err, res);
            });
    }

    current(req: Request, res: Response): void {
        UserService.get().getCurrentUser(req.headers.authorization)
            .then(user => {
                res.status(httpStatus.OK)
                    .send(user);
            })
            .catch(err => {
                if (err instanceof JsonWebTokenError) {
                    err = new CustomError(CustomErrorCode.ERRBADREQUEST, 'Json Web Token Error', err);
                }
                handleError(err, res);
            });
    }

    isTokenValid(req: Request, res: Response): void {
        UserService.get().isTokenValid(req.headers.authorization)
            .then(user => {
                res.status(httpStatus.NO_CONTENT).send();
            })
            .catch(err => {
                if (err instanceof JsonWebTokenError) {
                    err = new CustomError(CustomErrorCode.ERRBADREQUEST, 'Json Web Token Error', err);
                }
                handleError(err, res);
            });
    }
}
