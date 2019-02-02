import { Document } from 'mongoose';

export interface IRoute {
    method: string;
    url: string;
    regexp?: RegExp;
}

export interface IPrivilege extends Document {
    resource: string;
    actionsAvailable: {
        [action: string]: IRoute[]
    };
}

export interface IPrivilegeEmmbedded extends Document{
    resource: string;
    actions: string[];
}
