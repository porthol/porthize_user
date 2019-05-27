import { NextFunction, Request, Response } from 'express';
import { CustomError, CustomErrorCode } from './custom-error';
import { UserService } from '../user/user.service';

export function internalDenyExternalRequestMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        // this header is automatically remove when the request came from the nginx proxy
        if (!req.headers['internal-request']) {
            throw new CustomError(CustomErrorCode.ERRUNAUTHORIZED, 'Unauthorized route from external');
        }
        const uuid = req.headers['internal-request'].toString();

        UserService.get()
            .get(null, { username: uuid, enabled: true })
            .then(user => {
                next();
            })
            .catch(next);
    } catch (err) {
        next(err);
    }
}
