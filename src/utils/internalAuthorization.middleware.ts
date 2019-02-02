import { NextFunction, Request, Response } from 'express';
import { CustomError, CustomErrorCode } from './CustomError';
import { UserService } from '../user/user.service';

export function internalAuthorizationMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const user = (req as any).user;

        if (!user) {
            throw new CustomError(CustomErrorCode.ERRUNAUTHORIZED, 'The user has not been authenticated');
        }

        UserService.get().isAuthorized(user, {
            url: req.originalUrl.substr(4), // remove '/api'
            method: req.method })
            .then(result => {
                if(!result) {
                    throw new CustomError(CustomErrorCode.ERRUNAUTHORIZED, 'Unauthorized to access this resource');
                }
                next();
            })
            .catch(next);
    } catch (err) {
        next(err);
    }
}
