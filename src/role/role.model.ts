import { Schema } from 'mongoose';

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
