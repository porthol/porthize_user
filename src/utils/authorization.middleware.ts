import { NextFunction, Request, Response } from 'express';
import { getPackageName } from './package.helper';
import { getConfiguration } from './configuration.helper';
import { IConfigAuthorizationService } from './router.manager';
import { communicationHelper } from '../server';
import { CustomError, CustomErrorCode } from './custom-error';

const appName = getPackageName();

const config: any = getConfiguration();

const configAuthService: IConfigAuthorizationService = config[appName].authorizationService;

export function authorizationMiddleware(req: Request, res: Response, next: NextFunction) {
    communicationHelper.post(
        configAuthService.name,
        configAuthService.authorizationRoute,
        {
            authorization: req.headers.authorization
        },
        {
            method: req.method,
            url: req.originalUrl.substr(4) // remove /api
        })
        .then(() => next())
        .catch(err => {
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
            next(err);
        });
}
