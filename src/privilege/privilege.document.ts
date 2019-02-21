import { Document } from 'mongoose';

export interface IRouteEmbedded {
    method: string;
    url: string;
    regexp?: RegExp;
}

export interface IPrivilege extends Document {
    resource: string;
    actionsAvailable: {
        [action: string]: IRouteEmbedded[]
    };
}

export interface IPrivilegeEmbedded extends Document {
    resource: string;
    actions: string[];
}
