import { UserService } from './user.service';
import { NextFunction, Request, Response } from 'express';
import * as httpStatus from 'http-status';
import { CustomError, CustomErrorCode } from '../utils/CustomError';

export class UserController {

    getAll(req: Request, res: Response, next: NextFunction): void {
        UserService.get().getAll(req.query)
            .then(users => {
                res.status(httpStatus.OK)
                    .send(users);
            })
            .catch(next);
    }

    get(req: Request, res: Response, next: NextFunction): void {
        UserService.get().get(req.params.id, req.query)
            .then(user => {
                if (!user) {
                    throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'User not found');
                } else {
                    res.status(httpStatus.OK)
                        .send(user);
                }
            })
            .catch(next);
    }

    register(req: Request, res: Response, next: NextFunction): void {
        UserService.get().create(req.body)
            .then(user => {
                res.status(httpStatus.CREATED)
                    .send(user);
            })
            .catch(next);
    }

    update(req: Request, res: Response, next: NextFunction): void {
        UserService.get().update(req.params.id, req.body)
            .then(user => {
                res.status(httpStatus.OK)
                    .send(user);
            })
            .catch(next);
    }

    remove(req: Request, res: Response, next: NextFunction): void {
        Promise.resolve()
            .then(() => {
            if ((req as any).user.userId === req.params.id) {
                throw new CustomError(CustomErrorCode.ERRBADREQUEST,
                    'Bad request : The user cannot delete himself');
            }
            return UserService.get().remove(req.params.id);
        })
            .then((result: any) => {
                if (result.n === 0) {
                    throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'User not found');
                } else {
                    res.status(httpStatus.NO_CONTENT)
                        .send(result);
                }
            })
            .catch(next);
    }

    addRole(req: Request, res: Response, next: NextFunction): void {
        UserService.get().addRole(req.params.id, req.body.roleId)
            .then(user => {
                res.status(httpStatus.OK)
                    .send(user);
            })
            .catch(next);
    }

    removeRole(req: Request, res: Response, next: NextFunction): void {
        UserService.get().removeRole(req.params.id, req.params.roleId)
            .then(user => {
                res.status(httpStatus.OK)
                    .send(user);
            })
            .catch(next);
    }

    login(req: Request, res: Response, next: NextFunction): void {
        UserService.get().login(req.body)
            .then(token => {
                res.status(httpStatus.CREATED)
                    .send(token);
            })
            .catch(next);
    }

    current(req: Request, res: Response, next: NextFunction): void {
        UserService.get().getCurrentUser(req.headers.authorization)
            .then(user => {
                res.status(httpStatus.OK)
                    .send(user);
            })
            .catch(next);
    }

    isTokenValid(req: Request, res: Response, next: NextFunction): void {
        UserService.get().isTokenValid(req.headers.authorization)
            .then(user => {
                res.status(httpStatus.NO_CONTENT).send();
            })
            .catch(next);
    }
}
