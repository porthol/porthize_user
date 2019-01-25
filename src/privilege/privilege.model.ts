import { model, Schema } from 'mongoose';
import { IPrivilege } from './privilege.document';

export const PrivilegeSchema = new Schema({
    resource: {
        type: String,
        required: true
    },
    actions: {
        type: [String],
        default: []
    }
});

export const PrivilegeModel = model<IPrivilege>('Privilege', PrivilegeSchema, 'privileges');
