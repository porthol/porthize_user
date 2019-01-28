import { RoleService } from './role.service';
import { Request, Response } from 'express';
import * as httpStatus from 'http-status';
import { CustomError, CustomErrorCode } from '../utils/CustomError';
import { handleError } from '../utils/handleErrorHelper';

export class RoleController {

    getAll(req: Request, res: Response): void {
        RoleService.get().getAll(req.query)
            .then(roles => {
                res.status(httpStatus.OK)
                    .send(roles);
            })
            .catch(err => {
                handleError(err, res);
            });
    }

    get(req: Request, res: Response): void {
        RoleService.get().get(req.params.id, req.query)
            .then(role => {
                if (!role) {
                    throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Role not found');
                } else {
                    res.status(httpStatus.OK)
                        .send(role);
                }
            })
            .catch(err => {
                handleError(err, res);
            });
    }

    create(req: Request, res: Response): void {
        RoleService.get().create(req.body)
            .then(role => {
                res.status(httpStatus.CREATED)
                    .send(role);
            })
            .catch(err => {
                handleError(err, res);
            });
    }

    update(req: Request, res: Response): void {
        RoleService.get().update(req.params.id, req.body)
            .then(role => {
                res.status(httpStatus.OK)
                    .send(role);
            })
            .catch(err => {
                handleError(err, res);
            });
    }

    remove(req: Request, res: Response): void {
        RoleService.get().delete(req.params.id)
            .then(result => {
                if (result.n === 0) {
                    throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Role not found');
                } else {
                    res.status(httpStatus.NO_CONTENT)
                        .send(result);
                }
            })
            .catch(err => {
                handleError(err, res);
            });
    }

    addPrivilege(req: Request, res: Response): void {
        RoleService.get().addPrivilege(req.params.id, req.body.privilegeId)
            .then(role => {
                res.status(httpStatus.OK)
                    .send(role);
            })
            .catch(err => {
                handleError(err, res);
            });
    }

    removePrivilege(req: Request, res: Response): void {
        RoleService.get().removePrivilege(req.params.id, req.params.privilegeId)
            .then(role => {
                res.status(httpStatus.OK)
                    .send(role);
            })
            .catch(err => {
                handleError(err, res);
            });
    }
}
