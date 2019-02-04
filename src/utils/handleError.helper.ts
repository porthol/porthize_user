import { Response } from 'express';
import * as httpStatus from 'http-status';
import { CustomError, CustomErrorCode, CustomErrorCodeToHttpStatus } from './CustomError';
import { JsonWebTokenError } from 'jsonwebtoken';
import { ValidationError } from 'ajv';
import { MongoError } from 'mongodb';

export function handleError(err: any, res: Response) {
    if (err instanceof JsonWebTokenError) {
        err = new CustomError(CustomErrorCode.ERRBADREQUEST, 'Json Web Token Error', err);
    }
    if (err.name === ValidationError.name) {
        err = new CustomError(CustomErrorCode.ERRBADREQUEST, 'Validation Error : ' + err.message, err);
    }
    if (err.name === MongoError.name && err.code === 11000) {
        err = new CustomError(CustomErrorCode.ERRBADREQUEST, 'Validation Error : ' + err.message, err);
    }
    if (err.constructor.name === CustomError.name) {
        res.status(CustomErrorCodeToHttpStatus(err.code))
            .send(err);
    } else {
        res.status(httpStatus.INTERNAL_SERVER_ERROR)
            .send(new CustomError(CustomErrorCode.ERRINTERNALSERVER, 'Internal Server Error', err));
    }
}
