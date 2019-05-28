import { NextFunction, Request, Response } from 'express';
import { getPackageName } from './package.helper';
import { getConfiguration } from './configuration.helper';
import { CustomRequest } from './CustomRequest';

const appName = getPackageName();

const config: any = getConfiguration()[appName];

// we move out limit and skip from query to keep criteria search
export function pagingMiddleware(req: Request, res: Response, next: NextFunction) {
    const customReq = (req as any) as CustomRequest;

    if (req.query.skip) {
        customReq.context.skip = parseInt(req.query.skip, 10);
    } else {
        customReq.context.skip = 0;
    }

    if (req.query.limit) {
        customReq.context.limit = parseInt(req.query.limit, 10);
        if (customReq.context.limit > config.paging.limitMax) {
            customReq.context.limit = config.paging.limitMax;
        }
    } else {
        customReq.context.limit = config.paging.defaultValue;
    }

    delete req.query.skip;
    delete req.query.limit;
    next();
}
