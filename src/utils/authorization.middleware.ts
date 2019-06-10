import { NextFunction, Request, Response } from 'express';
import { getPackageName } from './package.helper';
import { getConfiguration } from './configuration.helper';
import { communicationHelper } from '../server';
import { CustomError, CustomErrorCode } from './custom-error';
import { configureLogger, defaultWinstonLoggerOptions, getLogger } from './logger';

configureLogger('authorization-middleware', defaultWinstonLoggerOptions);
const logger = getLogger('authorization-middleware');

const appName = getPackageName();

const config: any = getConfiguration();

export function authorizationMiddleware(req: Request, res: Response, next: NextFunction) {
    communicationHelper
        .post(
            config[appName].authorizationService.authorizationRoute,
            {
                authorization: req.headers.authorization
            },
            {
                method: req.method,
                url: req.originalUrl.substr(4) // remove /api
            }
        )
        .then(() => next())
        .catch(err => {
            logger.log('error', err.message);
            next(new CustomError(CustomErrorCode.ERRUNAUTHORIZED, 'Unauthorized'));
        });
}
