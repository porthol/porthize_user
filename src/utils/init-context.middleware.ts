import { NextFunction, Request, Response } from 'express';
import { CustomRequest } from './custom-request';

// we move out limit and skip from query to keep criteria search
export function initContextMiddleware(req: Request, res: Response, next: NextFunction) {
    const customReq = (req as any) as CustomRequest;

    customReq.context = {};

    next();
}
