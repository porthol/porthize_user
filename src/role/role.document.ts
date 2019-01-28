import { Document } from 'mongoose';
import { IPrivilege } from '../privilege/privilege.document';

export interface IRole extends Document {
    key: string;
    name: string;
    privileges: IPrivilege[];
}
