import { UserService } from './user.service';
import { Request, Response } from 'express';
import * as HttpStatus from 'http-status';
import { BaseResponse } from '../utils/BaseResponse';
import * as mongoose from 'mongoose';
import ObjectId = mongoose.Types.ObjectId;

export class UserController {

    getAll(req: Request, res: Response): void {
        UserService.get().getAll(req.query)
            .then(users => {
                res.status(HttpStatus.OK);
                res.send(users);
            })
            .catch(err => {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR);
                res.send(new BaseResponse(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal server error', err));
            });
    }

    get(req: Request, res: Response): void {
        UserService.get().get(new ObjectId(req.params.id) , req.query)
            .then(users => {
                res.status(HttpStatus.OK);
                res.send(users);
            })
            .catch(err => {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR);
                res.send(new BaseResponse(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal server error', err));
            });
    }
    }
}
