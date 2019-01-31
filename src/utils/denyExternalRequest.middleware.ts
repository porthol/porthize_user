import {NextFunction, Request, Response} from 'express';
import {CustomError, CustomErrorCode} from './CustomError';

// todo check the content of the authorize. By Ip ? By asking traefik ? Registering ip ? Shared secret ?
export function denyExternalRequestMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        // this header is automatically remove when the request came from the nginx proxy
        if (!req.headers['internal-request']) {
            throw new CustomError(CustomErrorCode.ERRUNAUTHORIZED, 'Unauthorized route from external');
        }

        next();
    } catch (err) {
        next(err);
    }
}
