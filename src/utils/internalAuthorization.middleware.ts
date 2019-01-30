import { NextFunction, Request, Response } from 'express';
import { CustomError, CustomErrorCode } from './CustomError';

export function internalAuthorizationMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const user = (req as any).user;

        if (!user) {
            throw new CustomError(CustomErrorCode.ERRUNAUTHORIZED, 'The user has not been authenticated');
        }
        if (req.headers['internal-request']) {
            console.log('headers is present');
            console.log(req.headers['internal-request']);
        }

        next();
    }catch (err){
        next(err);
    }
}
