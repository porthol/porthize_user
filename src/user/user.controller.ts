import { UserService } from './user.service';
import { Request, Response } from 'express';
import * as httpStatus from 'http-status';
import { CustomError } from '../utils/CustomError';

export class UserController {

    getAll(req: Request, res: Response): void {
        UserService.get().getAll(req.query)
            .then(users => {
                res.status(httpStatus.OK)
                    .send(users);
            })
            .catch(err => {
                res.status(httpStatus.INTERNAL_SERVER_ERROR)
                    .send(new CustomError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error', err));
            });
    }

    get(req: Request, res: Response): void {
        UserService.get().get(req.params.id , req.query)
            .then(user => {
                if(!user){
                    res.status(httpStatus.NOT_FOUND)
                        .send(new CustomError(404, 'User not found'));
                }else{
                    res.status(httpStatus.OK)
                        .send(user);
                }
            })
            .catch(err => {
                res.status(httpStatus.INTERNAL_SERVER_ERROR)
                    .send(new CustomError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error', err));
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
                    .send(new CustomError(httpStatus.INTERNAL_SERVER_ERROR, 'Bad request', err));
            });
    }

    update(req: Request, res: Response): void {
        UserService.get().update(req.params.id,req.body)
            .then(result => {
                if(result.nModified === 0){
                    res.status(httpStatus.NOT_FOUND)
                        .send(new CustomError(404, 'User not found'));
                }else{
                    // todo we should send back the user modified
                    res.status(httpStatus.OK)
                        .send(req.body);
                }
            })
            .catch(err => {
                res.status(httpStatus.BAD_REQUEST)
                    .send(new CustomError(httpStatus.BAD_REQUEST, 'Bad request', err));
            });
    }

    delete(req: Request, res: Response): void{
        UserService.get().delete(req.params.id)
            .then(result => {
                if(result.n === 0){
                    res.status(httpStatus.NOT_FOUND)
                        .send(new CustomError(404, 'User not found'));
                }else{
                    res.status(httpStatus.NO_CONTENT)
                        .send(result);
                }
            })
            .catch(err => {
                res.status(httpStatus.BAD_REQUEST)
                    .send(new CustomError(httpStatus.BAD_REQUEST, 'Bad request', err));
            });
    }

    addRole(req: Request, res: Response): void{
                res.status(httpStatus.BAD_REQUEST)
                    .send(new CustomError(httpStatus.BAD_REQUEST, 'Bad request', err));
    }

    removeRole(req: Request, res: Response): void{
                res.status(httpStatus.BAD_REQUEST)
                    .send(new CustomError(httpStatus.BAD_REQUEST, 'Bad request', err));
    }
}
