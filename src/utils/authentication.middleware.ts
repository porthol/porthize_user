import { NextFunction, Request, Response } from 'express';
import { communicationHelper } from '../server';
import { getPackageName } from './package.helper';
import { getConfiguration } from './configuration.helper';
import { IConfigAuthorizationService } from './router.manager';

const appName = getPackageName();

const config: any = getConfiguration();

const configAuthService: IConfigAuthorizationService =
    config[appName].authorizationService;

export function authenticationMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    communicationHelper
        .get(configAuthService.authenticationRoute, {
            authorization: req.headers.authorization
        })
        .then(() => next())
        .catch(next);
}
