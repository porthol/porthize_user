import { NextFunction, Request, Response } from 'express';
import { getPackageName } from './package.helper';
import { getConfiguration } from './configuration.helper';
import { communicationHelper } from '../server';

const appName = getPackageName();

const config: any = getConfiguration();

export function authorizationMiddleware(req: Request, res: Response, next: NextFunction) {
    communicationHelper
        .post(
            config[appName].authorizationService.authorizationRoute,
            {
                authorization: req.headers.authorization,
                workspace: req.headers.workspace.toString()
            },
            {
                method: req.method,
                url: req.originalUrl.substr(4) // remove /api
            }
        )
        .then(() => next())
        .catch(next);
}
