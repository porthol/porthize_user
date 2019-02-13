import { NextFunction, Request, Response } from 'express';
import { getPackageName } from './package.helper';
import { getConfiguration } from './configuration.helper';
import { IConfigAuthorizationService } from './router.manager';
import { communicationHelper } from '../server';

const appName = getPackageName();

const config: any = getConfiguration();

const configAuthService: IConfigAuthorizationService = config[appName].authorizationService;

export function authorizationMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.headers['internal-request']) {
        next(); // todo for moment we accept that internal request has all ACL, we should not
    }
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
        .catch(next);
}
