import { NextFunction, Request, Response } from 'express';
import { communicationHelper } from '../server';
import { getPackageName } from './package.helper';
import { getConfiguration } from './configuration.helper';
import { IConfigAuthorizationService } from './router.manager';
import { CustomError, CustomErrorCode } from './CustomError';


const appName = getPackageName();

const config: any = getConfiguration();

const configAuthService: IConfigAuthorizationService = config[appName].authorizationService;

export function authenticationMiddleware(req: Request, res: Response, next: NextFunction) {
    communicationHelper.get(
        configAuthService.name,
        configAuthService.authenticationRoute,
        {
            authorization: req.headers.authorization
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
