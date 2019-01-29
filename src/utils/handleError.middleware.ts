import { NextFunction, Request, Response } from 'express';
import { handleError } from './handleError.helper';
import { JsonWebTokenError } from 'jsonwebtoken';
import { CustomError, CustomErrorCode } from './CustomError';


export function handleErrorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof JsonWebTokenError) {
        err = new CustomError(CustomErrorCode.ERRBADREQUEST, 'Json Web Token Error', err);
    }
    handleError(err, res);
}
