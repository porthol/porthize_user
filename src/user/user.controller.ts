import { UserService } from './user.service';
import { Request, Response } from 'express';
import * as HttpStatus from 'http-status';
import { BaseResponse } from '../utils/BaseResponse';

export class UserController {

    getAll(req: Request, res: Response): void {
        UserService.get().getAll(req.body)
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
