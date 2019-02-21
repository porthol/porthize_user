import { NextFunction, Request, Response } from 'express';
import { UserService } from '../user/user.service';

export function internalAuthenticationMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    UserService.get()
        .getCurrentUser(req.headers.authorization)
        .then(user => {
            (req as any).user = user;
            next();
        })
        .catch(next);
}
