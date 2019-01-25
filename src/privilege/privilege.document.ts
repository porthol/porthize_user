import { Document } from 'mongoose';

export interface IPrivilege extends Document {
    resource: string;
    actions: string[];
}
