import { Document } from 'mongoose';

export interface IRoute {
    method: string;
    url: string;
}

export interface IPrivilege extends Document {
    resource: string;
    actionsAvailable: {
        [action: string]: IRoute[]
    };
}
