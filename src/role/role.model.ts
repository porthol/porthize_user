import { model, Schema } from 'mongoose';
import { IRole } from './role.document';


export const RoleSchema = new Schema({
    key: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

export const RoleModel = model<IRole>('Role', RoleSchema, 'roles');
