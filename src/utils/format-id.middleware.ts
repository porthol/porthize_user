import { NextFunction, Request, Response } from 'express';
import { getPackageName } from './package.helper';
import { getConfiguration } from './configuration.helper';
import { CustomError, CustomErrorCode } from './custom-error';

const appName = getPackageName();
const config: any = getConfiguration()[appName];

export function controlFormatIdMiddleware(req: Request, res: Response, next: NextFunction) {
    if (config.controlFormatMongoId) {
        if (req.params.id && !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new CustomError(CustomErrorCode.ERRBADREQUEST, 'Bad format Id', {});
        }
    }

    next();
}
