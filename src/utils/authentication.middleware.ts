import { NextFunction, Request, Response } from 'express';
import { communicationHelper } from '../server';
import { getPackageName } from './package.helper';
import { getConfiguration } from './configuration.helper';

const appName = getPackageName();

const config: any = getConfiguration();

export function authenticationMiddleware(req: Request, res: Response, next: NextFunction) {
    communicationHelper
        .get(config[appName].authorizationService.authenticationRoute, {
            authorization: req.headers.authorization,
            workspace: req.headers.workspace.toString()
        })
        .then(() => next())
        .catch(next);
}
