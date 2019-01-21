import * as httpStatus from 'http-status';

export enum CustomErrorCode {

    'ERRNOTFOUND','ERRBADREQUEST','ERRINTERNALSERVER', 'ERRNOCONF'
}

export function CustomErrorCodeToHttpStatus(code: CustomErrorCode) {
    switch (code) {
        case CustomErrorCode.ERRNOTFOUND:{
            return httpStatus.NOT_FOUND;
            break;
        }
        case CustomErrorCode.ERRBADREQUEST: {
            return httpStatus.BAD_REQUEST;
        }
        case CustomErrorCode.ERRINTERNALSERVER: {
            return httpStatus.INTERNAL_SERVER_ERROR;
        }
        default: {
            return httpStatus.INTERNAL_SERVER_ERROR;
        }
    }
}


export class CustomError {
    code: CustomErrorCode;
    message: string;
    cause: any;

    constructor(code: CustomErrorCode, message: string, cause?: any) {
        this.code = code;
        this.message = message;
        this.cause = cause;
    }
}
