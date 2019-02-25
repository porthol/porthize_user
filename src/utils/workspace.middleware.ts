import { NextFunction, Request, Response } from 'express';
import { CustomError, CustomErrorCode } from './custom-error';
import { Workspace } from './workspace';
import { configureLogger, defaultWinstonLoggerOptions, getLogger } from './logger';

configureLogger('workspace-middleware', defaultWinstonLoggerOptions);

export function workspaceMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.workspace) {
        next(new CustomError(CustomErrorCode.ERRBADREQUEST, 'No workspace specified'));
    }
    const ws = req.headers.workspace.toString();

    if (!Workspace.getWorkspaceLocally(ws)) {
        Workspace.workspaceExist(ws)
            .then(() => {
                getLogger('workspace-middleware').log('warn', 'New workspace detected in header and not found localy');
                const workspace = new Workspace(ws);

                return workspace.init();
            })
            .then(next)
            .catch(next);
    } else {
        next();
    }
}
