import { model, Schema } from 'mongoose';
import { IRole } from './role.document';

export const PrivilegeSchemaEmbedded = new Schema({
    resource: {
        type: String,
        required: true
    },
    actions: {
        type: [String],
        default: []
    }
});

export const RoleSchema = new Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    privileges: {
        type: [PrivilegeSchemaEmbedded]
    }
});

export const RoleModel = model<IRole>('role', RoleSchema, 'roles');
