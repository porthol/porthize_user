import { NextFunction, Request, Response } from 'express';
import { CustomError, CustomErrorCode } from './custom-error';
import { Workspace } from './workspace';
import { configureLogger, defaultWinstonLoggerOptions, getLogger } from './logger';

configureLogger('workspace-middleware', defaultWinstonLoggerOptions);

export function workspaceMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        if (req.path === '/api/health') {
            next();
            return;
        }
        if (!req.headers.workspace) {
            throw new CustomError(CustomErrorCode.ERRBADREQUEST, 'No workspace specified');
        }
        const ws = req.headers.workspace.toString();

        if (!Workspace.getWorkspaceLocally(ws)) {
            Workspace.workspaceExist(ws)
                .then(() => {
                    getLogger('workspace-middleware').log(
                        'warn',
                        'New workspace detected in header and not found locally'
                    );
                    const workspace = new Workspace(ws);

                    return workspace.init();
                })
                .then(next)
                .catch(next);
        } else {
            next();
        }
    } catch (err) {
        next(err);
    }
}
