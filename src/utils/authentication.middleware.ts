import { NextFunction, Request, Response } from 'express';
import { communicationHelper } from '../server';
import { getPackageName } from './package.helper';
import { getConfiguration } from './configuration.helper';
import { CustomRequest } from './custom-request';

const appName = getPackageName();

const config: any = getConfiguration();

export function authenticationMiddleware(req: Request, res: Response, next: NextFunction) {
    const customReq = (req as any) as CustomRequest;

    communicationHelper
        .get(config[appName].authorizationService.authenticationRoute, {
            authorization: req.headers.authorization
        })
        .then(res => {
            customReq.context.user = res.body.user;
            next();
        })
        .catch(next);
}
