import { Document } from 'mongoose';
import { IPrivilegeEmbedded } from '../privilege/privilege.document';

export interface IRole extends Document {
    key: string;
    name: string;
    privileges: IPrivilegeEmbedded[];
}
