import { UserService } from './user.service';
import { NextFunction, Request, Response } from 'express';
import * as httpStatus from 'http-status';
import { CustomError, CustomErrorCode } from '../utils/custom-error';
import { isEmail } from 'validator';

export class UserController {
    getAll(req: Request, res: Response, next: NextFunction): void {
        UserService.get(req.headers.workspace.toString())
            .getAll(req.query)
            .then(users => {
                res.status(httpStatus.OK).send(users);
            })
            .catch(next);
    }

    get(req: Request, res: Response, next: NextFunction): void {
        UserService.get(req.headers.workspace.toString())
            .get(req.params.id, req.query)
            .then(user => {
                if (!user) {
                    throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'User not found');
                } else {
                    res.status(httpStatus.OK).send(user);
                }
            })
            .catch(next);
    }

    register(req: Request, res: Response, next: NextFunction): void {
        UserService.get(req.headers.workspace.toString())
            .create(req.body)
            .then(user => {
                res.status(httpStatus.CREATED).send(user);
            })
            .catch(next);
    }

    update(req: Request, res: Response, next: NextFunction): void {
        UserService.get(req.headers.workspace.toString())
            .update(req.params.id, req.body)
            .then(user => {
                res.status(httpStatus.OK).send(user);
            })
            .catch(next);
    }

    updateMe(req: Request, res: Response, next: NextFunction): void {
        UserService.get(req.headers.workspace.toString())
            .update((req as any).user._id, req.body)
            .then(user => {
                res.status(httpStatus.OK).send(user);
            })
            .catch(next);
    }

    remove(req: Request, res: Response, next: NextFunction): void {
        Promise.resolve()
            .then(() => {
                if ((req as any).user._id === req.params.id) {
                    throw new CustomError(
                        CustomErrorCode.ERRBADREQUEST,
                        'Bad request : The user cannot delete himself'
                    );
                }
                return UserService.get(req.headers.workspace.toString()).remove(req.params.id);
            })
            .then((result: any) => {
                if (result.n === 0) {
                    throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'User not found');
                } else {
                    res.status(httpStatus.NO_CONTENT).send(result);
                }
            })
            .catch(next);
    }

    addRole(req: Request, res: Response, next: NextFunction): void {
        UserService.get(req.headers.workspace.toString())
            .addRole(req.params.id, req.body.roleId)
            .then(user => {
                res.status(httpStatus.OK).send(user);
            })
            .catch(next);
    }

    removeRole(req: Request, res: Response, next: NextFunction): void {
        UserService.get(req.headers.workspace.toString())
            .removeRole(req.params.id, req.params.roleId)
            .then(user => {
                res.status(httpStatus.OK).send(user);
            })
            .catch(next);
    }

    login(req: Request, res: Response, next: NextFunction): void {
        UserService.get(req.headers.workspace.toString())
            .login(req.body)
            .then(token => {
                res.status(httpStatus.CREATED).send(token);
            })
            .catch(next);
    }

    current(req: Request, res: Response, next: NextFunction): void {
        UserService.get(req.headers.workspace.toString())
            .getCurrentUser(req.headers.authorization)
            .then(user => {
                res.status(httpStatus.OK).send(user);
            })
            .catch(next);
    }

    isTokenValid(req: Request, res: Response, next: NextFunction): void {
        UserService.get(req.headers.workspace.toString())
            .isTokenValid(req.headers.authorization)
            .then(user => {
                res.status(httpStatus.NO_CONTENT).send();
            })
            .catch(next);
    }

    isAuthorized(req: Request, res: Response, next: NextFunction): void {
        UserService.get(req.headers.workspace.toString())
            .isAuthorized((req as any).user, req.body)
            .then(result => {
                if (!result) {
                    throw new CustomError(CustomErrorCode.ERRFORBIDDEN, 'Access forbidden');
                }
                res.status(httpStatus.NO_CONTENT).send(result);
            })
            .catch(next);
    }

    registerMicroService(req: Request, res: Response, next: NextFunction): void {
        UserService.get(req.headers.workspace.toString())
            .createBotUser(req.body.uuid)
            .then(token => {
                res.status(httpStatus.CREATED).send(token);
            })
            .catch(next);
    }

    renewToken(req: Request, res: Response, next: NextFunction): void {
        UserService.get(req.headers.workspace.toString())
            .getBotToken(req.body.token)
            .then(token => {
                res.status(httpStatus.CREATED).send(token);
            })
            .catch(next);
    }

    requestResetPassword(req: Request, res: Response, next: NextFunction): void {
        if (!isEmail(req.body.email)) {
            next(new CustomError(CustomErrorCode.ERRBADREQUEST, 'Bad email format'));
            return;
        }
        UserService.get(req.headers.workspace.toString())
            .requestResetPassword(req.body.email)
            .then(() => {
                res.status(httpStatus.NO_CONTENT).send();
            })
            .catch(next);
    }

    resetPassword(req: Request, res: Response, next: NextFunction): void {
        UserService.get(req.headers.workspace.toString())
            .resetPassword(req.body['reset-token'], req.body.password)
            .then(user => {
                res.status(httpStatus.OK).send(user);
            })
            .catch(next);
    }
}
