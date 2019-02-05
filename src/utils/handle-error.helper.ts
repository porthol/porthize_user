import {Response} from 'express';
import * as httpStatus from 'http-status';
import {CustomError, CustomErrorCode, CustomErrorCodeToHttpStatus} from './custom-error';

export function handleError(err : any, res: Response) {
  if(err.constructor.name === CustomError.name) {
    res.status(CustomErrorCodeToHttpStatus(err.code))
      .send(err);
  }else{
    res.status(httpStatus.INTERNAL_SERVER_ERROR)
      .send(new CustomError(CustomErrorCode.ERRINTERNALSERVER, 'Internal Server Error', err));
  }
}
