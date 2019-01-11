import { UserService } from './user.service';
import { Request, Response } from 'express';
import * as httpStatus from 'http-status';
import { BaseResponse } from '../utils/BaseResponse';
import * as mongoose from 'mongoose';
import ObjectId = mongoose.Types.ObjectId;

export class UserController {

    getAll(req: Request, res: Response): void {
        UserService.get().getAll(req.query)
            .then(users => {
                res.status(httpStatus.OK)
                    .send(users);
            })
            .catch(err => {
                res.status(httpStatus.INTERNAL_SERVER_ERROR)
                    .send(new BaseResponse(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error', err));
            });
    }

    get(req: Request, res: Response): void {
        UserService.get().get(new ObjectId(req.params.id) , req.query)
            .then(user => {
                if(!user){
                    res.status(httpStatus.NOT_FOUND)
                        .send(new BaseResponse(404, 'User not found', null));
                }else{
                    res.status(httpStatus.OK)
                        .send(user);
                }
            })
            .catch(err => {
                res.status(httpStatus.INTERNAL_SERVER_ERROR)
                    .send(new BaseResponse(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error', err));
            });
    }

    register(req: Request, res: Response): void {
        UserService.get().create(req.body)
            .then(user => {
                res.status(httpStatus.CREATED)
                    .send(user);
            })
            .catch(err => {
                res.status(httpStatus.BAD_REQUEST)
                    .send(new BaseResponse(httpStatus.INTERNAL_SERVER_ERROR, 'BAD_REQUEST', err));
            });
    }
}
