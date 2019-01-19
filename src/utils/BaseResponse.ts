
export class BaseResponse {
    code : number;
    message: string;
    cause: any;


    constructor(code: number, message: string, cause?: any) {
        this.code = code;
        this.message = message;
        this.cause = cause;
    }
}
