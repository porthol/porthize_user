import { UserService } from './user.service';
import { NextFunction, Request, Response } from 'express';
import * as httpStatus from 'http-status';
import { CustomError, CustomErrorCode } from '../utils/custom-error';
import { isEmail } from 'validator';
import { CustomRequest } from '../utils/custom-request';

export class UserController {
    getAll(req: Request, res: Response, next: NextFunction): void {
        const customReq = (req as any) as CustomRequest;
        UserService.get()
            .getAll(req.query, customReq.context.skip, customReq.context.limit)
            .then(users => {
                res.status(httpStatus.OK).send(users);
            })
            .catch(next);
    }

    get(req: Request, res: Response, next: NextFunction): void {
        UserService.get()
            .get(req.params.id, req.query)
            .then(user => {
                if (!user) {
                    throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'User not found');
                }
                res.status(httpStatus.OK).send(user);
            })
            .catch(next);
    }

    register(req: Request, res: Response, next: NextFunction): void {
        UserService.get()
            .create(req.body)
            .then(user => {
                res.status(httpStatus.CREATED).send(user);
            })
            .catch(next);
    }

    update(req: Request, res: Response, next: NextFunction): void {
        UserService.get()
            .update(req.params.id, req.body)
            .then(user => {
                res.status(httpStatus.OK).send(user);
            })
            .catch(next);
    }

    updateSecurity(req: Request, res: Response, next: NextFunction): void {
        UserService.get()
            .updateSecurity(req.params.id, req.body)
            .then(user => {
                res.status(httpStatus.OK).send(user);
            })
            .catch(next);
    }

    updateMe(req: Request, res: Response, next: NextFunction): void {
        const customReq = (req as any) as CustomRequest;
        UserService.get()
            .update(customReq.context.user._id, req.body)
            .then(user => {
                res.status(httpStatus.OK).send(user);
            })
            .catch(next);
    }

    remove(req: Request, res: Response, next: NextFunction): void {
        const customReq = (req as any) as CustomRequest;
        Promise.resolve()
            .then(() => {
                if (customReq.context.user._id === req.params.id) {
                    throw new CustomError(
                        CustomErrorCode.ERRBADREQUEST,
                        'Bad request : The user cannot delete himself'
                    );
                }
                return UserService.get().remove(req.params.id);
            })
            .then((result: any) => {
                if (result.n === 0) {
                    throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'User not found');
                }
                res.status(httpStatus.NO_CONTENT).send(result);
            })
            .catch(next);
    }

    addRole(req: Request, res: Response, next: NextFunction): void {
        UserService.get()
            .addRole(req.params.id, req.body.roleId)
            .then(user => {
                res.status(httpStatus.OK).send(user);
            })
            .catch(next);
    }

    removeRole(req: Request, res: Response, next: NextFunction): void {
        UserService.get()
            .removeRole(req.params.id, req.params.roleId)
            .then(user => {
                res.status(httpStatus.OK).send(user);
            })
            .catch(next);
    }

    login(req: Request, res: Response, next: NextFunction): void {
        UserService.get()
            .login(req.body)
            .then(token => {
                res.status(httpStatus.CREATED).send(token);
            })
            .catch(next);
    }

    current(req: Request, res: Response, next: NextFunction): void {
        UserService.get()
            .getCurrentUser(req.headers.authorization)
            .then(user => {
                res.status(httpStatus.OK).send(user);
            })
            .catch(next);
    }

    isTokenValid(req: Request, res: Response, next: NextFunction): void {
        UserService.get()
            .isTokenValid(req.headers.authorization)
            .then(user => {
                res.status(httpStatus.OK).send(user);
            })
            .catch(next);
    }

    isAuthorized(req: Request, res: Response, next: NextFunction): void {
        const customReq = (req as any) as CustomRequest;
        UserService.get()
            .isAuthorized(customReq.context.user, req.body)
            .then(result => {
                if (!result) {
                    throw new CustomError(CustomErrorCode.ERRFORBIDDEN, 'Access forbidden');
                }
                res.status(httpStatus.NO_CONTENT).send(result);
            })
            .catch(next);
    }

    registerMicroService(req: Request, res: Response, next: NextFunction): void {
        UserService.get()
            .createBotUser(req.body.uuid)
            .then(token => {
                res.status(httpStatus.CREATED).send(token);
            })
            .catch(next);
    }

    renewToken(req: Request, res: Response, next: NextFunction): void {
        UserService.get()
            .getBotToken(req.body.token)
            .then(token => {
                res.status(httpStatus.CREATED).send(token);
            })
            .catch(next);
    }

    requestResetPassword(req: Request, res: Response, next: NextFunction): void {
        if (!isEmail(req.body.email)) {
            throw new CustomError(CustomErrorCode.ERRBADREQUEST, 'Bad email format');
        }
        UserService.get()
            .requestResetPassword(req.body.email)
            .then(() => {
                res.status(httpStatus.NO_CONTENT).send();
            })
            .catch(next);
    }

    resetPassword(req: Request, res: Response, next: NextFunction): void {
        UserService.get()
            .resetPassword(req.body['reset-token'], req.body.password)
            .then(user => {
                res.status(httpStatus.OK).send(user);
            })
            .catch(next);
    }
}
