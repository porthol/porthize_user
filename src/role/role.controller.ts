import { RoleService } from './role.service';
import { Request, Response } from 'express';
import * as httpStatus from 'http-status';
import { CustomError } from '../utils/CustomError';

export class RoleController {

    getAll(req: Request, res: Response): void {
        RoleService.get().getAll(req.query)
            .then(roles => {
                res.status(httpStatus.OK)
                    .send(roles);
            })
            .catch(err => {
                res.status(httpStatus.INTERNAL_SERVER_ERROR)
                    .send(new CustomError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error', err));
            });
    }

    get(req: Request, res: Response): void {
        RoleService.get().get(req.params.id, req.query)
            .then(role => {
                if (!role) {
                    res.status(httpStatus.NOT_FOUND)
                        .send(new CustomError(404, 'Role not found'));
                } else {
                    res.status(httpStatus.OK)
                        .send(role);
                }
            })
            .catch(err => {
                res.status(httpStatus.INTERNAL_SERVER_ERROR)
                    .send(new CustomError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error', err));
            });
    }

    create(req: Request, res: Response): void {
        RoleService.get().create(req.body)
            .then(role => {
                res.status(httpStatus.CREATED)
                    .send(role);
            })
            .catch(err => {
                res.status(httpStatus.BAD_REQUEST)
                    .send(new CustomError(httpStatus.INTERNAL_SERVER_ERROR, 'Bad request', err));
            });
    }

    update(req: Request, res: Response): void {
        RoleService.get().update(req.params.id, req.body)
            .then(result => {
                if (result.nModified === 0) {
                    res.status(httpStatus.NOT_FOUND)
                        .send(new CustomError(404, 'Role not found'));
                } else {
                    // todo we should send back the role modified
                    res.status(httpStatus.OK)
                        .send(req.body);
                }
            })
            .catch(err => {
                res.status(httpStatus.BAD_REQUEST)
                    .send(new CustomError(httpStatus.BAD_REQUEST, 'Bad request', err));
            });
    }

    remove(req: Request, res: Response): void {
        RoleService.get().delete(req.params.id)
            .then(result => {
                if (result.n === 0) {
                    res.status(httpStatus.NOT_FOUND)
                        .send(new CustomError(404, 'Role not found'));
                } else {
                    res.status(httpStatus.NO_CONTENT)
                        .send(result);
                }
            })
            .catch(err => {
                res.status(httpStatus.BAD_REQUEST)
                    .send(new CustomError(httpStatus.BAD_REQUEST, 'Bad request', err));
            });
    }
}
