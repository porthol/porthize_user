import { NextFunction, Request, Response } from 'express';
import { UserService } from '../user/user.service';
import { CustomRequest } from './custom-request';

export function internalAuthenticationMiddleware(req: Request, res: Response, next: NextFunction) {
    const customReq = (req as any) as CustomRequest;

    UserService.get()
        .getCurrentUser(req.headers.authorization)
        .then(user => {
            customReq.context.user = user;
            next();
        })
        .catch(next);
}
