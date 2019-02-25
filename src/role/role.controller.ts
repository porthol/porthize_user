import { RoleService } from './role.service';
import { NextFunction, Request, Response } from 'express';
import * as httpStatus from 'http-status';
import { CustomError, CustomErrorCode } from '../utils/custom-error';

export class RoleController {
    getAll(req: Request, res: Response, next: NextFunction): void {
        RoleService.get(req.headers.workspace.toString())
            .getAll(req.query)
            .then(roles => {
                res.status(httpStatus.OK).send(roles);
            })
            .catch(next);
    }

    get(req: Request, res: Response, next: NextFunction): void {
        RoleService.get(req.headers.workspace.toString())
            .get(req.params.id, req.query)
            .then(role => {
                if (!role) {
                    throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Role not found');
                } else {
                    res.status(httpStatus.OK).send(role);
                }
            })
            .catch(next);
    }

    create(req: Request, res: Response, next: NextFunction): void {
        RoleService.get(req.headers.workspace.toString())
            .create(req.body)
            .then(role => {
                res.status(httpStatus.CREATED).send(role);
            })
            .catch(next);
    }

    update(req: Request, res: Response, next: NextFunction): void {
        RoleService.get(req.headers.workspace.toString())
            .update(req.params.id, req.body)
            .then(role => {
                res.status(httpStatus.OK).send(role);
            })
            .catch(next);
    }

    remove(req: Request, res: Response, next: NextFunction): void {
        RoleService.get(req.headers.workspace.toString())
            .delete(req.params.id)
            .then(result => {
                if (result.n === 0) {
                    throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Role not found');
                } else {
                    res.status(httpStatus.NO_CONTENT).send(result);
                }
            })
            .catch(next);
    }

    addPrivilege(req: Request, res: Response, next: NextFunction): void {
        RoleService.get(req.headers.workspace.toString())
            .addPrivilege(req.params.id, req.body)
            .then(role => {
                res.status(httpStatus.OK).send(role);
            })
            .catch(next);
    }

    removePrivilege(req: Request, res: Response, next: NextFunction): void {
        RoleService.get(req.headers.workspace.toString())
            .removePrivilege(req.params.id, req.params.privilegeId)
            .then(role => {
                res.status(httpStatus.OK).send(role);
            })
            .catch(next);
    }

    importPrivilege(req: Request, res: Response, next: NextFunction): void {
        RoleService.get(req.headers.workspace.toString())
            .importPrivilege(req.body)
            .then(() => {
                res.status(httpStatus.NO_CONTENT).send();
            })
            .catch(next);
    }
}
