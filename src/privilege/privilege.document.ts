import { Document } from 'mongoose';

export interface IPrivilege extends Document {
    resource: string;
    actionsAvailable: {
        [action: string]: string[]
    };
}
