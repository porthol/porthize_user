import { model, Schema } from 'mongoose';
import { IRole } from './role.document';
import { PrivilegeSchema } from '../privilege';


export const RoleSchema = new Schema({
    key: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    privileges: {
        type: [PrivilegeSchema]
    }
});

export const RoleModel = model<IRole>('role', RoleSchema, 'roles');
