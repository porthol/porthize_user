import { Document } from 'mongoose';
import { IPrivilegeEmmbedded } from '../privilege/privilege.document';

export interface IRole extends Document {
    key: string;
    name: string;
    privileges: IPrivilegeEmmbedded[];
}
