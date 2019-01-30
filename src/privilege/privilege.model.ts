import { model, Schema } from 'mongoose';
import { IPrivilege } from './privilege.document';

export const PrivilegeSchema = new Schema({
    resource: {
        type: String,
        required: true,
        unique : true
    },
    actionsAvailable: {
        type: Object,
        default: {},
        required: true
    }
});

export const PrivilegeModel = model<IPrivilege>('privilege', PrivilegeSchema, 'privileges');
