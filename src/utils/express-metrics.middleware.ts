import { NextFunction, Request, Response } from 'express';
import { configureLogger, defaultWinstonLoggerOptions, getLogger } from './logger';
import * as winston from 'winston';
import { CustomRequest } from './custom-request';

export function expressMetricsMiddleware(req: Request, res: Response, next: NextFunction) {
    const customReq = (req as any) as CustomRequest;
    const end: {
        (cb?: () => void): void;
        (chunk: any, cb?: () => void): void;
        (chunk: any, encoding?: string, cb?: () => void): void;
    } = res.end;

    // res.end = (chunk?: any, encodingOrCb?: string | (() => void), cb?: () => void) => {
    (res as any).end = (chunk: any, encoding?: string): void => {
        try {
            configureLogger('metrics', defaultWinstonLoggerOptions);

            // Get logger now because fail may occurs if configureLogger() was not yet called
            const logger: winston.Logger = getLogger('metrics');

            // Calculate response time
            let responseTimeInMs: number;
            if (customReq.context.startTime) {
                responseTimeInMs = new Date().getTime() - customReq.context.startTime;
            }

            let body: any = {};
            if (req.body) {
                body = req.body;
            }

            // Determine log level
            let level: string = 'info';

            if (res.statusCode >= 100) {
                level = 'info';
            }
            if (res.statusCode >= 400) {
                level = 'warn';
            }
            if (res.statusCode >= 500) {
                level = 'error';
            }

            // Extract useful data from request
            const url: string = req.originalUrl || req.url;
            const method: string = req.method;

            // Tell winston to print message
            logger.log(
                level,
                JSON.stringify({
                    statusCode: res.statusCode,
                    responseTimeInMs,
                    body,
                    method,
                    url,
                    headers: req.headers
                })
            );
        } catch (err) {
            // tslint:disable
            console.log('Cannot print log for this request', err);
        }
        end.call(res, chunk, encoding);
    };
    next();
}

export function addStartTime(req: Request, res: Response, next: NextFunction) {
    const customReq = (req as any) as CustomRequest;
    customReq.context.startTime = new Date().getTime();
    next();
}
