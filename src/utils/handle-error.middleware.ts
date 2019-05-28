import { NextFunction, Request, Response } from 'express';
import { CustomError, CustomErrorCode, CustomErrorCodeToHttpStatus } from './custom-error';
import * as httpStatus from 'http-status';
import { ValidationError } from 'ajv';
import { MongoError } from 'mongodb';
import { StatusCodeError } from 'request-promise/errors';
import * as winston from 'winston';
import { configureLogger, defaultWinstonLoggerOptions, getLogger } from './logger';

export function handleErrorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
    configureLogger('apiError', defaultWinstonLoggerOptions);
    const logger: winston.Logger = getLogger('apiError');

    // todo when authorization service is down the error is too verbose
    if (err.name === ValidationError.name) {
        err = new CustomError(CustomErrorCode.ERRBADREQUEST, 'Validation Error : ' + err.message, err);
    }
    if (err.name === 'JsonSchemaValidationError') {
        err = new CustomError(CustomErrorCode.ERRBADREQUEST, 'Validation Error : ' + err.message, err);
    }
    if (err.name === MongoError.name && err.code === 11000) {
        err = new CustomError(CustomErrorCode.ERRBADREQUEST, 'Validation Error : ' + err.message, err);
    }
    if (err.statusCode) {
        if (err.name === StatusCodeError.name && err.response.headers['content-type'].match('application/json')) {
            err = err.response.body;
        } else {
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
    }
    logger.log('error', err);

    if (err.name === CustomError.name) {
        res.status(CustomErrorCodeToHttpStatus(err.code)).send(err);
    } else {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(
            new CustomError(CustomErrorCode.ERRINTERNALSERVER, 'Internal Server Error', err)
        );
    }
}
