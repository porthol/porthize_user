export class CustomRequest extends Request {
    constructor(context: any) {
        super(context);
        this._context = {};
    }

    private _context: any = {};

    get context(): any {
        return this._context;
    }

    set context(value: any) {
        this._context = value;
    }
}
