import { NextFunction, Request, Response } from 'express';
import { handleError } from './handle-error.helper';


export function handleErrorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
    handleError(err, res);
}
