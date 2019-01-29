import { NextFunction, Request, Response } from 'express';
import { handleError } from './handleError.helper';


export function handleErrorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  console.log('they call me ');
  handleError(err, res);
}
