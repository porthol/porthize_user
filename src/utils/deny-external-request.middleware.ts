import { NextFunction, Request, Response } from 'express';
import { CustomError, CustomErrorCode } from './custom-error';
import { getConfiguration } from './configuration.helper';
import { getPackageName } from './package.helper';
import { app, communicationHelper } from '../server';

const appName = getPackageName();

const config: any = getConfiguration()[appName];

export function denyExternalRequestMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        // this header is automatically remove when the request came from the nginx proxy
        if (!req.headers['internal-request']) {
            throw new CustomError(CustomErrorCode.ERRUNAUTHORIZED, 'Unauthorized route from external');
        }

        // remove /api/
        // specific for user micro service !
        if (req.originalUrl.substr(5) === config.authorizationService.registerAppRoute) {
            next();
            return;
        }

        const uuid = req.headers['internal-request'].toString();

        communicationHelper
            .get(
                config.authorizationService.internalRequestRoute.replace('{uuid}', uuid),
                {
                    'internal-request': app.uuid
                },
                null,
                true
            )
            .then(() => next())
            .catch(next);
    } catch (err) {
        next(err);
    }
}
