import { PrivilegeService } from './privilege.service';
import { NextFunction, Request, Response } from 'express';
import * as httpStatus from 'http-status';
import { CustomError, CustomErrorCode } from '../utils/custom-error';
import { CustomRequest } from '../utils/custom-request';

export class PrivilegeController {
    getAll(req: Request, res: Response, next: NextFunction): void {
        const customReq = (req as any) as CustomRequest;
        PrivilegeService.get()
            .getAll(req.query, customReq.context.skip, customReq.context.limit)
            .then(privileges => {
                res.status(httpStatus.OK).send(privileges);
            })
            .catch(next);
    }

    get(req: Request, res: Response, next: NextFunction): void {
        PrivilegeService.get()
            .get(req.params.id, req.query)
            .then(privilege => {
                if (!privilege) {
                    throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Privilege not found');
                }
                res.status(httpStatus.OK).send(privilege);
            })
            .catch(next);
    }

    create(req: Request, res: Response, next: NextFunction): void {
        PrivilegeService.get()
            .create(req.body)
            .then(privilege => {
                res.status(httpStatus.CREATED).send(privilege);
            })
            .catch(next);
    }

    update(req: Request, res: Response, next: NextFunction): void {
        PrivilegeService.get()
            .update(req.params.id, req.body)
            .then(privilege => {
                res.status(httpStatus.OK).send(privilege);
            })
            .catch(next);
    }

    remove(req: Request, res: Response, next: NextFunction): void {
        PrivilegeService.get()
            .delete(req.params.id)
            .then(result => {
                if (result.n === 0) {
                    throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Privilege not found');
                }
                res.status(httpStatus.NO_CONTENT).send(result);
            })
            .catch(next);
    }

    addRoutes(req: Request, res: Response, next: NextFunction): void {
        PrivilegeService.get()
            .addRoutes(req.params.resource, req.body.action, req.body.routes)
            .then(privilege => {
                res.status(httpStatus.OK).send(privilege);
            })
            .catch(next);
    }
}
