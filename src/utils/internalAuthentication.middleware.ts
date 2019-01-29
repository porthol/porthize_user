import { NextFunction, Request, Response } from 'express';
import { UserService } from '../user';


export function internalAuthenticationMiddleware(req: Request, res: Response, next: NextFunction) {
    UserService.get().isTokenValid(req.headers.authorization)
        .then(user => {
            (req as any).user = user;
            next();
        })
        .catch(next);
}
