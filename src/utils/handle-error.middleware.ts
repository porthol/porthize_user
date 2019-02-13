import { NextFunction, Request, Response } from 'express';
import { CustomError, CustomErrorCode, CustomErrorCodeToHttpStatus } from './custom-error';
import * as httpStatus from 'http-status';


export function handleErrorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
    // todo when authorization service is down the error is too verbose
    if (err.statusCode) {
        switch (err.statusCode) {
            case 400:
                err = new CustomError(CustomErrorCode.ERRBADREQUEST, 'Bad request');
                break;
            case 401:
                err = new CustomError(CustomErrorCode.ERRUNAUTHORIZED, 'Unauthorized');
                break;
            case 403:
                err = new CustomError(CustomErrorCode.ERRFORBIDDEN, 'Forbidden');
                break;
            case 404:
                err = new CustomError(CustomErrorCode.ERRNOTFOUND, 'Not found');
                break;
            default:
                err = new CustomError(CustomErrorCode.ERRINTERNALSERVER, 'Internal server error');
                break;
        }
    }
    if (err.constructor.name === CustomError.name) {
        res.status(CustomErrorCodeToHttpStatus(err.code))
            .send(err);
    } else {
        res.status(httpStatus.INTERNAL_SERVER_ERROR)
            .send(new CustomError(CustomErrorCode.ERRINTERNALSERVER, 'Internal Server Error', err));
    }
}
